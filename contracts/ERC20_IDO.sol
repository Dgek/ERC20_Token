// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract ERC20_IDO is AccessControl {

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    using Address for address;
    using SafeERC20 for IERC20;

    bool private _allowNativeToken;
    uint256 private _numberOfTokensAvailable;
    address payable private _idoWalletToSaveBenefits;
    IERC20[] private _acceptedStableCoins;
    uint256 private _nativeTokenPriceInUsd;
    uint256 private _conversionRateForIdoToken;

    event LogNativeTokenPriceChange(uint256 price);
    event LogConversionRateChange(uint256 rate);
    
    struct Beneficiary {
        address addr;
        address sentTo;
        uint256 tokens;
        uint256 paidWithNativeTokens;
        uint256 paidWithStableCoins;
    }
    mapping(uint256=>Beneficiary) private _distribution;
    uint256 private _distributionCount;
    /**
     * Event for token purchase logging
     * @param purchaser who paid for the tokens
     * @param beneficiary who got the tokens
     * @param value weis paid for purchase
     * @param amount amount of tokens purchased
     */
    event TokensPurchased(
        address indexed purchaser,
        address indexed beneficiary,
        uint256 value,
        uint256 amount
    );

    constructor(
        bool allowNativeToken,
        uint256 numberOfTokensAvailable,
        address oracleAccount,
        address idoWalletToSaveBenefits,
        IERC20[] memory acceptedStableCoins,
        uint256 nativeTokenPriceInUsd,
        uint256 conversionRateForIdoToken
    ) {
        require(numberOfTokensAvailable > 0, "numberOfTokensAvailable is not allowed to be zero");
        require(oracleAccount != address(0), "oracleAccount is not allowed to be zero");
        require(idoWalletToSaveBenefits != address(0), "idoWalletToSaveBenefits is not allowed to be zero");
        for (uint256 i = 0; i < acceptedStableCoins.length; ++i) {
            if (address(acceptedStableCoins[i]) == address(0)) {
                revert("acceptedStableCoins has a zero address");
            }
        }
        require(conversionRateForIdoToken > 0, "price is not allowed to be zero");

        _numberOfTokensAvailable = numberOfTokensAvailable;
        _setupRole(ADMIN_ROLE, _msgSender());
        _setupRole(ORACLE_ROLE, oracleAccount);
        _allowNativeToken = allowNativeToken;
        _acceptedStableCoins = acceptedStableCoins;

        _idoWalletToSaveBenefits = payable(idoWalletToSaveBenefits);
        _nativeTokenPriceInUsd = nativeTokenPriceInUsd;
        _conversionRateForIdoToken = conversionRateForIdoToken;
    }

    function setAcceptedStableCoins(IERC20[] memory acceptedStableCoins) external onlyRole(ADMIN_ROLE)
    {
        for (uint256 i = 0; i < acceptedStableCoins.length; ++i) {
            if (address(acceptedStableCoins[i]) == address(0)) {
                revert("acceptedStableCoins has a zero address");
            }
        }
        _acceptedStableCoins = acceptedStableCoins;
    }

    function getAcceptedStableCoins() external view returns(IERC20[] memory)
    {
        return _acceptedStableCoins;
    }

    receive() external payable {
        require(_allowNativeToken == true, "not allow to pay with native token, use the stable coins only");
        
        buyTokensWithNativeToken(_msgSender());
    }

    fallback() external payable {
        require(_allowNativeToken == true, "not allow to pay with native token, use the stable coins only");
        buyTokensWithNativeToken(_msgSender());
    }

    function buyTokensWithNativeToken(address beneficiary) public payable {
        require(_allowNativeToken == true, "not allow to pay with native token, use the stable coins only");
        require(_allowNativeToken && _nativeTokenPriceInUsd > 0, "price of native token is not allowed to be zero");
        uint256 weiAmount = msg.value;

        // calculate token amount to be created
        uint256 tokens = _getTokenAmountFromNativeToken(weiAmount);
        _preValidatePurchase(beneficiary, weiAmount, tokens);

        _payWithNativeToken();
        emit TokensPurchased(_msgSender(), beneficiary, weiAmount, tokens);

        _updatePurchasingState(_msgSender(), beneficiary, tokens, weiAmount, 0);
        _postValidatePurchase(beneficiary, tokens);
    }

    function buyTokensWithStableCoins(
        address beneficiary,
        uint256 amount,
        address acceptedToken
    ) public payable {
        IERC20 paymentToken = IERC20(acceptedToken);

        _preValidatePurchaseWithAcceptedToken(
            beneficiary,
            amount,
            paymentToken
        );

        // calculate token amount to be created
        uint256 tokens = _getTokenAmountFromStableCoin(amount);

        _payWithStableCoins(
            amount,
            paymentToken
        );
        emit TokensPurchased(_msgSender(), beneficiary, amount, tokens);
        _postValidatePurchase(beneficiary, amount);

        _updatePurchasingState(_msgSender(), beneficiary, tokens, 0, amount);
    }

    function _preValidatePurchase(address beneficiary, uint256 weiAmount, uint256 tokens)
        internal
        view
    {
        require(beneficiary != address(0), "beneficiary is the zero address");
        require(weiAmount != 0, "amount is 0");
        require(
            address(msg.sender).balance >= weiAmount,
            "balance of user is not enough"
        );
        require(_numberOfTokensAvailable <= tokens);
        this; // silence state mutability warning without generating bytecode - see https://github.com/ethereum/solidity/issues/2691
    }

    function _preValidatePurchaseWithAcceptedToken(
        address beneficiary,
        uint256 amount,
        IERC20 paymentToken
    ) internal view {
        require(
            paymentToken.balanceOf(msg.sender) >= amount,
            "user balance of payment token is not >= amount"
        );
        require(beneficiary != address(0), "beneficiary is the zero address");
        require(amount != 0, "amount is 0");
        require(
            paymentToken.allowance(msg.sender, address(this)) >= amount,
            "insuficient allowance from user's payment token"
        );

        this; // silence state mutability warning without generating bytecode - see https://github.com/ethereum/solidity/issues/2691
    }

    function _postValidatePurchase(address beneficiary, uint256 weiAmount)
        internal
        view
    {
        // solhint-disable-previous-line no-empty-blocks
    }

    function _getTokenAmountFromNativeToken(uint256 weiAmount)
        internal
        view
        returns (uint256)
    {
        return (_nativeTokenPriceInUsd * weiAmount * _conversionRateForIdoToken) / 1000000000000000000;
    }

    function _getTokenAmountFromStableCoin(uint256 weiAmount)
        internal
        view
        returns (uint256)
    {
        return weiAmount * _conversionRateForIdoToken;
    }

    function _payWithNativeToken() internal {
        _idoWalletToSaveBenefits.transfer(msg.value);
    }

    function _payWithStableCoins(
        uint256 amount,
        IERC20 acceptedToken
    ) internal {
        acceptedToken.safeTransferFrom(msg.sender, _idoWalletToSaveBenefits, amount);
    }

    function _updatePurchasingState(address addr, address sentTo, uint256 tokens, uint256 paidWithNativeTokens, uint256 paidWithStableCoins)
        internal
    {
        Beneficiary memory beneficiary = Beneficiary(addr, sentTo, tokens, paidWithNativeTokens, paidWithStableCoins);
        
        _distribution[_distributionCount] = beneficiary;
        ++_distributionCount;
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

    function setPriceOfNativeToken(uint256 price) external onlyRole(ORACLE_ROLE)
    {
        _nativeTokenPriceInUsd = price;
        emit LogNativeTokenPriceChange(_nativeTokenPriceInUsd);
    }

    function getPriceOfNativeToken() external view returns(uint256)
    {
        return _nativeTokenPriceInUsd;
    }

    function setConversionRateForIdoToken(uint256 rate) external onlyRole(ORACLE_ROLE)
    {
        _conversionRateForIdoToken = rate;
        emit LogConversionRateChange(_conversionRateForIdoToken);
    }

    function getConversionRateForIdoToken() external view returns(uint256)
    {
        return _conversionRateForIdoToken;
    }

    function getTokenAmountFromNativeToken(uint256 weiAmount)
        external
        view
        returns (uint256)
    {
        return _getTokenAmountFromNativeToken(weiAmount);
    }

    function getTokenAmountFromStableCoin(uint256 weiAmount)
        external
        view
        returns (uint256)
    {
        return _getTokenAmountFromStableCoin(weiAmount);
    }

    function balance() external view returns(uint256)
    {
        return _numberOfTokensAvailable;
    }
}
