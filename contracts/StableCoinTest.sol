// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @custom:security-contact @Prompt_
contract StableCoinTest is ERC20 {
    
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) {
        _mint(_msgSender(), initialSupply);
    }

    function giveMe10() external {
        _mint(_msgSender(), 10*10**18);
    }
}
