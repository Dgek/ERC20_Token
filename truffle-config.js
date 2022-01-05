require('dotenv').config();

const HDWalletProvider = require("@truffle/hdwallet-provider");

module.exports = {
    // See <http://truffleframework.com/docs/advanced/configuration>
    // to customize your Truffle configuration!
    networks: {
        local: {
            host: "127.0.0.1",
            port: 8545, // ganache-cli
            network_id: "2222", // Match any network id
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
            confirmations: 0,
            timeoutBlocks: 200,
            websockets: true,
            skipDryRun: true
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
            confirmations: 0,
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
            confirmations: 0,
            timeoutBlocks: 200,
            skipDryRun: true
        },
        harmony_testnet: {
            provider: () =>
            {
                return new HDWalletProvider(
                    process.env.HARMONY_MNEMONIC_TESTNET,
                    process.env.HARMONY_TESTNET,
                    process.env.WALLET_CHILD_NUMBER,
                );
            },
            network_id: 1666700000,   // Shard 0
            confirmations: 0,
            timeoutBlocks: 200,
            skipDryRun: true
        },
        bsc_testnet: {
            provider: () => new HDWalletProvider(
                process.env.BSC_MNEMONIC_TESTNET,
                process.env.BSC_TESTNET,
                process.env.WALLET_CHILD_NUMBER),
            network_id: 97,
            confirmations: 0,
            timeoutBlocks: 200,
            skipDryRun: true
        },
        avalanche_testnet: {
            provider: function ()
            {
                return new HDWalletProvider(
                    process.env.AVALANCHE_MNEMONIC_TESTNET,
                    process.env.AVALANCHE_TESTNET,
                    process.env.WALLET_CHILD_NUMBER,
                );
            },
            network_id: "*",
            confirmations: 0,
            timeoutBlocks: 200,
            skipDryRun: true
        },
        fantom_testnet: {
            provider: function ()
            {
                return new HDWalletProvider(
                    process.env.FANTOM_MNEMONIC_TESTNET,
                    process.env.FANTOM_TESTNET,
                    process.env.WALLET_CHILD_NUMBER,
                );
            },
            network_id: "*",
            confirmations: 0,
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
        timeout: 9999999999
    }
};
