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
    uint256 public constant MINERAL = 0;
    uint256 public constant GAS = 1;
    uint256 public constant ENERGON = 2;
    uint256 public constant NFT_TERRAIN = 3;

    uint256[] internal _totalAssetsSupply;

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
        _totalAssetsSupply.push(0); // MINERAL
        _totalAssetsSupply.push(0); // GAS
        _totalAssetsSupply.push(0); // ENERGON
    }

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURN_ROLE = keccak256("BURN_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

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

    function totalAssetsSuply() public view returns (uint256[] memory) {
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
        _totalAssetsSupply[id] += amount;
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
            _totalAssetsSupply[ids[i]] += amounts[i];
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
        _totalAssetsSupply[id] -= amount;
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
            _totalAssetsSupply[ids[i]] -= amounts[i];
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
    }

    uint256[50] private __gap;
}
