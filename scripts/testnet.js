
const abi_tokenV1 = [{ "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "addr", "type": "address" }], "name": "AddressFrozen", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "addr", "type": "address" }], "name": "AddressUnfrozen", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "oldAssetProtectionRole", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newAssetProtectionRole", "type": "address" }], "name": "AssetProtectionRoleSet", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "operator", "type": "address" }, { "indexed": true, "internalType": "address", "name": "tokenHolder", "type": "address" }], "name": "AuthorizedOperator", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "balanceFrom", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "balanceTo", "type": "uint256" }], "name": "Balance", "type": "event" }, { "anonymous": false, "inputs": [], "name": "BeforeTokenTransfer", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "operator", "type": "address" }, { "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "bytes", "name": "data", "type": "bytes" }, { "indexed": false, "internalType": "bytes", "name": "operatorData", "type": "bytes" }], "name": "Burned", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "addr", "type": "address" }], "name": "FrozenAddressWiped", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "operator", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "bytes", "name": "data", "type": "bytes" }, { "indexed": false, "internalType": "bytes", "name": "operatorData", "type": "bytes" }], "name": "Minted", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "account", "type": "address" }], "name": "Paused", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "operator", "type": "address" }, { "indexed": true, "internalType": "address", "name": "tokenHolder", "type": "address" }], "name": "RevokedOperator", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "operator", "type": "address" }, { "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "bytes", "name": "data", "type": "bytes" }, { "indexed": false, "internalType": "bytes", "name": "operatorData", "type": "bytes" }], "name": "Sent", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "account", "type": "address" }], "name": "Unpaused", "type": "event" }, { "inputs": [{ "internalType": "address", "name": "holder", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" }], "name": "allowance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "approve", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "assetProtectionRole", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [{ "internalType": "address", "name": "operator", "type": "address" }], "name": "authorizeOperator", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "tokenHolder", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "bytes", "name": "data", "type": "bytes" }], "name": "burn", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "pure", "type": "function", "constant": true }, { "inputs": [], "name": "defaultOperators", "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [{ "internalType": "address", "name": "_addr", "type": "address" }], "name": "freeze", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "granularity", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [], "name": "initialSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [{ "internalType": "address", "name": "_addr", "type": "address" }], "name": "isFrozen", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [{ "internalType": "address", "name": "operator", "type": "address" }, { "internalType": "address", "name": "tokenHolder", "type": "address" }], "name": "isOperatorFor", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [{ "internalType": "address", "name": "treasury", "type": "address" }], "name": "isTreasury", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "bytes", "name": "data", "type": "bytes" }, { "internalType": "bytes", "name": "operatorData", "type": "bytes" }], "name": "operatorBurn", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "sender", "type": "address" }, { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "bytes", "name": "data", "type": "bytes" }, { "internalType": "bytes", "name": "operatorData", "type": "bytes" }], "name": "operatorSend", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "pause", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "paused", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [{ "internalType": "address", "name": "operator", "type": "address" }], "name": "revokeOperator", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "bytes", "name": "data", "type": "bytes" }], "name": "send", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_newAssetProtectionRole", "type": "address" }], "name": "setAssetProtectionRole", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [{ "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transfer", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "holder", "type": "address" }, { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_addr", "type": "address" }], "name": "unfreeze", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "unpause", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_addr", "type": "address" }, { "internalType": "bytes", "name": "operatorData", "type": "bytes" }], "name": "wipeFrozenAddress", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "string", "name": "name", "type": "string" }, { "internalType": "string", "name": "symbol", "type": "string" }, { "internalType": "address[]", "name": "defaultOperators", "type": "address[]" }, { "internalType": "uint256", "name": "creationSupply", "type": "uint256" }, { "internalType": "address", "name": "treasury", "type": "address" }, { "internalType": "bytes", "name": "data", "type": "bytes" }, { "internalType": "bytes", "name": "operatorData", "type": "bytes" }], "name": "initialize", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "bytes", "name": "userData", "type": "bytes" }, { "internalType": "bytes", "name": "operatorData", "type": "bytes" }], "name": "treasuryMint", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "bytes", "name": "userData", "type": "bytes" }, { "internalType": "bytes", "name": "operatorData", "type": "bytes" }], "name": "treasuryMintTo", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "bytes", "name": "userData", "type": "bytes" }, { "internalType": "bytes", "name": "operatorData", "type": "bytes" }], "name": "operatorMintTo", "outputs": [], "stateMutability": "nonpayable", "type": "function" }];
const abi_tokenV2 = [{ "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "addr", "type": "address" }], "name": "AddressFrozen", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "addr", "type": "address" }], "name": "AddressUnfrozen", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "oldAssetProtectionRole", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newAssetProtectionRole", "type": "address" }], "name": "AssetProtectionRoleSet", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "operator", "type": "address" }, { "indexed": true, "internalType": "address", "name": "tokenHolder", "type": "address" }], "name": "AuthorizedOperator", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "balanceFrom", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "balanceTo", "type": "uint256" }], "name": "Balance", "type": "event" }, { "anonymous": false, "inputs": [], "name": "BeforeTokenTransfer", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "operator", "type": "address" }, { "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "bytes", "name": "data", "type": "bytes" }, { "indexed": false, "internalType": "bytes", "name": "operatorData", "type": "bytes" }], "name": "Burned", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "addr", "type": "address" }], "name": "FrozenAddressWiped", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "operator", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "bytes", "name": "data", "type": "bytes" }, { "indexed": false, "internalType": "bytes", "name": "operatorData", "type": "bytes" }], "name": "Minted", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "account", "type": "address" }], "name": "Paused", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "operator", "type": "address" }, { "indexed": true, "internalType": "address", "name": "tokenHolder", "type": "address" }], "name": "RevokedOperator", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "operator", "type": "address" }, { "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "bytes", "name": "data", "type": "bytes" }, { "indexed": false, "internalType": "bytes", "name": "operatorData", "type": "bytes" }], "name": "Sent", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "account", "type": "address" }], "name": "Unpaused", "type": "event" }, { "inputs": [{ "internalType": "address", "name": "holder", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" }], "name": "allowance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "approve", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "assetProtectionRole", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "operator", "type": "address" }], "name": "authorizeOperator", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "tokenHolder", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "bytes", "name": "data", "type": "bytes" }], "name": "burn", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "pure", "type": "function" }, { "inputs": [], "name": "defaultOperators", "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_addr", "type": "address" }], "name": "freeze", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "granularity", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "initialSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "string", "name": "name", "type": "string" }, { "internalType": "string", "name": "symbol", "type": "string" }, { "internalType": "address[]", "name": "defaultOperators", "type": "address[]" }, { "internalType": "uint256", "name": "creationSupply", "type": "uint256" }, { "internalType": "address", "name": "treasury", "type": "address" }, { "internalType": "bytes", "name": "data", "type": "bytes" }, { "internalType": "bytes", "name": "operatorData", "type": "bytes" }], "name": "initialize", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_addr", "type": "address" }], "name": "isFrozen", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "operator", "type": "address" }, { "internalType": "address", "name": "tokenHolder", "type": "address" }], "name": "isOperatorFor", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "treasury", "type": "address" }], "name": "isTreasury", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "bytes", "name": "data", "type": "bytes" }, { "internalType": "bytes", "name": "operatorData", "type": "bytes" }], "name": "operatorBurn", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "bytes", "name": "userData", "type": "bytes" }, { "internalType": "bytes", "name": "operatorData", "type": "bytes" }], "name": "operatorMintTo", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "sender", "type": "address" }, { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "bytes", "name": "data", "type": "bytes" }, { "internalType": "bytes", "name": "operatorData", "type": "bytes" }], "name": "operatorSend", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "pause", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "paused", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "operator", "type": "address" }], "name": "revokeOperator", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "bytes", "name": "data", "type": "bytes" }], "name": "send", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_newAssetProtectionRole", "type": "address" }], "name": "setAssetProtectionRole", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transfer", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "holder", "type": "address" }, { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "bytes", "name": "userData", "type": "bytes" }, { "internalType": "bytes", "name": "operatorData", "type": "bytes" }], "name": "treasuryMint", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "bytes", "name": "userData", "type": "bytes" }, { "internalType": "bytes", "name": "operatorData", "type": "bytes" }], "name": "treasuryMintTo", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_addr", "type": "address" }], "name": "unfreeze", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "unpause", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "version", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_addr", "type": "address" }, { "internalType": "bytes", "name": "operatorData", "type": "bytes" }], "name": "wipeFrozenAddress", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "getCreator", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "string", "name": "_creator", "type": "string" }], "name": "setCreator", "outputs": [], "stateMutability": "nonpayable", "type": "function" }];


require('dotenv').config();

const { BN, expectEvent, expectRevert, singletons, constants } = require('@openzeppelin/test-helpers');
var HDWalletProvider = require("@truffle/hdwallet-provider");
const Web3 = require('web3');
const token_contract_address = "0xccF477c326cdcB0F4acfA598Ab2DCa59A2aAe717";

async function once(mnemonic, rpc_url)
{
    const provider = new HDWalletProvider(
        mnemonic,
        rpc_url
    );
    const web3 = new Web3(provider);
    const [registryFunder, treasury, defaultOperatorA, defaultOperatorB, user] = await web3.eth.getAccounts();


    const contract = new web3.eth.Contract(abi_tokenV2, token_contract_address);
    //console.log(`default account: ${web3.eth.defaultAccount}`);
    //console.log(contract.options.jsonInterface);
    console.log(await contract.methods.totalSupply());

    await contract.methods.version().call(function (error, result)
    {
        console.log(`Contract version: ${result}`);
    });

    await contract.methods.getCreator().call(function (error, result)
    {
        console.log(`Creator name: ${result}`);
    });

    await contract.methods.paused().call({ from: treasury }, async function (error, result)
    {
        console.log("Token paused?:", error, result);
        if (!error && result)
        {
            await contract.methods.unpause().send({ from: treasury })
                .on('error', function (error, receipt)
                {
                    console.log("error:", error, receipt);
                }).then(async function (receipt)
                {
                    await contract.methods.paused().call({ from: treasury }, function (error, result)
                    {
                        console.log("Token paused?:", error, result);
                    });
                });
        }
    });

    // Transfer token to a specified address from msg.sender
    await contract.methods.balanceOf(treasury).call({ from: treasury }, function (error, result)
    {
        console.log("treasury balance:", error, result);
    });

    const dataInUserTransaction_treasuryMint = web3.utils.sha3("Who's the winner of the reward");
    const dataInOperatorTransaction_treasuryMint = web3.utils.sha3("Let's give a reward");
    await contract.methods.treasuryMint(new BN("1" + "0".repeat(18)), dataInUserTransaction_treasuryMint, dataInOperatorTransaction_treasuryMint).send({ from: treasury })
        .on('transactionHash', function (hash)
        {
            //console.log("transactionHash", hash);
        })
        .on('receipt', function (receipt)
        {
            //console.log("receipt", receipt);
        })
        .on('confirmation', function (confirmationNumber, receipt)
        {
            //console.log("confirmation", confirmationNumber, receipt);
        })
        .on('error', function (error, receipt)
        {
            console.log("error:", error, receipt);
        }).then(async function (receipt)
        {
            console.log("receipt", receipt.transactionHash);
            await contract.methods.totalSupply().call({ from: user }, function (error, result)
            {
                console.log("totalSupply", error, result);
            });
        });

    const dataInUserTransaction_send = web3.utils.sha3("You've got a reward");
    await contract.methods.send(user, new BN("1" + "0".repeat(18)), dataInUserTransaction_send).send({ from: treasury })
        .on('transactionHash', function (hash)
        {
            //console.log("transactionHash", hash);
        })
        .on('receipt', function (receipt)
        {
            //console.log("receipt", receipt);
        })
        .on('confirmation', function (confirmationNumber, receipt)
        {
            //console.log("confirmation", confirmationNumber, receipt);
        })
        .on('error', function (error, receipt)
        {
            console.log("error:", error, receipt);
        }).then(async function (receipt)
        {
            console.log("receipt", receipt.transactionHash);

            // Transfer token to a specified address from msg.sender
            await contract.methods.balanceOf(user).call({ from: user }, function (error, result)
            {
                console.log("user balance:", error, result);
            });
        });

    console.log("\n\n\n\n\n\n\n\nEND\n\n\n\n\n\n\n\n");
    process.exit(0);
    /*
    await contract.methods.pause().send({ from: treasury })
        .on('error', function (error, receipt)
        {
            console.log("error:", error, receipt);
        }).then(async function (receipt)
        {
            await contract.methods.paused().call({ from: treasury }, function (error, result)
            {
                console.log("Token paused?:", error, result);
            });
        });
    */
}
//
// Make plugins? https://www.trufflesuite.com/docs/truffle/getting-started/writing-external-scripts
//
/* "test-testnet": "truffle exec scripts/testnet.js --network testnet",
module.exports = async function (callback)
{
    console.log("test");
    main();
}
*/
// node argv.js matic_testnet matic_mainnet three four five
const args = process.argv.slice(2);
console.log('args: ', args);

switch (args[0])
{
    case 'matic_testnet':
        const mnemonic = process.env.MATIC_MNEMONIC_TESTNET
        const rpc_url = process.env.MATIC_TESTNET
        once(mnemonic, rpc_url);
        break;
    case 'matic_mainnet':
        break;
    default:
        console.log('Sorry, that is not something I know how to do.');
}

