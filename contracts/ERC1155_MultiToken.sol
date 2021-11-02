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
    ERC1155PausableUpgradeable
{
    //
    // Events
    //

    // Nft Burn
    event NftBurn(address burnBy, address owner, uint256 nftId);

    // Freeze
    event AddressFrozen(address indexed addr);
    event AddressUnfrozen(address indexed addr);
    event FrozenAddressWiped(address indexed addr);
    mapping(address => bool) internal _frozen;
    //
    // Additional roles
    //
    string private _tokenTypesUri;
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURN_ROLE = keccak256("BURN_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant FREEZE_ROLE = keccak256("FREEZE_ROLE");
    //
    // Assets
    //
    uint256 public constant GEMS = 0;
    uint256 public constant MINERAL = 1;
    uint256 public constant GAS = 2;
    uint256 public constant ENERGON = 3;
    //
    // NFTs
    //
    uint256 public constant NFT = 4;
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
    //
    // Governance Token
    //
    uint256 private _totalSupply;
    uint256 private _maxSupply;
    string private _name;
    string private _symbol;

    address private _treasuryAccount;

    function initialize(
        string memory uri,
        address treasury,
        address[] memory defaultOperators,
        uint256 initialSupplyOfGovernanceToken,
        uint256 maxSupplyOfGovernanceToken,
        string memory nameOfGovernanceToken,
        string memory symbolOfGovernanceToken
    ) public virtual initializer {
        __MultiToken_init(uri);
        //
        // Setup roles
        //
        _setupRole(MINTER_ROLE, treasury);
        _setupRole(BURN_ROLE, treasury);
        _treasuryAccount = treasury;

        for (uint256 i = 0; i < defaultOperators.length; ++i) {
            _setupRole(MINTER_ROLE, defaultOperators[i]);
            _setupRole(BURN_ROLE, defaultOperators[i]);
            setApprovalForAll(defaultOperators[i], true);
        }
        //
        // Init supply
        //

        // Governance
        mintGovernanceToken(
            _treasuryAccount,
            initialSupplyOfGovernanceToken,
            "INITIAL_MINTING"
        );
        _maxSupply = maxSupplyOfGovernanceToken;
        _name = nameOfGovernanceToken;
        _symbol = symbolOfGovernanceToken;

        // Assets
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

    /**
     * @dev Modifier to make a function callable only when is the treasury.
     *
     * Requirements:
     *
     * - Caller is the trasury account.
     */
    modifier onlyTreasury() {
        require(
            _treasuryAccount == _msgSender(),
            "you are not the treasury account"
        );
        _;
    }

    /**
     * @dev Modifier to make a function callable only when the contract is not paused.
     *
     * Requirements:
     *
     * - The contract must not be paused.
     */
    modifier whenNotPausedOrFrozen() {
        require(!paused(), "the contract is paused");
        require(!isFrozen(_msgSender()), "your account is frozen");
        _;
    }

    /**
     * @dev See {IERC777-name}.
     */
    function name() public view virtual returns (string memory) {
        return _name;
    }

    /**
     * @dev See {IERC777-symbol}.
     */
    function symbol() public view virtual returns (string memory) {
        return _symbol;
    }

    /**
     * @dev See {ERC20-decimals}.
     *
     * Always returns 18, as per the
     * [ERC777 EIP](https://eips.ethereum.org/EIPS/eip-777#backward-compatibility).
     */
    function decimals() public pure virtual returns (uint8) {
        return 18;
    }

    /**
     * @dev See {IERC777-granularity}.
     *
     * This implementation always returns `1`.
     */
    function granularity() public view virtual returns (uint256) {
        return 1;
    }

    /**
     * @dev See {IERC777-totalSupply}.
     */
    function totalSupply() public view virtual returns (uint256) {
        return _totalSupply;
    }

    /**
     * @dev Returns the cap on the token's total supply.
     */
    function maxSupply() public view virtual returns (uint256) {
        return _maxSupply;
    }

    /**
     * @dev Creates `amount` new tokens for `to`, of the governance token.
     *
     * See {ERC1155-_mint}.
     *
     * Requirements:
     *
     * - the caller must have the `MINTER_ROLE`.
     */
    function mintGovernanceToken(
        address to,
        uint256 amount,
        bytes memory data
    ) public virtual onlyRole(MINTER_ROLE) whenNotPausedOrFrozen {
        require(
            _totalSupply + amount <= _maxSupply,
            "Maximum capacity of the token exceeded"
        );
        _mint(to, GEMS, amount, data);
        _totalSupply += amount;
    }

    /**
     * @dev Destroys `amount` tokens of the governance token type from `account`
     *
     * Requirements:
     *
     * - `account` cannot be the zero address.
     * - `account` must have at least `amount` tokens of token type `id`.
     * - the caller must have the `BURN_ROLE`.
     */
    function burnGovernanceToken(address account, uint256 amount)
        public
        virtual
        onlyRole(BURN_ROLE)
        whenNotPausedOrFrozen
    {
        _burn(account, GEMS, amount);
        _totalSupply -= amount;
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
    )
        public
        virtual
        onlyRole(MINTER_ROLE)
        onlyAssets(id)
        whenNotPausedOrFrozen
    {
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
    )
        public
        virtual
        onlyRole(MINTER_ROLE)
        onlyAssetsInArray(ids)
        whenNotPausedOrFrozen
    {
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
    ) public virtual onlyRole(BURN_ROLE) onlyAssets(id) whenNotPausedOrFrozen {
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
    )
        public
        virtual
        onlyRole(BURN_ROLE)
        onlyAssetsInArray(ids)
        whenNotPausedOrFrozen
    {
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
    ) public virtual onlyRole(MINTER_ROLE) whenNotPausedOrFrozen {
        //
        // Check if was already minted
        //
        require(
            _nfts[nftId].owner == address(0),
            "MultiToken: this nft was already minted"
        );
        //
        // mint basic accounting
        // NOTE: checking the balance of the id NFT will just give the total number of NFTs minted
        //
        _mint(to, NFT, 1, data);
        //
        // mint parallel accounting (extra data and fast access)
        // NOTE: here nftId will be assigned to an owner and will generates an uri with metadata and index/add the owner with a new nftId
        // so checking an nft by id gives you the owner and metadata, checking the owner gives you all nfts that owns
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
    ) public virtual onlyRole(MINTER_ROLE) whenNotPausedOrFrozen {
        //
        // Be sure non of the NFTs in the list were minted
        //
        uint256[] memory fakeAmounts = new uint256[](nftIds.length);
        uint256[] memory fakeBatch = new uint256[](nftIds.length);
        for (uint256 i = 0; i < nftIds.length; ++i) {
            uint256 nftId = nftIds[i];
            if (_nfts[nftId].owner != address(0)) {
                revert("MultiToken: cannot mint already minted NFT");
            }
            fakeAmounts[i] = 1;
            fakeBatch[i] = NFT;
        }
        //
        // mint basic accounting
        // NOTE: checking the balance of the id NFT will just give the total number of NFTs minted of the user
        _mintBatch(to, fakeBatch, fakeAmounts, data);
        //
        // If executed properly the mint batch and safe transfer we save data of the parallel accounting
        //
        for (uint256 i = 0; i < nftIds.length; ++i) {
            uint256 nftId = nftIds[i];
            //
            // mint parallel accounting (extra data and fast access)
            //
            _nfts[nftId] = Nft(nftId, to, uris[i]);
            _nftOwners[to].push(nftId);
            // Grow general counter
            ++_totalNftsSupply;
        }
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
        whenNotPausedOrFrozen
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
                --_totalNftsSupply;
                emit NftBurn(_msgSender(), account, nftId);
            }
        }
    }

    function burnNftBatch(address account, uint256[] memory nftIds)
        public
        virtual
        onlyRole(BURN_ROLE)
        whenNotPausedOrFrozen
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
        }
        //
        // Safe burn
        //
        _burnBatch(account, ids, amounts);
        //
        // If executed properly the burning mechanisim we remove data from the parallel accounting
        //
        for (uint256 i = 0; i < nftIds.length; ++i) {
            uint256 nftId = nftIds[i];
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

                    emit NftBurn(_msgSender(), account, nftId);
                }
            }
        }
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
     * @dev Freezes an address balance from being transferred.
     * @param _addr The new address to freeze.
     */
    function freeze(address _addr) public onlyRole(FREEZE_ROLE) {
        require(_addr != address(0), "you cannot freeze the zero address");
        require(
            _treasuryAccount == _addr,
            "you cannot freeze the treasury account"
        );
        require(!_frozen[_addr], "address already _frozen");
        _frozen[_addr] = true;
        emit AddressFrozen(_addr);
    }

    /**
     * @dev Unfreezes an address balance allowing transfer.
     * @param _addr The new address to unfreeze.
     */
    function unfreeze(address _addr) public onlyRole(FREEZE_ROLE) {
        require(_addr != address(0), "you cannot unfreezing the zero address");
        require(
            _treasuryAccount == _addr,
            "you cannot unfreeze the treasury account"
        );
        require(_frozen[_addr], "address already unfrozen");
        _frozen[_addr] = false;
        emit AddressUnfrozen(_addr);
    }

    /**
     * @dev Gets whether the address is currently _frozen.
     * @param _addr The address to check if _frozen.
     * @return A bool representing whether the given address is _frozen.
     */
    function isFrozen(address _addr) public view returns (bool) {
        return _frozen[_addr];
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

    /**
     * @dev See {ERC1155-_beforeTokenTransfer}.
     *
     * Requirements:
     *
     * - the contract must not be paused.
     */
    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal virtual override {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
        //
        // Additional checks when it's the governance token
        //
        for (uint256 i = 0; i < ids.length; ++i) {
            uint256 currentId = ids[i];
            //
            // Governance Token
            //
            if (currentId == GEMS) {
                /*
                uint256 amount = amounts[i];
                //
                // Total supply control
                //
                require(
                    _totalSupply + amount <= _maxSupply,
                    "Maximum capacity of the token exceeded"
                );
                */
            }
        }
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
