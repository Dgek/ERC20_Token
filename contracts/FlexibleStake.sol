// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title TokenV3
 * @dev staking functionality
 */
contract CanFlexibleStake {
    struct FlexibleStake {
        uint256 amount;
        uint256 sinceBlock;
        address delegateTo;
        uint256 percentage;
    }
    mapping(address => FlexibleStake) internal _flexibleStakes;
    uint256 private constant _MIN_PERCENTAGE_PER_BLOCK = 1;
    uint256 private constant _MAX_PERCENTAGE_PER_BLOCK = 100;
    uint256 private _totalFlexibleAmountStaked;
    uint256 private _referenceBlockNumber;
    uint256 private _stakingDifficulty;
    uint256 private _halvingBlocksNumber;

    event LogBlockNumberWhenCreated(uint256 referenceBlockNumber);
    event LogSetFlexibleStakeRewards(
        uint256 stakingDifficulty,
        uint256 halvingBlocksNumber
    );

    event LogStake(
        address holder,
        uint256 amount,
        uint256 sinceBlock,
        address delegateTo,
        uint256 percentage
    );

    event LogReduceStake(
        address holder,
        uint256 amount,
        uint256 sinceBlock,
        address delegateTo,
        uint256 percentage
    );

    event LogGrowStake(
        address holder,
        uint256 amount,
        uint256 sinceBlock,
        address delegateTo,
        uint256 percentage
    );

    event LogUnstake(
        address user,
        uint256 stakedAmount,
        uint256 rewardAmountToHolder,
        address rewardToDelegateTo,
        uint256 rewardAmountToDelegate
    );

    event LogUpdateFlexibleStakingHalving(
        bool needsToHalf,
        uint256 referenceBlockNumber,
        uint256 currentBlockNumber,
        uint256 stakingDifficulty
    );

    function _setupFlexibleStaking(uint256 referenceBlockNumber) internal {
        require(
            referenceBlockNumber != 0,
            "Flexible Stake: referenceBlockNumber cannot be 0"
        );
        _referenceBlockNumber = referenceBlockNumber;
        emit LogBlockNumberWhenCreated(_referenceBlockNumber);
    }

    function _getTotalFlexibleAmountStaked() internal view returns (uint256) {
        return _totalFlexibleAmountStaked;
    }

    function _getReferenceBlockNumber() internal view returns (uint256) {
        return _referenceBlockNumber;
    }

    function _setFlexibleStakeDifficulty(
        uint256 stakingDifficulty,
        uint256 halvingBlocksNumber
    ) internal {
        _stakingDifficulty = stakingDifficulty;
        _halvingBlocksNumber = halvingBlocksNumber;
        emit LogSetFlexibleStakeRewards(
            _stakingDifficulty,
            _halvingBlocksNumber
        );
    }

    function _getFlexibleStakeDifficulty()
        internal
        view
        returns (uint256, uint256)
    {
        return (_stakingDifficulty, _halvingBlocksNumber);
    }

    function _calculateFlexibleStakeReward(address _account)
        internal
        view
        returns (
            uint256,
            address,
            uint256
        )
    {
        require(
            _flexibleStakes[_account].delegateTo != address(0),
            "Flexible Stake: You are not staking"
        );

        uint256 currentBlock = block.number;

        // Reward distribution
        uint256 stakedForBlocks = (currentBlock -
            _flexibleStakes[_account].sinceBlock);
        uint256 percentageToDelegate = 100 -
            _flexibleStakes[_account].percentage;
        uint256 percentageToUser = 100 - percentageToDelegate;
        //
        // Simple cycle: y=\left(\frac{T}{p}\right)\cdot x
        //
        uint256 rewardAmount = (_flexibleStakes[_account].amount /
            _stakingDifficulty) * stakedForBlocks;

        uint256 rewardAmountToHolder = rewardAmount / percentageToUser;
        uint256 rewardAmountDelegated = rewardAmount / percentageToDelegate;

        return (
            rewardAmountToHolder,
            _flexibleStakes[_account].delegateTo,
            rewardAmountDelegated
        );
    }

    function _flexibleStake(
        address _account,
        uint256 _amount,
        address _delegateTo,
        uint256 _percentage
    ) internal {
        require(_amount != 0, "Flexible Stake: amount to stake > 0");
        require(
            _flexibleStakes[_account].delegateTo == address(0),
            "Flexible Stake: You are already delegating"
        );
        require(
            _delegateTo != address(0),
            "Flexible Stake: Cannot delegate to the zero address"
        );
        require(
            _percentage >= _MIN_PERCENTAGE_PER_BLOCK,
            "Flexible Stake: Cannot delegate less than 1 percentage"
        );
        require(
            _percentage <= _MAX_PERCENTAGE_PER_BLOCK,
            "Flexible Stake: Cannot delegate more than 100 percentage"
        );
        require(block.number != 0, "Flexible Stake: too fast too furious");

        _flexibleStakes[_account] = (
            FlexibleStake(_amount, block.number, _delegateTo, _percentage)
        );

        _totalFlexibleAmountStaked += _amount;

        emit LogStake(
            _account,
            _flexibleStakes[_account].amount,
            _flexibleStakes[_account].sinceBlock,
            _flexibleStakes[_account].delegateTo,
            _flexibleStakes[_account].percentage
        );
    }

    function _updateFlexibleStakingHalving() internal {
        //
        // Calculate halving reward multiplier
        //
        bool needsToHalf = block.number >
            (_referenceBlockNumber + _halvingBlocksNumber)
            ? true
            : false;
        if (needsToHalf) {
            _stakingDifficulty = _stakingDifficulty * 2;
            _referenceBlockNumber = block.number;
        }

        emit LogUpdateFlexibleStakingHalving(
            needsToHalf,
            _referenceBlockNumber,
            block.number,
            _stakingDifficulty
        );
    }

    function _flexibleUntake(address _account)
        internal
        returns (
            uint256,
            address,
            uint256
        )
    {
        require(
            _flexibleStakes[_account].sinceBlock != 0,
            "Flexible Stake: nothing to unstake"
        );

        _updateFlexibleStakingHalving();

        (
            uint256 rewardAmountToHolder,
            address rewardToDelegateTo,
            uint256 rewardAmountToDelegate
        ) = _calculateFlexibleStakeReward(_account);

        emit LogUnstake(
            _account,
            _flexibleStakes[_account].amount,
            rewardAmountToHolder,
            rewardToDelegateTo,
            rewardAmountToDelegate
        );

        _totalFlexibleAmountStaked -= _flexibleStakes[_account].amount;

        delete _flexibleStakes[_account];

        return (
            rewardAmountToHolder,
            rewardToDelegateTo,
            rewardAmountToDelegate
        );
    }

    function _flexibleStakeBalance(address _account)
        internal
        view
        returns (
            uint256,
            address,
            uint256
        )
    {
        return (
            _flexibleStakes[_account].amount,
            _flexibleStakes[_account].delegateTo,
            _flexibleStakes[_account].percentage
        );
    }

    function _reduceFlexibleStakeAmount(address _account, uint256 _amount)
        internal
    {
        require(
            _flexibleStakes[_account].amount != 0,
            "Flexible Stake: You are not delegating"
        );
        require(
            _amount <= _flexibleStakes[_account].amount,
            "Flexible Stake: the amount to reduce exceed the total amount delegated"
        );

        if (_amount == _flexibleStakes[_account].amount) {
            delete _flexibleStakes[_account];
        } else {
            _flexibleStakes[_account].amount -= _amount;
        }

        emit LogReduceStake(
            _account,
            _flexibleStakes[_account].amount,
            _flexibleStakes[_account].sinceBlock,
            _flexibleStakes[_account].delegateTo,
            _flexibleStakes[_account].percentage
        );
    }

    function _growFlexibleStakeAmount(address _account, uint256 _amount)
        internal
    {
        require(
            _flexibleStakes[_account].amount != 0,
            "Flexible Stake: You are not delegating"
        );

        _flexibleStakes[_account].amount += _amount;

        emit LogGrowStake(
            _account,
            _flexibleStakes[_account].amount,
            _flexibleStakes[_account].sinceBlock,
            _flexibleStakes[_account].delegateTo,
            _flexibleStakes[_account].percentage
        );
    }

    function _isFlexibleStaking(address _account) internal view returns (bool) {
        return _flexibleStakes[_account].amount > 0 ? true : false;
    }
}
