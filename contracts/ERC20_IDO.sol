// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils//math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract ERC20_IDO is Ownable {
    using Address for address;
    using SafeERC20 for IERC20;

    bool private _allowNativeToken;
    IERC20 private immutable _idoToken;
    address payable private _idoWalletToSaveBenefits;
    IERC20[] private _acceptedStableCoins;
    uint256 private _conversionRateForNativeToken;
    uint256 private _conversionRateForStableCoins;
    
    mapping(address => uint256) private _distribution;
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
        IERC20 idoToken,
        address idoWalletToSaveBenefits,
        IERC20[] memory acceptedStableCoins,
        uint256 conversionRateForNativeToken,
        uint256 conversionRateForStableCoins
    ) {
        require(
            address(idoToken) != address(0),
            "idoToken token is the zero address"
        );
        require(idoWalletToSaveBenefits != address(0), "idoWalletToSaveBenefits is not allowed to be zero");
        for (uint256 i = 0; i < acceptedStableCoins.length; ++i) {
            if (address(acceptedStableCoins[i]) == address(0)) {
                revert("acceptedStableCoins has a zero address");
            }
        }

        require(conversionRateForNativeToken > 0, "price is not allowed to be zero");
        require(conversionRateForStableCoins > 0, "price is not allowed to be zero");

        _allowNativeToken = allowNativeToken;
        _idoToken = idoToken;
        _acceptedStableCoins = acceptedStableCoins;

        _idoWalletToSaveBenefits = payable(idoWalletToSaveBenefits);
        _conversionRateForNativeToken = conversionRateForNativeToken;
        _conversionRateForStableCoins = conversionRateForStableCoins;
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
        uint256 weiAmount = msg.value;
        _preValidatePurchase(beneficiary, weiAmount);

        // calculate token amount to be created
        uint256 tokens = _getTokenAmountFromNativeToken(weiAmount);

        _swapFromNativeToken(beneficiary, tokens);
        emit TokensPurchased(_msgSender(), beneficiary, weiAmount, tokens);

        _updatePurchasingState(beneficiary, tokens);
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

        _swapFromStableCoins(
            beneficiary,
            amount,
            tokens,
            paymentToken
        );
        emit TokensPurchased(_msgSender(), beneficiary, amount, tokens);
        _postValidatePurchase(beneficiary, amount);

        _updatePurchasingState(beneficiary, amount);
    }

    function _preValidatePurchase(address beneficiary, uint256 amount)
        internal
        view
    {
        require(beneficiary != address(0), "beneficiary is the zero address");
        require(amount != 0, "amount is 0");
        this; // silence state mutability warning without generating bytecode - see https://github.com/ethereum/solidity/issues/2691
    }

    function _preValidatePurchaseWithAcceptedToken(
        address beneficiary,
        uint256 amount,
        IERC20 paymentToken
    ) internal view {
        require(
            this.balance() >= amount,
            "balance of contract is not enough"
        );
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

    function _getTokenAmountFromNativeToken(uint256 amount)
        internal
        view
        returns (uint256)
    {
        return amount * _conversionRateForStableCoins;
    }

    function _getTokenAmountFromStableCoin(uint256 amount)
        internal
        view
        returns (uint256)
    {
        return amount * _conversionRateForStableCoins;
    }

    function _swapFromNativeToken(address beneficiary, uint256 tokenAmount) internal {
        _idoWalletToSaveBenefits.transfer(msg.value);
        _idoToken.safeTransfer(beneficiary, tokenAmount);
    }

    function _swapFromStableCoins(
        address beneficiary,
        uint256 amount,
        uint256 tokenAmount,
        IERC20 acceptedToken
    ) internal {
        acceptedToken.safeTransferFrom(msg.sender, _idoWalletToSaveBenefits, amount);
        _idoToken.safeTransfer(beneficiary, tokenAmount);
    }

    function _updatePurchasingState(address beneficiary, uint256 tokens)
        internal
    {
        _distribution[beneficiary] += tokens;
    }

    function setConversionRateForNativeToken(uint256 rate) external onlyOwner()
    {
        _conversionRateForNativeToken= rate;
    }

    function getConversionRateForNativeToken() external view returns(uint256)
    {
        return _conversionRateForNativeToken;
    }

    function setConversionRateForStableCoins(uint256 rate) external onlyOwner()
    {
        _conversionRateForStableCoins = rate;
    }

    function getConversionRateForStableCoins() external view returns(uint256)
    {
        return _conversionRateForStableCoins;
    }

    function balance() external view returns(uint accountBalance)
    {
        accountBalance = _idoToken.balanceOf(address(this));
    }
}
