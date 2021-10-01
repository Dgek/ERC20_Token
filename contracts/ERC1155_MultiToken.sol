// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/**
 * @dev {ERC1155} token, including:
 *
 *  - ability for holders to burn (destroy) their tokens
 *  - a minter role that allows for token minting (creation)
 *  - a pauser role that allows to stop all token transfers
 *
 * This contract uses {AccessControl} to lock permissioned functions using the
 * different roles - head to its documentation for details.
 *
 * The account that deploys the contract will be granted the minter and pauser
 * roles, as well as the default admin role, which will let it grant both minter
 * and pauser roles to other accounts.
 */
contract ERC1155_MultiToken is
    Initializable,
    ContextUpgradeable,
    AccessControlEnumerableUpgradeable,
    ERC1155Upgradeable,
    ERC1155PausableUpgradeable
{
    //
    // Additional roles
    //
    string private _tokenTypesUri;
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURN_ROLE = keccak256("BURN_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    //
    // Assets
    //
    uint256 public constant MINERAL = 0;
    uint256 public constant GAS = 1;
    uint256 public constant ENERGON = 2;
    uint256 public constant NFT = 3;
    /* TODO: remove as is better simplify here and store offchain
    uint256 public constant NFT_TERRAIN = 3001;
    uint256 public constant NFT_BUILDING = 3002;
    uint256 public constant NFT_UNIT = 3003;
    uint256 public constant NFT_WEAPON = 3004;
    */
    struct Asset {
        uint256 id;
        uint256 amount;
        string uri;
    }
    // Parallel asset accounting
    Asset[] private _totalAssetsSupply;
    //
    // When the NFT is minted needs to be created in the offchain database an entry with the information.
    // Ownership is deterimned by the account that holds the nft due to a parallel accounting inside of the Nft struct
    // as in the wallet of the user will just simply say that an account has 3 or 20 nfts
    // Example: https://energon.tech/{id}.json
    //
    // NFT[0] -> is a terrain, inside the json says 25x25, blah blah
    // NFT[1] -> is a weapon upgrade, inside the json says that is compatible with which weapon
    // NFT[2] -> is a unit type worker...
    // So! when minting, on-chain is stored the identifier and off-chain what really is
    //
    struct Nft {
        uint256 id;
        address owner;
        string uri;
    }
    // INFO: the first uint256 is the global mapping id when was minted
    mapping(uint256 => Nft) private _nfts;
    mapping(address => uint256[]) private _nftOwners;
    uint256 private _totalNftsSupply;

    function initialize(
        string memory uri,
        address treasury,
        address[] memory defaultOperators
    ) public virtual initializer {
        __MultiToken_init(uri);
        //
        // Setup roles
        //
        _setupRole(MINTER_ROLE, treasury);
        _setupRole(BURN_ROLE, treasury);

        for (uint256 i = 0; i < defaultOperators.length; ++i) {
            _setupRole(MINTER_ROLE, defaultOperators[i]);
            _setupRole(BURN_ROLE, defaultOperators[i]);
            setApprovalForAll(defaultOperators[i], true);
        }
        //
        // Init supply
        //
        _totalAssetsSupply.push(Asset(MINERAL, 0, super.uri(MINERAL))); // MINERAL
        _totalAssetsSupply.push(Asset(GAS, 0, super.uri(MINERAL))); // GAS
        _totalAssetsSupply.push(Asset(ENERGON, 0, super.uri(MINERAL))); // ENERGON
    }

    /**
     * @dev Grants `DEFAULT_ADMIN_ROLE`, `MINTER_ROLE`, and `PAUSER_ROLE` to the account that
     * deploys the contract.
     */
    function __MultiToken_init(string memory uri) internal initializer {
        __Context_init_unchained();
        __ERC165_init_unchained();
        __AccessControl_init_unchained();
        __AccessControlEnumerable_init_unchained();
        __ERC1155_init_unchained(uri);
        __Pausable_init_unchained();
        __ERC1155Pausable_init_unchained();

        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(MINTER_ROLE, _msgSender());
        _setupRole(PAUSER_ROLE, _msgSender());
    }

    function _checkAsset(uint256 id) internal pure {
        if (!(id == MINERAL || id == GAS || id == ENERGON)) {
            revert("MultiToken: id is not an asset");
        }
    }

    modifier onlyAssets(uint256 id) {
        _checkAsset(id);
        _;
    }

    modifier onlyAssetsInArray(uint256[] memory ids) {
        for (uint256 i = 0; i < ids.length; i++) {
            _checkAsset(ids[i]);
        }
        _;
    }

    function totalAssetsSuply() public view returns (Asset[] memory) {
        return _totalAssetsSupply;
    }

    /**
     * @dev Creates `amount` new tokens for `to`, of token type `id`.
     *
     * See {ERC1155-_mint}.
     *
     * Requirements:
     *
     * - the caller must have the `MINTER_ROLE`.
     */
    function mintAsset(
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public virtual onlyRole(MINTER_ROLE) onlyAssets(id) {
        _mint(to, id, amount, data);
        _totalAssetsSupply[id].amount += amount;
    }

    /**
     * @dev xref:ROOT:erc1155.adoc#batch-operations[Batched] variant of {mint}.
     */
    function mintAssetBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) public virtual onlyRole(MINTER_ROLE) onlyAssetsInArray(ids) {
        _mintBatch(to, ids, amounts, data);

        for (uint256 i = 0; i < ids.length; ++i) {
            _totalAssetsSupply[ids[i]].amount += amounts[i];
        }
    }

    /**
     * @dev Destroys `amount` tokens of token type `id` from `account`
     *
     * Requirements:
     *
     * - `account` cannot be the zero address.
     * - `account` must have at least `amount` tokens of token type `id`.
     * - the caller must have the `BURN_ROLE`.
     */
    function burnAsset(
        address account,
        uint256 id,
        uint256 amount
    ) public virtual onlyRole(BURN_ROLE) onlyAssets(id) {
        _burn(account, id, amount);
        _totalAssetsSupply[id].amount -= amount;
    }

    /**
     * @dev xref:ROOT:erc1155.adoc#batch-operations[Batched] version of {_burn}.
     *
     * Requirements:
     *
     * - `ids` and `amounts` must have the same length.
     * - the caller must have the `BURN_ROLE`.
     */
    function burnAssetBatch(
        address account,
        uint256[] memory ids,
        uint256[] memory amounts
    ) public virtual onlyRole(BURN_ROLE) onlyAssetsInArray(ids) {
        _burnBatch(account, ids, amounts);

        for (uint256 i = 0; i < ids.length; ++i) {
            _totalAssetsSupply[ids[i]].amount -= amounts[i];
        }
    }

    /**
     * @dev Total amount of NFTs minted, will increase when minted and decreased when burned
     *
     */
    function totalNftsSupply() public view returns (uint256) {
        return _totalNftsSupply;
    }

    /**
     * @dev See {IERC1155-balanceOf}.
     *
     * Requirements:
     *
     * - `account` cannot be the zero address.
     */
    function balanceNftsOf(address account)
        public
        view
        virtual
        returns (uint256, Nft[] memory)
    {
        require(
            account != address(0),
            "MultiToken: balance nfts query for the zero address"
        );
        uint256 numberNfts = _nftOwners[account].length;
        Nft[] memory balance = new Nft[](numberNfts);
        for (uint256 i = 0; i < numberNfts; ++i) {
            Nft memory nft = _nfts[_nftOwners[account][i]];
            balance[i] = nft;
        }
        return (numberNfts, balance);
    }

    /**
     * @dev Creates `1` new tokens for `to`, of nft type `id`.
     * off-chain database must create a json that represent what exactly it is using uri
     *
     * Requirements:
     *
     * - the caller must have the `MINTER_ROLE`.
     * - only possible to mint NFT type id.
     */
    function mintNft(
        address to,
        uint256 nftId,
        string memory nftUri,
        bytes memory data
    ) public virtual onlyRole(MINTER_ROLE) {
        //
        // Check if was already minted
        //
        require(
            _nfts[nftId].owner == address(0),
            "MultiToken: this nft was already minted"
        );
        // mint basic accounting
        _mint(to, NFT, 1, data);
        //
        // mint double accounting (extra data and fast access)
        //
        _nfts[nftId] = Nft(nftId, to, nftUri);
        _nftOwners[to].push(nftId);
        // Grow general counter
        ++_totalNftsSupply;
    }

    function mintNftBatch(
        address to,
        uint256[] memory nftIds,
        string[] memory uris,
        bytes memory data
    ) public virtual onlyRole(MINTER_ROLE) {
        //
        // Be sure non of the NFTs in the list were minted
        //
        uint256[] memory amounts = new uint256[](nftIds.length);
        for (uint256 i = 0; i < nftIds.length; ++i) {
            uint256 nftId = nftIds[i];
            if (_nfts[nftId].owner != address(0)) {
                revert("MultiToken: cannot mint already minted NFT");
            }
            amounts[i] = 1;
            //
            // mint double accounting (extra data and fast access)
            //
            _nfts[nftId] = Nft(nftId, to, uris[i]);
            _nftOwners[to].push(nftId);
            // Grow general counter
            ++_totalNftsSupply;
        }
        _mintBatch(to, nftIds, amounts, data);
    }

    /**
     * @dev Destroys `1` token of NFT type from `account`
     * off-chain databse must destroy this id or save it into a vault for the next user to buy
     * Requirements:
     *
     * - `account` cannot be the zero address and should be the owner of the nftId.
     * - `nftId` should be owned by `account`
     * - the caller must have the `BURN_ROLE`.
     */
    function burnNft(address account, uint256 nftId)
        public
        virtual
        onlyRole(BURN_ROLE)
    {
        require(
            _nfts[nftId].owner == account,
            "MultiToken: account is not the owner of this nft"
        );
        // Search move and delete from owner array
        for (uint256 i = 0; i < _nftOwners[account].length; ++i) {
            if (_nftOwners[account][i] == nftId) {
                // burn nft from the basic accounting
                _burn(account, NFT, 1);
                // Move the last element
                _nftOwners[account][i] = _nftOwners[account][
                    _nftOwners[account].length - 1
                ];
                // Delete last element
                _nftOwners[account].pop();
                // Delete from the registry
                delete _nfts[nftId];
                // Reduce general counter
                ++_totalNftsSupply;
            }
        }
    }

    function burnNftBatch(address account, uint256[] memory nftIds)
        public
        virtual
        onlyRole(BURN_ROLE)
    {
        //
        // Be sure non of the NFTs match the owner
        //
        uint256[] memory amounts = new uint256[](nftIds.length);
        uint256[] memory ids = new uint256[](nftIds.length);
        for (uint256 i = 0; i < nftIds.length; ++i) {
            uint256 nftId = nftIds[i];
            if (_nfts[nftId].owner != account) {
                revert(
                    "MultiToken: cannot burn an NFT that doesn't match the owner"
                );
            }
            amounts[i] = 1;
            ids[i] = NFT;

            // Search move and delete from owner array
            for (uint256 j = 0; j < _nftOwners[account].length; ++j) {
                if (_nftOwners[account][j] == nftId) {
                    // Move the last element
                    _nftOwners[account][j] = _nftOwners[account][
                        _nftOwners[account].length - 1
                    ];
                    // Delete last element
                    _nftOwners[account].pop();
                    // Delete from the registry
                    delete _nfts[nftId];
                    // Reduce general counter
                    --_totalNftsSupply;
                }
            }
        }

        _burnBatch(account, ids, amounts);
    }

    /**
     * @dev Pauses all token transfers.
     *
     * See {ERC1155Pausable} and {Pausable-_pause}.
     *
     * Requirements:
     *
     * - the caller must have the `PAUSER_ROLE`.
     */
    function pause() public virtual onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @dev Unpauses all token transfers.
     *
     * See {ERC1155Pausable} and {Pausable-_unpause}.
     *
     * Requirements:
     *
     * - the caller must have the `PAUSER_ROLE`.
     */
    function unpause() public virtual onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(AccessControlEnumerableUpgradeable, ERC1155Upgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    )
        internal
        virtual
        override(ERC1155Upgradeable, ERC1155PausableUpgradeable)
    {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }

    function setUri(string memory newuri)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        _setURI(newuri);

        for (uint256 i = 0; i < _totalAssetsSupply.length; ++i) {
            _totalAssetsSupply[i].uri = super.uri(i);
        }
    }

    uint256[50] private __gap;
}
