
const { upgradeProxy } = require('@openzeppelin/truffle-upgrades');
const { singletons } = require('@openzeppelin/test-helpers');

const TokenV1 = artifacts.require('ERC777_Token');
const TokenV2 = artifacts.require('ERC777_TokenV2');

module.exports = async function (deployer, network, accounts)
{
    const [registryFunder, treasury, defaultOperatorA, defaultOperatorB] = accounts;
    if (network === 'development')
    {
        // In a test environment an ERC777 token requires deploying an ERC1820 registry
        await singletons.ERC1820Registry(registryFunder); // founder

        const existing = await TokenV1.deployed();
        const instance = await upgradeProxy(existing.address, TokenV2, { deployer });
        await instance.setCreator("Alvaro Martin");

        console.log(`Contract ${instance.address} upgrade from ${existing.address}`);
        console.log(await (await instance.version()).toString());
        console.log(await instance.getCreator());
        console.log(await (await instance.totalSupply()).toString());
        console.log(treasury == process.env.DEVNET_ACCOUNT_TREASURY);
        console.log(await instance.isTreasury(process.env.DEVNET_ACCOUNT_TREASURY));
    }
    else if (network === 'testnet')
    {
        const existing = await TokenV1.deployed();
        const instance = await upgradeProxy(existing.address, TokenV2, ['Alvaro Martin'], { deployer, initializer: 'initializeV2' });
        await instance.setCreator("Alvaro Martin");

        console.log(`Contract ${instance.address} upgrade from ${existing.address}`);
        console.log(await (await instance.version()).toString());
        console.log(await instance.getCreator());
        console.log(await (await instance.totalSupply()).toString());
        console.log(treasury == process.env.TESTNET_ACCOUNT_TREASURY);
        console.log(await instance.isTreasury(process.env.TESTNET_ACCOUNT_TREASURY));
    }
};