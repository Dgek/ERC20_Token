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
    event BeforeTokenTransfer();
    uint256 private _initialSupply;
    address private _treasuryAccount;

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
        _treasuryAccount = treasury;
    }

    /**
     * @dev Check if the account is the initial holder of the tokens
     */
    function isTreasury(address treasury) public view returns (bool) {
        return treasury == _treasuryAccount;
    }

    /**
     * @dev Creates tokens and assigns them to treasury, increasing
     * the total supply.
     *
     * If a send hook is registered for the treasury account, the corresponding function
     * will be called with `data` and `operatorData`.
     *
     * See {IERC777Sender} and {IERC777Recipient}.
     *
     * Emits {Minted} and {IERC20-Transfer} events.
     *
     * Requirements
     *
     * - caller must be the initial holder of the tokens - treasury.
     * - if calle - treasury is a contract, it must implement the {IERC777Recipient}
     * interface.
     */
    function treasuryMint(
        uint256 amount,
        bytes memory userData,
        bytes memory operatorData
    ) public {
        require(isTreasury(_msgSender()), "ERC777: caller is not the treasury");
        _mint(_msgSender(), amount, userData, operatorData, true);
    }

    function _beforeTokenTransfer(
        address,
        address,
        address,
        uint256
    ) internal override {
        emit BeforeTokenTransfer();
    }

    uint256[50] private __gap;
}
