// A key point to note is that in a testing environment an ERC777 token requires deploying an ERC1820 registry 
// https://forum.openzeppelin.com/t/simple-erc777-token-example/746
require('@openzeppelin/test-helpers/configure')({ provider: web3.currentProvider, environment: 'truffle' });
const { BN } = require('@openzeppelin/test-helpers');

const idoContract = artifacts.require('ERC20_IDO');
const Erc20Token = artifacts.require('ERC20_Token');

module.exports = async function (deployer, network, accounts)
{
    const [registryFunder, treasury, defaultOperatorA, defaultOperatorB] = accounts;
    let idoToken;
    let acceptedToken;
    let minBuyAmount;
    let maxBuyAmountPerOrder;
    let idoWallet;
    let conversionRate;

    if (network === 'local')
    {
        idoToken = process.env.TOKEN_ADDRESS;
        acceptedToken = process.env.TOKEN_ADDRESS;
        minBuyAmount = 1;
        maxBuyAmountPerOrder = 99;
        idoWallet = treasury;
        conversionRate = 2;
    }
    else if (network === 'testnet')
    {
    }

    const token = await Erc20Token.deployed();
    const idoInstance = await deployer.deploy(idoContract, token.address, acceptedToken, minBuyAmount, maxBuyAmountPerOrder, treasury, idoWallet, conversionRate);

    console.log(`Token contract located at: ${token.address}`);
    console.log(`IDO Contract deployed! - ${idoInstance.address}`);
    //
    // Mint tokens for the IDO
    //
    const idoSupply = new BN(process.env.TOKEN_IDO_SUPPLY + "0".repeat(18));
    await token.mint(idoInstance.address, idoSupply, { from: registryFunder });
    //
    // Test after deployment
    //
    if (network === 'local')
    {
        const prettyBn = (bn) =>
        {
            let str = bn.toString();
            let returnValue;

            if (str.length >= 18)
            {
                returnValue = str.substr(0, str.length - 18).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
            }
            else
            {
                const pad = 18 - str.length;
                returnValue = "0." + "0".repeat(pad) + str;
            }
            return returnValue;
        }
        console.log(prettyBn(await token.balanceOf(idoInstance.address)));
    }
};
