
const { deployProxy } = require('@openzeppelin/truffle-upgrades');

const TokenV2 = artifacts.require('TokenV2');

module.exports = async function (deployer, network, accounts)
{
    if (network === 'development')
    {
        let args = [
            'Alvaro Martin'
        ];
        await deployProxy(TokenV2, ['Alvaro Martin'], { deployer, initializer: 'initializeV2' });
    }
};