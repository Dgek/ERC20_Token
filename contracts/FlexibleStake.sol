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
    uint256 private _stakingDifficulty;

    event LogSetFlexibleStakeRewards(uint256 stakingDifficulty);

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

    function _setFlexibleStakeDifficulty(uint256 stakingDifficulty) internal {
        _stakingDifficulty = stakingDifficulty;
        emit LogSetFlexibleStakeRewards(_stakingDifficulty);
    }

    function _getFlexibleStakeDifficulty() internal view returns (uint256) {
        return _stakingDifficulty;
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

        uint256 stakedForBlocks = (currentBlock - _stakes[_account].sinceBlock);
        uint256 percentageToDelegate = 100 - _stakes[_account].percentage;
        uint256 percentageToUser = 100 - percentageToDelegate;

        // https://www.desmos.com/calculator/djcrjdfiif
        // y=I\cdot\left(\frac{x^{2}}{4\cdot p}\right)

        uint256 rewardAmount = _stakes[_account].amount *
            (stakedForBlocks**2 / _stakingDifficulty);

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

        _stakes[_account] = (
            Stake(_amount, block.number, _delegateTo, _percentage)
        );

        emit LogStake(
            _account,
            _stakes[_account].amount,
            _stakes[_account].sinceBlock,
            _stakes[_account].delegateTo,
            _stakes[_account].percentage
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
        require(_stakes[_account].sinceBlock != 0, "Nothing to unstake");

        (
            uint256 rewardAmountToHolder,
            address rewardToDelegateTo,
            uint256 rewardAmountToDelegate
        ) = _calculateFlexibleStakeReward(_account);

        _stakes[_account].sinceBlock = block.number;

        emit LogUnstake(
            _account,
            _stakes[_account].amount,
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
