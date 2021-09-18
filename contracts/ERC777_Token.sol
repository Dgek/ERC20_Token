// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "./ERC777_UpgradePauseFreeze.sol";

/**
 * @dev {ERC777} token, including:
 *
 *  - Preminted initial supply
 */
contract ERC777_Token is Initializable, ERC777_UpgradePauseFreeze {
    event BeforeTokenTransfer();
    uint256 private _referenceBlockNumber;

    function initialize(
        string memory name,
        string memory symbol,
        address[] memory defaultOperators,
        uint256 initialSupply,
        uint256 maxSupply,
        address treasury,
        bytes memory data,
        bytes memory operatorData
    ) public virtual initializer {
        __Token_init(
            name,
            symbol,
            defaultOperators,
            initialSupply,
            maxSupply,
            treasury,
            data,
            operatorData
        );
        require(initialSupply > 0, "initialSupply cannot be 0");
        require(maxSupply > 0, "maximum supply cannot be 0");
        _referenceBlockNumber = block.number;
    }

    /**
     * @dev Will return the block number when the contract was created
     */
    function getReferenceBlockNumber() public view returns (uint256) {
        return _referenceBlockNumber;
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
        uint256 maxSupply,
        address treasury,
        bytes memory data,
        bytes memory operatorData
    ) internal initializer {
        __Context_init_unchained();
        __ERC777_init_unchained(name, symbol, defaultOperators, maxSupply);
        __Token_init_unchained(initialSupply, treasury, data, operatorData);
        _pause();
    }

    function __Token_init_unchained(
        uint256 initialSupply,
        address treasury,
        bytes memory data,
        bytes memory operatorData
    ) internal initializer {
        _mint(treasury, initialSupply, data, operatorData);
        _setTreasury(treasury);
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
     * - if caller - treasury is a contract, it must implement the {IERC777Recipient}
     * interface.
     */
    function treasuryMint(
        uint256 amount,
        bytes memory userData,
        bytes memory operatorData
    ) public whenNotPausedOrFrozen {
        require(isTreasury(_msgSender()), "ERC777: caller is not the treasury");
        require(!paused(), "contract paused");
        _mint(_getTreasury(), amount, userData, operatorData, true);
    }

    /**
     * @dev Creates tokens and assigns them to `to` address, increasing
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
     * - if caller - treasury is a contract, it must implement the {IERC777Recipient}
     * interface.
     */
    function treasuryMintTo(
        address to,
        uint256 amount,
        bytes memory userData,
        bytes memory operatorData
    ) public whenNotPausedOrFrozen {
        require(isTreasury(_msgSender()), "ERC777: caller is not the treasury");
        require(!paused(), "contract paused");
        _mint(to, amount, userData, operatorData, true);
    }

    /**
     * @dev Creates tokens and assigns them to `to` address, increasing
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
     * - caller must be an operator of the initial holder of the tokens - treasury.
     * - if caller is a contract, it must implement the {IERC777Recipient}
     * interface.
     */
    function operatorMintTo(
        address to,
        uint256 amount,
        bytes memory userData,
        bytes memory operatorData
    ) public whenNotPausedOrFrozen onlyTreasuryOperator {
        _mint(to, amount, userData, operatorData, true);
    }

    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256
    ) internal override whenNotPausedOrFrozen {
        emit BeforeTokenTransfer();
        require(!paused(), "contract paused");
        require(!_frozen[_msgSender()], "user address frozen");
        require(!_frozen[operator], "operator address frozen");
        require(!_frozen[from], "from address frozen");
        require(!_frozen[to], "to address frozen");
    }

    uint256[50] private __gap;
}
