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
    uint256 private constant MIN_PERCENTAGE_PER_BLOCK = 1;
    uint256 private constant MAX_PERCENTAGE_PER_BLOCK = 100;
    uint256 private _rewardExpPower;
    uint256 private _maxBlocksToCalcReward; // Kinda 30d in MATIC

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

    function _setFlexibleStakeRewards(
        uint256 rewardExpPower,
        uint256 maxBlocksToCalcReward
    ) internal {
        _rewardExpPower = rewardExpPower;
        _maxBlocksToCalcReward = maxBlocksToCalcReward;
    }

    function _calculateFlexibleStakeReward()
        internal
        view
        returns (
            uint256,
            address,
            uint256
        )
    {
        uint256 currentBlock = block.number;

        uint256 stakedForBlocks = (currentBlock -
            _stakes[msg.sender].sinceBlock);
        uint256 percentageToUser = 100 - _stakes[msg.sender].percentage;
        uint256 percentageToDelegate = 100 - percentageToUser;

        // log
        //uint256 range = logMaxPercentPerBlock - logMinPercentPerBlock;
        //uint256 rewardAmount = (PRBMathUD60x18.log10(stakedForBlocks) -
        //    logMinPercentPerBlock) / range;
        // simple
        //uint256 rewardAmount = (stakedForBlocks * percentPerBlock); Simple
        // pow
        uint256 campMaxBlocks = stakedForBlocks > _maxBlocksToCalcReward
            ? _maxBlocksToCalcReward
            : stakedForBlocks;
        uint256 rewardAmount = campMaxBlocks**_rewardExpPower;

        uint256 rewardAmountToHolder = rewardAmount / percentageToUser;
        uint256 rewardAmountDelegated = rewardAmount / percentageToDelegate;

        return (
            rewardAmountToHolder,
            _stakes[msg.sender].delegateTo,
            rewardAmountDelegated
        );
    }

    function _flexibleStake(
        uint256 _amount,
        address _delegateTo,
        uint256 _percentage
    ) internal {
        require(
            _stakes[msg.sender].delegateTo == address(0),
            "You are already delegating"
        );

        require(
            _delegateTo != address(0),
            "Cannot delegate to the zero address"
        );
        require(
            _percentage >= MIN_PERCENTAGE_PER_BLOCK,
            "Cannot delegate less than 1 percentage"
        );
        require(
            _percentage <= MAX_PERCENTAGE_PER_BLOCK,
            "Cannot delegate more than 100 percentage"
        );

        _stakes[msg.sender] = (
            Stake(_amount, block.number, _delegateTo, _percentage)
        );

        emit LogStake(
            msg.sender,
            _stakes[msg.sender].amount,
            _stakes[msg.sender].sinceBlock,
            _stakes[msg.sender].delegateTo,
            _stakes[msg.sender].percentage
        );
    }

    function _flexibleUntake()
        internal
        returns (
            uint256,
            address,
            uint256
        )
    {
        require(_stakes[msg.sender].sinceBlock != 0, "Nothing to unstake");

        (
            uint256 rewardAmountToHolder,
            address rewardToDelegateTo,
            uint256 rewardAmountToDelegate
        ) = _calculateFlexibleStakeReward();

        _stakes[msg.sender].sinceBlock = block.number;

        emit LogUnstake(
            msg.sender,
            _stakes[msg.sender].amount,
            rewardAmountToHolder,
            rewardToDelegateTo,
            rewardAmountToDelegate
        );

        return (
            rewardAmountToHolder,
            rewardToDelegateTo,
            rewardAmountToDelegate
        );
    }

    function _flexibleStakeBalance()
        internal
        view
        returns (
            uint256,
            address,
            uint256
        )
    {
        return (
            _stakes[msg.sender].amount,
            _stakes[msg.sender].delegateTo,
            _stakes[msg.sender].percentage
        );
    }
}
