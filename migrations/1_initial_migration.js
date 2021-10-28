const Migrations = artifacts.require('./Migrations.sol');

module.exports = function (deployer, network, accounts)
{
    process.env.NETWORK = network;

    if (network === 'local' || network === 'testnet')
    {
        console.log(accounts);
    }

    deployer.deploy(Migrations);
};
