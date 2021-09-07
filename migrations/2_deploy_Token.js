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
    let args = [];
    if (network === 'development')
    {
        const [registryFunder, treasury, defaultOperatorA, defaultOperatorB] = accounts;
        // In a test environment an ERC777 token requires deploying an ERC1820 registry
        await singletons.ERC1820Registry(registryFunder); // founder

        args = [
            process.env.TOKEN_NAME,
            process.env.TOKEN_SYMBOL,
            [defaultOperatorA, defaultOperatorB], // operators
            new web3.utils.BN(process.env.TOKEN_INITIAL_SUPPLY),
            treasury, // treasury
            dataInception,
            dataInception
        ];

        const instance = await deployProxy(Token, args, { deployer, initializer: 'initialize' });
        console.log("Contract deployed", instance.address);
        console.log("args", args);

        await instance.unpause({ from: accounts[1] });
    }
    else if (network === 'testnet')
    {
        args = [
            process.env.TOKEN_NAME,
            process.env.TOKEN_SYMBOL,
            [process.env.TESTNET_ACCOUNT_DEFAULT_OPERATOR_A, process.env.TESTNET_ACCOUNT_DEFAULT_OPERATOR_B], // operators
            new web3.utils.BN(process.env.TOKEN_INITIAL_SUPPLY),
            process.env.TESTNET_ACCOUNT_TREASURY,
            dataInception,
            dataInception
        ];

        const instance = await deployProxy(Token, args, { deployer, initializer: 'initialize' });
        console.log("Contract deployed", instance.address);
        console.log("args", args);

        await instance.unpause({ from: process.env.TESTNET_ACCOUNT_TREASURY });
    }
};
