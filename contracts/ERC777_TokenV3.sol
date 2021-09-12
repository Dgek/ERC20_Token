// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "./ERC777_TokenV2.sol";
import "./FlexibleStake.sol";

/**
 * @title TokenV3
 * @dev staking functionality
 */
contract ERC777_TokenV3 is ERC777_TokenV2, CanStakeFlexible {
    function flexibleStake(uint256 _amount) external {
        _flexibleStake(_amount);
    }

    function flexibleUntake(address _address) external whenNotPausedOrFrozen {
        _flexibleUntake(_address);
    }

    function flexibleStakeBalanceOf(address _address)
        external
        view
        whenNotPausedOrFrozen
        returns (uint256)
    {
        return _flexibleStakeBalanceOf(_address);
    }

    function viewFlexibleStakeUnclaimedRewards(address _address)
        external
        view
        whenNotPausedOrFrozen
        returns (uint256)
    {
        return _viewFlexibleStakeUnclaimedRewards(_address);
    }
}
