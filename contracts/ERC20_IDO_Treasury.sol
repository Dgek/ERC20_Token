// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract ERC20_IDO_Treasury is AccessControl 
{
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    using Address for address;
    using SafeERC20 for IERC20;

    IERC20 private immutable _idoToken;
    address private _operatorAccount;

    struct Beneficiary {
        address addr;
        address sentTo;
        uint256 tokens;
        uint256 paidWithNativeTokens;
        uint256 paidWithStableCoins;
    }
    mapping(uint256=>Beneficiary) private _distribution;
    uint256 private _distributionCount;

    constructor(
        IERC20 idoToken,
        address operatorAccount
    ) {
        require(
            address(idoToken) != address(0),
            "idoToken token is the zero address"
        );
        require(operatorAccount != address(0), "operatorAccount is not allowed to be zero");

        _idoToken = idoToken;
        _setupRole(OPERATOR_ROLE, operatorAccount);
    }

    function getIdoTokenAddress() external view returns(IERC20)
    {
        return _idoToken;
    }

    function setDistribution(Beneficiary[] memory beneficiaries, uint256 size) external onlyRole(OPERATOR_ROLE) returns (uint256)
    {
        for (uint256 i = 0; i < size; ++i)
        {
            _distribution[_distributionCount] = beneficiaries[i];
            ++_distributionCount;
        }
        require(_distributionCount == size, "_distributionCount doesn't match size");
        
        return _distributionCount;
    }

    function getDistribution() public view returns (Beneficiary[] memory)
    {
        Beneficiary[] memory ret = new Beneficiary[](_distributionCount);
        for (uint256 i = 0; i < _distributionCount; ++i)
        {
            ret[i] = _distribution[i];
        }
        return ret;
    }

    function balance() external view returns(uint256 accountBalance)
    {
        accountBalance = _idoToken.balanceOf(address(this));
    }
}
