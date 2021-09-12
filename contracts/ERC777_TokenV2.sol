// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "./ERC777_Token.sol";

/**
 * @title Token
 * @dev this contract is a Pausable ERC20 token with Burn and Mint
 * controlled by a central SupplyController. By implementing Token
 * this contract also includes external methods for setting
 * a new implementation contract for the Proxy.
 * NOTE: The storage defined here will actually be held in the Proxy
 * contract and all calls to this contract should be made through
 * the proxy, including admin actions done as owner or supplyController.
 * Any call to transfer against this contract should fail
 * with insufficient funds since no tokens will be issued there.
 */
contract ERC777_TokenV2 is ERC777_Token {
    /**
     * DATA
     */

    // INITIALIZATION DATA
    string private creator;
    uint8 public constant version = 2; // solium-disable-line uppercase

    /**
     * FUNCTIONALITY
     */

    /**
     * @dev Gets creators name.
     * @return A string representing the creator.
     */
    function getCreator() public view returns (string memory) {
        return creator;
    }

    // INITIALIZATION FUNCTIONALITY

    /**
     * @dev sets creator's name.
     */
    function setCreator(string memory _creator) public onlyTreasury {
        creator = _creator;
    }
}
