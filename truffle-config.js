require('dotenv').config();

const HDWalletProvider = require("@truffle/hdwallet-provider");
const gasUsage = 8e3;   // max per block
//const fs = require('fs');
//const mnemonic = fs.readFileSync(".secret").toString().trim();

module.exports = {
    // See <http://truffleframework.com/docs/advanced/configuration>
    // to customize your Truffle configuration!
    networks: {
        development: {
            host: "127.0.0.1",
            port: 8545, // ganache-cli
            network_id: "*", // Match any network id
            gas: 6700000,
            gasPrice: 0x01
        },
        coverage: {
            host: "localhost",
            network_id: "*",
            port: 8321,
            gas: 10000000000000,
            gasPrice: 0x01
        },

        mainnet: {
            network_id: 1,
            provider: function ()
            {
                return new HDWalletProvider(
                    process.env.ETH_MNEMONIC_MAINNET,
                    process.env.ETH_MAINNET,
                    process.env.WALLET_CHILD_NUMBER,
                );
            }
        },
        testnet: {
            provider: function ()
            {
                return new HDWalletProvider(
                    process.env.ETH_MNEMONIC_TESTNET,
                    process.env.ETH_TESTNET,
                    process.env.WALLET_CHILD_NUMBER,
                );
            },
            network_id: 3,
            gas: gasUsage,
            timeoutBlocks: 300,
            skipDryRun: false
        },
        matic_testnet: {
            provider: function ()
            {
                return new HDWalletProvider(
                    process.env.MATIC_MNEMONIC_TESTNET,
                    process.env.MATIC_TESTNET,
                    process.env.WALLET_CHILD_NUMBER,
                );
            },
            network_id: 80001,
            confirmations: 2,
            timeoutBlocks: 200,
            skipDryRun: true
        },
        matic_mainnet: {
            provider: function ()
            {
                return new HDWalletProvider(
                    process.env.MATIC_MNEMONIC_MAINNET,
                    process.env.MATIC_MAINNET,
                    process.env.WALLET_CHILD_NUMBER,
                );
            },
            network_id: 137,
            confirmations: 2,
            timeoutBlocks: 200,
            skipDryRun: true
        },
    },
    compilers: {
        solc: {
            version: "^0.8" // ex:  "0.4.20". (Default: Truffle's installed solc)
        }
    },
    solc: {
        optimizer: {
            enabled: true,
            runs: 200
        }
    },
    mocha: {
        enableTimeouts: false,
    }
};
