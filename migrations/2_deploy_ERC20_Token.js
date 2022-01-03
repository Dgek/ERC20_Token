const Erc20Token = artifacts.require('ERC20_Token');

module.exports = async function (deployer, network, accounts)
{
    const [registryFunder, treasury, defaultOperatorA, defaultOperatorB] = accounts;

    let name = process.env.TOKEN_NAME;
    let symbol = process.env.TOKEN_SYMBOL;

    const decimals = 18;
    let initialSupply = process.env.TOKEN_TREASURY_SUPPLY + "0".repeat(decimals);
    let maxSupply = process.env.TOKEN_MAX_SUPPLY + "0".repeat(decimals);

    if (network === 'local')
    {
    }
    else if (network === 'testnet')
    {
    }
    
    await deployer.deploy(Erc20Token, name, symbol, initialSupply, maxSupply, treasury);
    process.env.TOKEN_ADDRESS = Erc20Token.address;
    console.log(`Erc20Token contract located at: ${process.env.TOKEN_ADDRESS}`);
};
