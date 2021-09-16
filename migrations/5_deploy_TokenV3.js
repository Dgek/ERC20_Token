
const { upgradeProxy } = require('@openzeppelin/truffle-upgrades');
const { singletons, BN } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

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
    console.log(`Contract v3 ${instance.address} upgrade from ${existing.address}`);

    const stakingDifficulty = new BN(600000000000);
    await instance.setFlexibleStakeDifficulty(stakingDifficulty);

    const _difficulty = await instance.getFlexibleStakeDifficulty({ from: treasury });
    console.log(`Staking Rewards difficulty set to: ${_difficulty.toString()}`);

    expect(stakingDifficulty).to.be.bignumber.equal(_difficulty);

    console.log(`Creator - v2: ${await instance.getCreator()}`);
    console.log(`Total Supply - v1: ${await (await instance.totalSupply()).toString()}`);
    console.log(`Is still treasury - v1: ${await instance.isTreasury(treasury)}`);
};