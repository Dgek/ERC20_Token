/*
const { upgradeProxy } = require('@openzeppelin/truffle-upgrades');
const { singletons } = require('@openzeppelin/test-helpers');

const TokenV1 = artifacts.require('ERC777_Token');
const TokenV2 = artifacts.require('ERC777_TokenV2');
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

    const existing = await TokenV1.deployed();
    const instance = await upgradeProxy(existing.address, TokenV2, { deployer });
    console.log(`Contract v2 ${instance.address} upgrade from ${existing.address}`);

    await instance.setCreator("Alvaro Martin");

    console.log(`Creator - v2: ${await instance.getCreator()}`);
    console.log(`Total Supply - v1: ${await (await instance.totalSupply()).toString()}`);
    console.log(`Is still treasury - v1: ${await instance.isTreasury(treasury)}`);
    */
};