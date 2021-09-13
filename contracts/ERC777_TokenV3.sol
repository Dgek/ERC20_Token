// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "./ERC777_TokenV2.sol";
import "./FlexibleStake.sol";

/**
 * @title TokenV3
 * @dev staking functionality
 */
contract ERC777_TokenV3 is ERC777_TokenV2, CanStakeFlexible {
    function flexibleStake(address _delegateTo, uint256 _percentage)
        external
        whenNotPausedOrFrozen
    {
        uint256 amount = balanceOf(_msgSender());
        _flexibleStake(amount, _delegateTo, _percentage);
    }

    function flexibleUntake() external whenNotPausedOrFrozen {
        (
            uint256 rewardToHolder,
            address delegateTo,
            uint256 rewardToDelegate
        ) = _flexibleUntake();
        _mint(_msgSender(), rewardToHolder, "", "", true);
        _mint(delegateTo, rewardToDelegate, "", "", true);
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
        return _flexibleStakeBalance();
    }

    function calculateStakeReward()
        external
        view
        whenNotPausedOrFrozen
        returns (
            uint256,
            address,
            uint256
        )
    {
        return _calculateStakeReward();
    }
}
