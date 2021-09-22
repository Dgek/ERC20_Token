// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "./ERC777_TokenV2.sol";
import "./FlexibleStake.sol";
import "./TimeLockStake.sol";

/**
 * @title TokenV3
 * @dev staking functionality
 */
// TODO: configure decay in rewards with getReferenceBlockNumber()
contract ERC777_TokenV3 is ERC777_TokenV2, CanFlexibleStake, CanTimeLockStake {
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

    //
    // Time Lock Staking
    //
    function setTimeLockMultiplierPerMonth(uint256 lockStakingRewardPerMonth)
        external
        onlyTreasury
    {
        _setTimeLockMultiplierPerMonth(lockStakingRewardPerMonth);
    }

    function getTimeLockMultiplierPerMonth() external view returns (uint256) {
        return _getTimeLockMultiplierPerMonth();
    }

    function getTotalTimeLockAmountStaked() external view returns (uint256) {
        return _getTotalTimeLockAmountStaked();
    }

    function calculateTimeLockStakeReward(
        uint256 amount,
        uint256 startTime,
        uint256 releaseTime
    ) external view returns (uint256) {
        return _calculateTimeLockStakeReward(amount, startTime, releaseTime);
    }

    function timeLockStake(uint256 amount, uint256 releaseTime)
        external
        whenNotPausedOrFrozen
    {
        _timeLockStake(_msgSender(), amount, releaseTime);
    }

    function timeLockUnstake()
        external
        whenNotPausedOrFrozen
        returns (uint256)
    {
        return _timeLockUnstake(_msgSender());
    }
}
