// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

//import "prb-math/contracts/PRBMathUD60x18.sol";

/**
 * @title TokenV3
 * @dev staking functionality
 */
contract CanStakeFlexible {
    struct Stake {
        uint256 amount;
        uint256 sinceBlock;
        address delegateTo;
        uint256 percentage;
    }
    mapping(address => Stake) internal _stakes;
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
        require(referenceBlockNumber != 0, "referenceBlockNumber cannot be 0");
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
            _stakes[_account].delegateTo != address(0),
            "You are not staking"
        );

        uint256 currentBlock = block.number;

        // Reward distribution
        uint256 stakedForBlocks = (currentBlock - _stakes[_account].sinceBlock);
        uint256 percentageToDelegate = 100 - _stakes[_account].percentage;
        uint256 percentageToUser = 100 - percentageToDelegate;
        //
        // Simple cycle: y=\left(\frac{T}{p}\right)\cdot x
        //
        uint256 rewardAmount = (_stakes[_account].amount / _stakingDifficulty) *
            stakedForBlocks;
        //
        // You need to stake more and more to be close to the ratio: y=x^{\frac{T}{p}}
        //
        //uint256 rewardAmount = stakedForBlocks**(_stakes[_account].amount / _stakingDifficulty);

        uint256 rewardAmountToHolder = rewardAmount / percentageToUser;
        uint256 rewardAmountDelegated = rewardAmount / percentageToDelegate;

        return (
            rewardAmountToHolder,
            _stakes[_account].delegateTo,
            rewardAmountDelegated
        );
    }

    function _flexibleStake(
        address _account,
        uint256 _amount,
        address _delegateTo,
        uint256 _percentage
    ) internal {
        require(_amount != 0, "amount to stake > 0");
        require(
            _stakes[_account].delegateTo == address(0),
            "You are already delegating"
        );
        require(
            _delegateTo != address(0),
            "Cannot delegate to the zero address"
        );
        require(
            _percentage >= _MIN_PERCENTAGE_PER_BLOCK,
            "Cannot delegate less than 1 percentage"
        );
        require(
            _percentage <= _MAX_PERCENTAGE_PER_BLOCK,
            "Cannot delegate more than 100 percentage"
        );
        require(block.number != 0, "too fast too furious");

        _stakes[_account] = (
            Stake(_amount, block.number, _delegateTo, _percentage)
        );

        _totalFlexibleAmountStaked += _amount;

        emit LogStake(
            _account,
            _stakes[_account].amount,
            _stakes[_account].sinceBlock,
            _stakes[_account].delegateTo,
            _stakes[_account].percentage
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
        require(_stakes[_account].sinceBlock != 0, "nothing to unstake");

        _updateFlexibleStakingHalving();

        (
            uint256 rewardAmountToHolder,
            address rewardToDelegateTo,
            uint256 rewardAmountToDelegate
        ) = _calculateFlexibleStakeReward(_account);

        emit LogUnstake(
            _account,
            _stakes[_account].amount,
            rewardAmountToHolder,
            rewardToDelegateTo,
            rewardAmountToDelegate
        );

        _totalFlexibleAmountStaked -= _stakes[_account].amount;

        delete _stakes[_account];

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
            _stakes[_account].amount,
            _stakes[_account].delegateTo,
            _stakes[_account].percentage
        );
    }
}
