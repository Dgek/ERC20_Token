require('dotenv').config();

var HDWalletProvider = require("@truffle/hdwallet-provider");

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
                    process.env.MNEMONIC_MAINNET,
                    process.env.NETWORK_ADDRESS_MAINNET,
                    process.env.WALLET_CHILD_NUMBER,
                );
            }
        },
        testnet: {
            provider: function ()
            {
                return new HDWalletProvider(
                    process.env.MNEMONIC_TESTNET,
                    process.env.NETWORK_ADDRESS_TESTNET,
                    process.env.WALLET_CHILD_NUMBER,
                );
            },
            network_id: 3,
            gas: 4000000,
            timeoutBlocks: 200,
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
    }
};
