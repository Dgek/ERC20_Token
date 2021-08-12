// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC777/ERC777Upgradeable.sol";

/**
 * @dev {ERC777} token, including:
 *
 *  - Preminted initial supply
 *  - No access control mechanism (for minting/pausing) and hence no governance
 *
 * _Available since v3.4._
 */
contract Token is Initializable, ERC777Upgradeable {
    function initialize(
        string memory name,
        string memory symbol,
        address[] memory defaultOperators,
        uint256 initialSupply,
        address owner
    ) public virtual initializer {
        __Token_init(name, symbol, defaultOperators, initialSupply, owner);
    }

    /**
     * @dev Mints `initialSupply` amount of token and transfers them to `owner`.
     *
     * See {ERC777-constructor}.
     */
    function __Token_init(
        string memory name,
        string memory symbol,
        address[] memory defaultOperators,
        uint256 initialSupply,
        address owner
    ) internal initializer {
        __Context_init_unchained();
        __ERC777_init_unchained(name, symbol, defaultOperators);
        __Token_init_unchained(initialSupply, owner);
    }

    function __Token_init_unchained(uint256 initialSupply, address owner)
        internal
        initializer
    {
        _mint(owner, initialSupply, "", "");
    }

    uint256[50] private __gap;
}
