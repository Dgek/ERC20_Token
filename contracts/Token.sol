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
        address treasury,
        bytes memory data,
        bytes memory operatorData
    ) public virtual initializer {
        __Token_init(
            name,
            symbol,
            defaultOperators,
            initialSupply,
            treasury,
            data,
            operatorData
        );
    }

    /**
     * @dev Mints `initialSupply` amount of token and transfers them to `treasury`.
     *
     * See {ERC777-constructor}.
     */
    function __Token_init(
        string memory name,
        string memory symbol,
        address[] memory defaultOperators,
        uint256 initialSupply,
        address treasury,
        bytes memory data,
        bytes memory operatorData
    ) internal initializer {
        __Context_init_unchained();
        __ERC777_init_unchained(name, symbol, defaultOperators);
        __Token_init_unchained(initialSupply, treasury, data, operatorData);
    }

    function __Token_init_unchained(
        uint256 initialSupply,
        address treasury,
        bytes memory data,
        bytes memory operatorData
    ) internal initializer {
        _mint(treasury, initialSupply, data, operatorData);
    }

    uint256[50] private __gap;
}
