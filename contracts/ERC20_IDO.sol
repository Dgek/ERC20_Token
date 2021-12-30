// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils//math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract ERC20_IDO is Context {
    using Address for address;
    using SafeERC20 for IERC20;

    IERC20 private immutable _idoToken;
    IERC20 private immutable _acceptedToken;
    uint256 private _minBuyAmount;
    uint256 private _maxBuyAmountPerOrder;
    uint256 private _conversionRate;
    address private _treasuryWallet;
    address payable private _idoWallet;

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
        IERC20 idoToken,
        IERC20 acceptedToken,
        uint256 minBuyAmount,
        uint256 maxBuyAmountPerOrder,
        address treasuryWallet,
        address idoWallet,
        uint256 conversionRate
    ) {
        require(
            address(idoToken) != address(0),
            "idoToken token is the zero address"
        );
        require(
            address(acceptedToken) != address(0),
            "acceptedToken token is the zero address"
        );

        require(minBuyAmount > 0, "minBuyAmount is not allowed to be zero");
        require(
            maxBuyAmountPerOrder > 0,
            "maxBuyAmountPerOrder is not allowed to be zero"
        );
        require(
            treasuryWallet != address(0),
            "treasuryWallet is not allowed to be zero"
        );
        require(idoWallet != address(0), "idoWallet is not allowed to be zero");
        require(conversionRate > 0, "price is not allowed to be zero");

        _idoToken = idoToken;
        _acceptedToken = acceptedToken;

        _minBuyAmount = minBuyAmount;
        _maxBuyAmountPerOrder = maxBuyAmountPerOrder;

        _treasuryWallet = treasuryWallet;
        _idoWallet = payable(idoWallet);
        _conversionRate = conversionRate;
    }

    receive() external payable {
        buyTokens(_msgSender());
    }

    fallback() external payable {
        buyTokens(_msgSender());
    }

    /**
     * @dev low level token purchase ***DO NOT OVERRIDE***
     * This function has a non-reentrancy guard, so it shouldn't be called by
     * another `nonReentrant` function.
     * @param beneficiary Recipient of the token purchase
     */
    function buyTokens(address beneficiary) public payable {
        uint256 weiAmount = msg.value;
        _preValidatePurchase(beneficiary, weiAmount);

        // calculate token amount to be created
        uint256 tokens = _getTokenAmount(weiAmount);

        _processPurchase(beneficiary, tokens);
        emit TokensPurchased(_msgSender(), beneficiary, weiAmount, tokens);

        _updatePurchasingState(beneficiary, weiAmount);

        _forwardFunds();
        _postValidatePurchase(beneficiary, weiAmount);
    }

    /**
     * @dev Validation of an incoming purchase. Use require statements to revert state when conditions are not met.
     * Use `super` in contracts that inherit from Crowdsale to extend their validations.
     * Example from CappedCrowdsale.sol's _preValidatePurchase method:
     *     super._preValidatePurchase(beneficiary, weiAmount);
     *     require(weiRaised().add(weiAmount) <= cap);
     * @param beneficiary Address performing the token purchase
     * @param weiAmount Value in wei involved in the purchase
     */
    function _preValidatePurchase(address beneficiary, uint256 weiAmount)
        internal
        view
    {
        require(
            beneficiary != address(0),
            "Crowdsale: beneficiary is the zero address"
        );
        require(weiAmount != 0, "Crowdsale: weiAmount is 0");
        this; // silence state mutability warning without generating bytecode - see https://github.com/ethereum/solidity/issues/2691
    }

    /**
     * @dev Validation of an executed purchase. Observe state and use revert statements to undo rollback when valid
     * conditions are not met.
     * @param beneficiary Address performing the token purchase
     * @param weiAmount Value in wei involved in the purchase
     */
    function _postValidatePurchase(address beneficiary, uint256 weiAmount)
        internal
        view
    {
        // solhint-disable-previous-line no-empty-blocks
    }

    /**
     * @dev Override to extend the way in which ether is converted to tokens.
     * @param weiAmount Value in wei to be converted into tokens
     * @return Number of tokens that can be purchased with the specified _weiAmount
     */
    function _getTokenAmount(uint256 weiAmount)
        internal
        view
        returns (uint256)
    {
        return weiAmount * _conversionRate;
    }

    /**
     * @dev Source of tokens. Override this method to modify the way in which the crowdsale ultimately gets and sends
     * its tokens.
     * @param beneficiary Address performing the token purchase
     * @param tokenAmount Number of tokens to be emitted
     */
    function _deliverTokens(address beneficiary, uint256 tokenAmount) internal {
        _idoToken.safeTransfer(beneficiary, tokenAmount);
    }

    /**
     * @dev Executed when a purchase has been validated and is ready to be executed. Doesn't necessarily emit/send
     * tokens.
     * @param beneficiary Address receiving the tokens
     * @param tokenAmount Number of tokens to be purchased
     */
    function _processPurchase(address beneficiary, uint256 tokenAmount)
        internal
    {
        _deliverTokens(beneficiary, tokenAmount);
    }

    /**
     * @dev Override for extensions that require an internal state to check for validity (current user contributions,
     * etc.)
     * @param beneficiary Address receiving the tokens
     * @param weiAmount Value in wei involved in the purchase
     */
    function _updatePurchasingState(address beneficiary, uint256 weiAmount)
        internal
    {
        _distribution[beneficiary] += weiAmount;
    }

    /**
     * @dev Determines how ETH is stored/forwarded on purchases.
     */
    function _forwardFunds() internal {
        _idoWallet.transfer(msg.value);
    }
}
