// A key point to note is that in a testing environment an ERC777 token requires deploying an ERC1820 registry 
// https://forum.openzeppelin.com/t/simple-erc777-token-example/746
require('@openzeppelin/test-helpers/configure')({ provider: web3.currentProvider, environment: 'truffle' });
const { BN } = require('@openzeppelin/test-helpers');

const Erc20Token = artifacts.require('ERC20_Token');

module.exports = async function (deployer, network, accounts)
{
    const [registryFunder, treasury, defaultOperatorA, defaultOperatorB] = accounts;

    let name = process.env.TOKEN_NAME;
    let symbol = process.env.TOKEN_SYMBOL;

    const decimals = 18;
    let initialSupply = new BN(process.env.TOKEN_TREASURY_SUPPLY + "0".repeat(decimals));
    let maxSupply = new BN(process.env.TOKEN_MAX_SUPPLY + "0".repeat(decimals));

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
