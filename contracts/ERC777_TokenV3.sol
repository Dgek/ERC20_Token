// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "./ERC777_TokenV2.sol";
import "./FlexibleStake.sol";

/**
 * @title TokenV3
 * @dev staking functionality
 */
// TODO: configure decay in rewards with getReferenceBlockNumber()
contract ERC777_TokenV3 is ERC777_TokenV2, CanFlexibleStake {
    //
    // Override transactions to auto flexibly unstake and stop transactions that overcome the lock time staking
    //
    /**
     * @dev Returns the amount of tokens owned by an account (`owner`) and what is locked and in flexible staking.
     */
    function balances()
        external
        view
        returns (
            uint256,
            uint256,
            address,
            uint256
        )
    {
        uint256 totalBalance = balanceOf(_msgSender());
        (
            uint256 flexibleStakingBalance,
            address flexibleStakingBalanceDelegatedTo,
            uint256 flexibleStakingBalancePercentage
        ) = _flexibleStakeBalance(_msgSender());

        return (
            totalBalance,
            flexibleStakingBalance,
            flexibleStakingBalanceDelegatedTo,
            flexibleStakingBalancePercentage
        );
    }

    /**
     * @dev Hook that is called after any token transfer. This includes
     * calls to {send}, {transfer}, {operatorSend}, minting and burning.
     *
     * Calling conditions:
     *
     * - when `from` and `to` are both non-zero, `amount` of ``from``'s tokens
     * will be to transferred to `to`.
     * - when `from` is zero, `amount` tokens will be minted for `to`.
     * - when `to` is zero, `amount` of ``from``'s tokens will be burned.
     * - `from` and `to` are never both zero.
     *
     * This override grow or reduce the flexible staking amount
     */
    function _afterTokenTransfer(
        address operator,
        address from,
        address to,
        uint256 amount
    ) internal virtual override whenNotPausedOrFrozen {
        emit AfterTokenTransfer(operator, from, to, amount);
        //
        // Removing amount from flexible staking
        //
        if (from != address(0) && _isFlexibleStaking(from)) {
            _reduceFlexibleStakeAmount(from, amount);
        }
        //
        // Grow amount from flexible staking
        //
        if (to != address(0) && _isFlexibleStaking(to)) {
            _growFlexibleStakeAmount(to, amount);
        }
    }

    //
    // Flexible Stake
    //
    function getTotalFlexibleAmountStaked() external view returns (uint256) {
        return _getTotalFlexibleAmountStaked();
    }

    function initializeFlexibleStaking(
        uint256 stakingDifficulty,
        uint256 halvingBlocksNumber
    ) external onlyTreasury {
        _setFlexibleStakeDifficulty(stakingDifficulty, halvingBlocksNumber);
        _setupFlexibleStaking(getReferenceBlockNumber());
    }

    function getFlexibleStakeDifficulty()
        external
        view
        returns (uint256, uint256)
    {
        return _getFlexibleStakeDifficulty();
    }

    function flexibleStake(address _delegateTo, uint256 _percentage)
        external
        whenNotPausedOrFrozen
    {
        require(totalSupply() < maxSupply(), "there's no more coins to mint");
        uint256 amount = balanceOf(_msgSender());
        _flexibleStake(_msgSender(), amount, _delegateTo, _percentage);
    }

    function flexibleUntake() external whenNotPausedOrFrozen {
        (
            uint256 rewardToHolder,
            address delegateTo,
            uint256 rewardToDelegate
        ) = _flexibleUntake(_msgSender());
        //
        // If there are no more coins to mint give the rest of the reward to the holder and 0 delegated
        //
        uint256 totalSupplyAndRewards = totalSupply() +
            (rewardToHolder + rewardToDelegate);
        (
            uint256 capRewardToHolder,
            uint256 capRewardToDelegate
        ) = totalSupplyAndRewards > maxSupply()
                ? (maxSupply() - totalSupply(), 0)
                : (rewardToHolder, rewardToDelegate);

        if (capRewardToHolder > 0)
            _mint(_msgSender(), capRewardToHolder, "", "", true);

        if (capRewardToDelegate > 0)
            _mint(delegateTo, capRewardToDelegate, "", "", true);
    }

    function flexibleStakeBalance()
        external
        view
        whenNotPausedOrFrozen
        returns (
            uint256,
            address,
            uint256
        )
    {
        return _flexibleStakeBalance(_msgSender());
    }

    function updateFlexibleStakingHalving() external onlyTreasury {
        _updateFlexibleStakingHalving();
    }

    function calculateFlexibleStakeReward()
        external
        view
        whenNotPausedOrFrozen
        returns (
            uint256,
            address,
            uint256
        )
    {
        return _calculateFlexibleStakeReward(_msgSender());
    }
}
