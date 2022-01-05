const Ido = artifacts.require('ERC20_IDO');
const Erc20Token = artifacts.require('ERC20_Token');
const IdoTreasury = artifacts.require('ERC20_IDO_Treasury');

const USDT = artifacts.require('StableCoinTest');
const USDC = artifacts.require('StableCoinTest');

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

module.exports = async function (deployer, network, accounts)
{
    const isTestnet = network.indexOf('testnet') !== -1;
    const [registryFunder, treasury, operator] = accounts;
    //
    // ERC 20 Token
    //
    let idoTokenContract;
    const decimals = 18;
    if (network === 'local' || process.env.BLOCKCHAIN_NETWORK_TARGET_FOR_TOKEN === network)
    {
        let name = process.env.TOKEN_NAME;
        let symbol = process.env.TOKEN_SYMBOL;

        let initialSupply = process.env.TOKEN_TREASURY_SUPPLY + "0".repeat(decimals);
        let maxSupply = process.env.TOKEN_MAX_SUPPLY + "0".repeat(decimals);

        await deployer.deploy(Erc20Token, name, symbol, initialSupply, maxSupply, treasury);
        idoTokenContract = await Erc20Token.deployed();
        console.log(`Erc20Token contract located at: ${idoTokenContract.address}`);
    }
    //
    // IDO Treasury
    //
    let idoTreasuryContract;
    if (network === 'local' || process.env.BLOCKCHAIN_NETWORK_TARGET_FOR_TOKEN === network)
    {
        await deployer.deploy(IdoTreasury, idoTokenContract.address, operator);
        idoTreasuryContract = await IdoTreasury.deployed();
        console.log(`IDO Treasury contract located at: ${idoTreasuryContract.address}`);
        //
        // Mint tokens for the IDO
        //
        const idoSupply = process.env.TOKEN_IDO_SUPPLY + "0".repeat(decimals);
        await idoTokenContract.mint(idoTreasuryContract.address, idoSupply, { from: registryFunder });
        console.log(`IDO Token - ${await idoTreasuryContract.getIdoTokenAddress()}`);
        console.log(`IDO Treasiry balance: ${prettyBn(await idoTreasuryContract.balance())}`);
    }
    //
    // Stable Coins
    //
    let UsdtTokenContract;
    let UsdcTokenContract;
    if (network === 'local' || isTestnet)
    {
        let name_usdt = "Wild USDT";
        let symbol_usdt = "USDT";

        let name_usdc = "Wild USDC";
        let symbol_usdc = "USDC";

        let initialSupply = "100" + "0".repeat(18);

        await deployer.deploy(USDT, name_usdt, symbol_usdt, initialSupply);
        UsdtTokenContract = await USDT.deployed();
        //console.log(`${name_usdt} located at: ${UsdtTokenContract.address}`);

        await deployer.deploy(USDC, name_usdc, symbol_usdc, initialSupply);
        UsdcTokenContract = await USDC.deployed();
        //console.log(`${name_usdc} located at: ${UsdcTokenContract.address}`);
    }
    //
    // IDO
    //
    let idoContract;
    {
        let allowedNativeToken;
        let idoWalletToSaveBenefits;
        let acceptedStableCoins;
        let conversionRateForNativeToken;
        let conversionRateForStableCoins;

        if (network === 'local' || isTestnet)
        {
            acceptedStableCoins = [UsdtTokenContract.address, UsdcTokenContract.address];

            allowedNativeToken = true;
            idoWalletToSaveBenefits = treasury;
            conversionRateForNativeToken = "1234" + "0".repeat(18);
            conversionRateForStableCoins = "4";
        }
        
        const supplyPerBlockchain = process.env.MAX_TOKEN_SUPPLY_PER_BLOCKCHAIN + "0".repeat(decimals);
        await deployer.deploy(Ido, allowedNativeToken, supplyPerBlockchain, operator, idoWalletToSaveBenefits, acceptedStableCoins, conversionRateForNativeToken, conversionRateForStableCoins);
        idoContract = await Ido.deployed();

        console.log(`IDO Contract - ${idoContract.address}`);
        console.log(`Operator Account - ${operator}`);
        console.log(`acceptedStableCoins: ${acceptedStableCoins}`);
    }
    //
    // Test after deployment
    //
    /*
    if (network === 'local' || isTestnet)
    {
        console.log(`Setting initial price of native token`);
        await idoContract.setPriceOfNativeToken("43213" + "0".repeat(17), { from: operator }); // 4321.3
        const getPriceOfNativeToken = await idoContract.getPriceOfNativeToken();
        console.log(`getPriceOfNativeToken: ${prettyBn(getPriceOfNativeToken)}`);
        
        console.log(`Blanace of contract using token: ${prettyBn(await idoTokenContract.balanceOf(idoContract.address))}`);
        console.log(`Blanace of contract: ${prettyBn(await idoContract.balance())}`);
        console.log(`Blanace of contract: ${(await idoContract.balance()).toString()}`);

        console.log(`${await idoContract.getTokenAmountFromNativeToken("1")}`);
        console.log(`${await idoContract.getTokenAmountFromNativeToken("1000000000000000000")}`);
    }
    */
};
