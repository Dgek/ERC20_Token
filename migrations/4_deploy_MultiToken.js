// A key point to note is that in a testing environment an ERC777 token requires deploying an ERC1820 registry
// https://forum.openzeppelin.com/t/simple-erc777-token-example/746
require('@openzeppelin/test-helpers/configure')({ provider: web3.currentProvider, environment: 'truffle' });
const { singletons } = require('@openzeppelin/test-helpers');

const MultiToken = artifacts.require('ERC1155_MultiToken');
const { deployProxy } = require('@openzeppelin/truffle-upgrades');
const Web3 = require('web3');
const dataInception = web3.utils.sha3('inception');

module.exports = async function (deployer, network, accounts)
{
    const uri = process.env.MULTI_TOKEN_URI;
    if (network === 'development')
    {
        const [registryFunder, treasury, defaultOperatorA, defaultOperatorB] = accounts;
        // In a test environment an ERC777 token requires deploying an ERC1820 registry
        await singletons.ERC1820Registry(registryFunder); // founder

        const instance = await deployProxy(MultiToken, [uri], { deployer, initializer: 'initialize' });
        console.log("Contract MultiToken deployed", instance.address);
    }
};