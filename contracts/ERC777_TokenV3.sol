// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "./ERC777_TokenV2.sol";
import "./FlexibleStake.sol";

/**
 * @title TokenV3
 * @dev staking functionality
 */
// TODO: configure decay in rewards with getReferenceBlockNumber()
contract ERC777_TokenV3 is ERC777_TokenV2, CanStakeFlexible {
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
