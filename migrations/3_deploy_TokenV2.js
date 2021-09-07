
const { deployProxy } = require('@openzeppelin/truffle-upgrades');

const TokenV2 = artifacts.require('ERC777_TokenV2');

module.exports = async function (deployer, network, accounts)
{
    if (network === 'development')
    {
        let args = [
            'Alvaro Martin'
        ];
        const instance = await deployProxy(TokenV2, ['Alvaro Martin'], { deployer, initializer: 'initializeV2' });
        console.log("Contract deployed", instance.address);
        console.log("args", args);

        await instance.unpause({ from: process.env.TESTNET_ACCOUNT_TREASURY });
    }
    else if (network === 'testnet')
    {
        let args = [
            'Alvaro Martin'
        ];
        const instance = await deployProxy(TokenV2, ['Alvaro Martin'], { deployer, initializer: 'initializeV2' });
        console.log("Contract deployed", instance.address);
        console.log("args", args);

        await instance.unpause({ from: process.env.TESTNET_ACCOUNT_TREASURY });
    }
};