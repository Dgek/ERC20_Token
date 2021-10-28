require('dotenv').config();

const HDWalletProvider = require("@truffle/hdwallet-provider");
//const fs = require('fs');
//const mnemonic = fs.readFileSync(".secret").toString().trim();

module.exports = {
    // See <http://truffleframework.com/docs/advanced/configuration>
    // to customize your Truffle configuration!
    networks: {
        local: {
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
            gas: 5500000,           // Gas sent with each transaction (default: ~6700000)
            gasPrice: 7000000000,  // 7 gwei (in wei) (default: 100 gwei)
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
        solana_devnet: {
            provider: () =>
            {
                return new HDWalletProvider(
                    process.env.SOLANA_MNEMONIC_DEVNET,
                    process.env.SOLANA_DEVNET,
                    process.env.WALLET_CHILD_NUMBER,
                );
            },
            network_id: "*",
            gas: 3000000,
            gasPrice: 1000000000,
        },
        solana_testnet: {
            provider: () =>
            {
                return new HDWalletProvider(
                    process.env.SOLANA_MNEMONIC_TESTNET,
                    process.env.SOLANA_TESTNET,
                    process.env.WALLET_CHILD_NUMBER,
                );
            },
            network_id: "*",
            gas: 3000000,
            gasPrice: 1000000000,
        },
        harmony_testnet: {
            provider: () =>
            {
                return new HDWalletProvider({
                    mnemonic: process.env.HARMONY_MNEMONIC_TESTNET,
                    providerOrUrl: process.env.HARMONY_TESTNET, // https://api.s0.t.hmny.io for mainnet
                    //derivationPath: `m/44'/1023'/0'/0/` --> for whatever reason this changes the address and doesn't fit with the mnemonic
                });
            },
            network_id: "1666700000",   // Shard 0
        }
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
