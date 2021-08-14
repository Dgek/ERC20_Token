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
    uint256 private _initialSupply;

    /**
     * @dev Returns the amount of tokens when the contract was initialized.
     */
    function initialSupply() public view returns (uint256) {
        return _initialSupply;
    }

    function initialize(
        string memory name,
        string memory symbol,
        address[] memory defaultOperators,
        uint256 creationSupply,
        address treasury,
        bytes memory data,
        bytes memory operatorData
    ) public virtual initializer {
        __Token_init(
            name,
            symbol,
            defaultOperators,
            creationSupply,
            treasury,
            data,
            operatorData
        );
    }

    /**
     * @dev Mints `creationSupply` amount of token and transfers them to `treasury`.
     *
     * See {ERC777-constructor}.
     */
    function __Token_init(
        string memory name,
        string memory symbol,
        address[] memory defaultOperators,
        uint256 creationSupply,
        address treasury,
        bytes memory data,
        bytes memory operatorData
    ) internal initializer {
        __Context_init_unchained();
        __ERC777_init_unchained(name, symbol, defaultOperators);
        __Token_init_unchained(creationSupply, treasury, data, operatorData);
    }

    function __Token_init_unchained(
        uint256 creationSupply,
        address treasury,
        bytes memory data,
        bytes memory operatorData
    ) internal initializer {
        _mint(treasury, creationSupply, data, operatorData);

        _initialSupply = balanceOf(treasury);
    }

    /**
     * @dev Creates `amount` tokens and assigns them to `account`, increasing
     * the total supply.
     *
     * If a send hook is registered for `account`, the corresponding function
     * will be called with `operator`, `data` and `operatorData`.
     *
     * See {IERC777Sender} and {IERC777Recipient}.
     *
     * Emits {Minted} and {IERC20-Transfer} events.
     *
     * Requirements
     *
     * - `account` cannot be the zero address.
     * - if `account` is a contract, it must implement the {IERC777Recipient}
     * interface.
     */
    function operatorMint(
        address account,
        uint256 amount,
        bytes memory userData,
        bytes memory operatorData
    ) public {
        require(
            isOperatorFor(_msgSender(), account),
            "ERC777: caller is not an operator for holder"
        );
        _mint(account, amount, userData, operatorData, true);
    }

    uint256[50] private __gap;
}
