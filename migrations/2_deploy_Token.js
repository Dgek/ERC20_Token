// A key point to note is that in a testing environment an ERC777 token requires deploying an ERC1820 registry 
// https://forum.openzeppelin.com/t/simple-erc777-token-example/746
/*
require('@openzeppelin/test-helpers/configure')({ provider: web3.currentProvider, environment: 'truffle' });
const { singletons, BN } = require('@openzeppelin/test-helpers');

const Token = artifacts.require('ERC777_Token');
const { deployProxy } = require('@openzeppelin/truffle-upgrades');
const Web3 = require('web3');
const dataInception = web3.utils.sha3('AlvaroMartin');
*/
module.exports = async function (deployer, network, accounts)
{
    /*
    const [registryFunder, treasury, defaultOperatorA, defaultOperatorB] = accounts;

    if (network === 'local')
    {
        // In a test environment an ERC777 token requires deploying an ERC1820 registry
        await singletons.ERC1820Registry(registryFunder); // founder
    }
    else if (network === 'testnet')
    {
    }
    const initialSupply = new BN(process.env.TOKEN_TREASURY_SUPPLY + "0".repeat(18));
    const maxSupply = new BN(process.env.TOKEN_MAX_SUPPLY + "0".repeat(18));

    const args = [
        process.env.TOKEN_NAME,
        process.env.TOKEN_SYMBOL,
        [defaultOperatorA, defaultOperatorB], // operators
        initialSupply,
        maxSupply,
        treasury,
        dataInception,
        dataInception
    ];
    console.log(`Token Name: ${args[0]}\nSymbol: ${args[1]}\nOperator A: ${args[2][0]}\nOperator B: ${args[2][1]}\nInitial Supply: ${args[3].toString()}\nMax Supply: ${args[4].toString()}\nIDO Supply: ${args[5]}\nTreasury Account: ${args[6]}`);

    const instance = await deployProxy(Token, args, { deployer, initializer: 'initialize' });
    console.log(`Contract v1 deployed: ${instance.address}`);
    process.env.TOKEN_ADDRESS = instance.address;

    await instance.unpause();
    console.log(`Contract v1 unpaused!`);
    */
};
