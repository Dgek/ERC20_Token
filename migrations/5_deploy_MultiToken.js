// A key point to note is that in a testing environment an ERC777 token requires deploying an ERC1820 registry
// https://forum.openzeppelin.com/t/simple-erc777-token-example/746
/*
require('@openzeppelin/test-helpers/configure')({ provider: web3.currentProvider, environment: 'truffle' });
const { singletons } = require('@openzeppelin/test-helpers');

const MultiToken = artifacts.require('ERC1155_MultiToken');
const { deployProxy } = require('@openzeppelin/truffle-upgrades');
const Web3 = require('web3');
const dataInception = web3.utils.sha3('inception');
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

    const instance = await deployProxy(MultiToken, [process.env.MULTI_TOKEN_TYPES_URI, treasury, [defaultOperatorA, defaultOperatorB]], { deployer, initializer: 'initialize' });
    console.log(`Contract v1 deployed: ${instance.address}`);
    console.log(`MultiToken contract v1 deployed: ${instance.address}`);
    */
};