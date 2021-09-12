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
        uint64 sinceBlock;
        uint64 untilBlock;
    }
    mapping(address => Stake) internal stakes;
    uint256 public constant percentPerBlock = 1; // TODO make it more interesting

    event LogPayout(address user, uint256 stakedAmount, uint256 rewardAmount);

    function _flexibleStake(uint256 _amount) internal {
        stakes[msg.sender] = (Stake(_amount, uint64(block.number), 0));
    }

    function _flexibleUntake(address _address) internal {
        require(msg.sender == _address, "Not your stake");
        require(stakes[msg.sender].untilBlock == 0, "Already unstaked");

        stakes[msg.sender].untilBlock = uint64(block.number);

        uint256 stakedForBlocks = (block.number -
            stakes[msg.sender].sinceBlock);

        uint256 rewardAmount = (stakes[msg.sender].amount *
            stakedForBlocks *
            percentPerBlock) / 100;

        emit LogPayout(msg.sender, stakes[msg.sender].amount, rewardAmount);
    }

    function _flexibleStakeBalanceOf(address _address)
        internal
        view
        returns (uint256)
    {
        require(msg.sender == _address, "Not your stake");

        return stakes[msg.sender].amount;
    }

    function _viewFlexibleStakeUnclaimedRewards(address _address)
        internal
        view
        returns (uint256)
    {
        uint256 totalUnclaimedRewards;

        if (stakes[_address].untilBlock == 0) {
            uint256 stakedForBlocks = (block.number -
                stakes[_address].sinceBlock);
            uint256 rewardAmount = (stakedForBlocks * percentPerBlock) / 100;
            totalUnclaimedRewards += rewardAmount;
        }

        return totalUnclaimedRewards;
    }
}
