// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Context.sol";

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
    mapping(address => Stake) internal stakes;
    uint256 public constant percentPerBlock = 1; // TODO make it more interesting

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

    function _calculateStakeReward()
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
            stakes[msg.sender].sinceBlock);
        uint256 percentageToUser = 100 - stakes[msg.sender].percentage;
        uint256 percentageToDelegate = 100 - percentageToUser;

        uint256 rewardAmount = (stakedForBlocks * percentPerBlock);
        uint256 rewardAmountToHolder = rewardAmount / percentageToUser;
        uint256 rewardAmountDelegated = rewardAmount / percentageToDelegate;

        return (
            rewardAmountToHolder,
            stakes[msg.sender].delegateTo,
            rewardAmountDelegated
        );
    }

    function _flexibleStake(
        uint256 _amount,
        address _delegateTo,
        uint256 _percentage
    ) internal {
        require(
            stakes[msg.sender].delegateTo == address(0),
            "You are already delegating"
        );

        require(
            _delegateTo != address(0),
            "Cannot delegate to the zero address"
        );

        require(_percentage <= 100, "Cannot delegate more than 100 percentage");

        stakes[msg.sender] = (
            Stake(_amount, block.number, _delegateTo, _percentage)
        );

        emit LogStake(
            msg.sender,
            stakes[msg.sender].amount,
            stakes[msg.sender].sinceBlock,
            stakes[msg.sender].delegateTo,
            stakes[msg.sender].percentage
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
        require(stakes[msg.sender].sinceBlock != 0, "Nothing to unstake");

        (
            uint256 rewardAmountToHolder,
            address rewardToDelegateTo,
            uint256 rewardAmountToDelegate
        ) = _calculateStakeReward();

        stakes[msg.sender].sinceBlock = block.number;

        emit LogUnstake(
            msg.sender,
            stakes[msg.sender].amount,
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
            stakes[msg.sender].amount,
            stakes[msg.sender].delegateTo,
            stakes[msg.sender].percentage
        );
    }
}
