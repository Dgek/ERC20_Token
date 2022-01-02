// A key point to note is that in a testing environment an ERC777 token requires deploying an ERC1820 registry 
// https://forum.openzeppelin.com/t/simple-erc777-token-example/746
require('@openzeppelin/test-helpers/configure')({ provider: web3.currentProvider, environment: 'truffle' });
const { BN } = require('@openzeppelin/test-helpers');

const idoContract = artifacts.require('ERC20_IDO');
const Erc20Token = artifacts.require('ERC20_Token');

module.exports = async function (deployer, network, accounts)
{
    const token = await Erc20Token.deployed();

    const [registryFunder, treasury, operator] = accounts;
    let allowedNativeToken;
    let idoToken;
    let idoWalletToSaveBenefits;
    let acceptedStableCoins;
    let conversionRateForNativeToken;
    let conversionRateForStableCoins;

    if (network === 'local' || network === 'testnet')
    {
        allowedNativeToken = true;
        idoToken = process.env.TOKEN_ADDRESS;
        oracleAccount = operator;
        idoWalletToSaveBenefits = treasury;
        acceptedStableCoins = [token.address, token.address, token.address, token.address];
        conversionRateForNativeToken = "1234" + "0".repeat(18);
        conversionRateForStableCoins = "4";
    }
    //else if (network === 'testnet')
    //{
    //}
    
    await deployer.deploy(idoContract, allowedNativeToken, token.address, oracleAccount, idoWalletToSaveBenefits, acceptedStableCoins, conversionRateForNativeToken, conversionRateForStableCoins);
    const idoInstance = await idoContract.deployed();

    console.log(`Operator Account - ${oracleAccount}`);
    console.log(`IDO Contract deployed! - ${idoInstance.address}`);
    console.log(`Token contract located at: ${token.address}`);
    //
    // Mint tokens for the IDO
    //
    const idoSupply = new BN(process.env.TOKEN_IDO_SUPPLY + "0".repeat(18));
    await token.mint(idoInstance.address, idoSupply, { from: registryFunder });
    //
    // Test after deployment
    //
    if (network === 'local' || network === 'testnet')
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
        console.log(`operator account: ${operator}`);
        await idoInstance.setPriceOfNativeToken("43213" + "0".repeat(17), { from: operator }); // 4321.3
        const getPriceOfNativeToken = await idoInstance.getPriceOfNativeToken();
        console.log(`getPriceOfNativeToken: ${prettyBn(getPriceOfNativeToken)}`);
        
        console.log(`Blanace of contract using token: ${prettyBn(await token.balanceOf(idoInstance.address))}`);
        console.log(`Blanace of contract: ${prettyBn(await idoInstance.balance())}`);
        console.log(`Blanace of contract: ${(await idoInstance.balance()).toString()}`);



        console.log(`${await idoInstance.getTokenAmountFromNativeToken("1")}`);
        console.log(`${await idoInstance.getTokenAmountFromNativeToken("1000000000000000000")}`);
    }
};
