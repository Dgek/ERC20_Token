
const { upgradeProxy } = require('@openzeppelin/truffle-upgrades');
const { singletons } = require('@openzeppelin/test-helpers');

const TokenV2 = artifacts.require('ERC777_TokenV2');
const TokenV3 = artifacts.require('ERC777_TokenV3');

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

    const existing = await TokenV2.deployed();
    const instance = await upgradeProxy(existing.address, TokenV3, { deployer });
    await instance.setCreator("Alvaro Martin");

    console.log(`Contract ${instance.address} upgrade from ${existing.address}`);
    console.log(await (await instance.version()).toString());
    console.log(await instance.getCreator());
    console.log(await (await instance.totalSupply()).toString());
    console.log(await instance.isTreasury(treasury));
};