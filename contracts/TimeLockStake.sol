// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title TokenV3
 * @dev time lock staking functionality
 */
contract CanTimeLockStake {
    struct TimeLockStake {
        uint256 amount;
        uint256 startTime;
        uint256 releaseTime;
    }
    mapping(address => TimeLockStake) internal _timeLockStakes;

    uint256 private _totalTimeLockAmountStaked;
    uint256 private _lockStakingRewardPerMonth;

    event LogTimeLockStake(
        address account,
        uint256 amount,
        uint256 startTime,
        uint256 releaseTime
    );

    event LogTimeLockUnstake(address account, uint256 amount);

    function _setTimeLockMultiplierPerMonth(uint256 lockStakingRewardPerMonth)
        internal
    {
        _lockStakingRewardPerMonth = lockStakingRewardPerMonth;
    }

    function _getTimeLockMultiplierPerMonth() internal view returns (uint256) {
        return _lockStakingRewardPerMonth;
    }

    function _getTotalTimeLockAmountStaked() internal view returns (uint256) {
        return _totalTimeLockAmountStaked;
    }

    function _calculateTimeLockStakeReward(
        uint256 amount,
        uint256 startTime,
        uint256 releaseTime
    ) internal view returns (uint256) {
        //
        // Reward distribution
        //
        uint256 stakingTime = (releaseTime - startTime);
        uint256 rewardAmount = amount *
            (stakingTime / _lockStakingRewardPerMonth);

        return rewardAmount;
    }

    function _timeLockStake(
        address account,
        uint256 amount,
        uint256 releaseTime
    ) internal {
        require(amount != 0, "Time Lock Stake: amount to stake > 0");
        require(
            _timeLockStakes[account].releaseTime == 0,
            "Time Lock Stake: You are already time lock staking"
        );
        require(
            releaseTime > block.timestamp,
            "Time Lock Stake: release time is before current time"
        );

        _timeLockStakes[account] = (
            TimeLockStake(amount, block.timestamp, releaseTime)
        );

        _totalTimeLockAmountStaked += amount;

        emit LogTimeLockStake(
            account,
            _timeLockStakes[account].amount,
            _timeLockStakes[account].startTime,
            _timeLockStakes[account].releaseTime
        );
    }

    function _timeLockUnstake(address _account) internal returns (uint256) {
        require(
            block.timestamp >= _timeLockStakes[_account].releaseTime,
            "Time Lock Stake: you cannot unstake before the release time"
        );
        uint256 rewardAmount = _calculateTimeLockStakeReward(
            _timeLockStakes[_account].amount,
            _timeLockStakes[_account].startTime,
            _timeLockStakes[_account].releaseTime
        );

        emit LogTimeLockUnstake(_account, rewardAmount);

        _totalTimeLockAmountStaked -= _timeLockStakes[_account].amount;
        delete _timeLockStakes[_account];

        return rewardAmount;
    }
}
