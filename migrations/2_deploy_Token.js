// A key point to note is that in a testing environment an ERC777 token requires deploying an ERC1820 registry 
// https://forum.openzeppelin.com/t/simple-erc777-token-example/746
require('@openzeppelin/test-helpers/configure')({ provider: web3.currentProvider, environment: 'truffle' });
const { singletons } = require('@openzeppelin/test-helpers');

const Token = artifacts.require('ERC777_Token');
const { deployProxy } = require('@openzeppelin/truffle-upgrades');
const Web3 = require('web3');
const dataInception = web3.utils.sha3('AlvaroMartin');

module.exports = async function (deployer, network, accounts)
{
    const [registryFunder, treasury, defaultOperatorA, defaultOperatorB] = accounts;

    if (network === 'development')
    {
        // In a test environment an ERC777 token requires deploying an ERC1820 registry
        await singletons.ERC1820Registry(registryFunder); // founder
    }
    else if (network === 'testnet')
    {
    }
    const initialSupply = new web3.utils.BN(process.env.TOKEN_INITIAL_SUPPLY);
    const maxSupply = new web3.utils.BN(process.env.TOKEN_MAX_SUPPLY);

    const args = [
        process.env.TOKEN_NAME,
        process.env.TOKEN_SYMBOL,
        [defaultOperatorA, defaultOperatorB], // operators
        initialSupply,
        maxSupply,
        treasury, // treasury
        dataInception,
        dataInception
    ];

    const instance = await deployProxy(Token, args, { deployer, initializer: 'initialize' });
    console.log(`Contract v1 deployed: ${instance.address}`);
    console.log(`Token Name: ${process.env.TOKEN_NAME}\nSymbol: ${process.env.TOKEN_SYMBOL}\nTreasury Account: ${treasury}\nOperator A: ${defaultOperatorA}\nOperator B: ${defaultOperatorB}\nInitial Supply: ${initialSupply.toString()}\nMax Supply: ${maxSupply.toString()}`);

    await instance.unpause();
};
