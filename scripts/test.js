
const abi = [{ "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "addr", "type": "address" }], "name": "AddressFrozen", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "addr", "type": "address" }], "name": "AddressUnfrozen", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "oldAssetProtectionRole", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newAssetProtectionRole", "type": "address" }], "name": "AssetProtectionRoleSet", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "oldDelegate", "type": "address" }], "name": "BetaDelegateUnwhitelisted", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "newDelegate", "type": "address" }], "name": "BetaDelegateWhitelisted", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "oldWhitelister", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newWhitelister", "type": "address" }], "name": "BetaDelegateWhitelisterSet", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "seq", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "fee", "type": "uint256" }], "name": "BetaDelegatedTransfer", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "addr", "type": "address" }], "name": "FrozenAddressWiped", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "oldProposedOwner", "type": "address" }], "name": "OwnershipTransferDisregarded", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "currentOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "proposedOwner", "type": "address" }], "name": "OwnershipTransferProposed", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "oldOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" }], "name": "OwnershipTransferred", "type": "event" }, { "anonymous": false, "inputs": [], "name": "Pause", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "oldSupplyController", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newSupplyController", "type": "address" }], "name": "SupplyControllerSet", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "SupplyDecreased", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "SupplyIncreased", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "anonymous": false, "inputs": [], "name": "Unpause", "type": "event" }, { "inputs": [], "name": "EIP712_DOMAIN_HASH", "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [{ "internalType": "address", "name": "_owner", "type": "address" }, { "internalType": "address", "name": "_spender", "type": "address" }], "name": "allowance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [{ "internalType": "address", "name": "_spender", "type": "address" }, { "internalType": "uint256", "name": "_value", "type": "uint256" }], "name": "approve", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "assetProtectionRole", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [{ "internalType": "address", "name": "_addr", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [], "name": "betaDelegateWhitelister", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [{ "internalType": "bytes", "name": "sig", "type": "bytes" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" }, { "internalType": "uint256", "name": "fee", "type": "uint256" }, { "internalType": "uint256", "name": "seq", "type": "uint256" }, { "internalType": "uint256", "name": "deadline", "type": "uint256" }], "name": "betaDelegatedTransfer", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "bytes32[]", "name": "r", "type": "bytes32[]" }, { "internalType": "bytes32[]", "name": "s", "type": "bytes32[]" }, { "internalType": "uint8[]", "name": "v", "type": "uint8[]" }, { "internalType": "address[]", "name": "to", "type": "address[]" }, { "internalType": "uint256[]", "name": "value", "type": "uint256[]" }, { "internalType": "uint256[]", "name": "fee", "type": "uint256[]" }, { "internalType": "uint256[]", "name": "seq", "type": "uint256[]" }, { "internalType": "uint256[]", "name": "deadline", "type": "uint256[]" }], "name": "betaDelegatedTransferBatch", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "claimOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [{ "internalType": "uint256", "name": "_value", "type": "uint256" }], "name": "decreaseSupply", "outputs": [{ "internalType": "bool", "name": "success", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "disregardProposeOwner", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_addr", "type": "address" }], "name": "freeze", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_value", "type": "uint256" }], "name": "increaseSupply", "outputs": [{ "internalType": "bool", "name": "success", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_owner", "type": "address" }], "name": "initialize", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "initializeDomainSeparator", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_addr", "type": "address" }], "name": "isFrozen", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [{ "internalType": "address", "name": "_addr", "type": "address" }], "name": "isWhitelistedBetaDelegate", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [{ "internalType": "address", "name": "target", "type": "address" }], "name": "nextSeqOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [], "name": "pause", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "paused", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [{ "internalType": "address", "name": "_proposedOwner", "type": "address" }], "name": "proposeOwner", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "proposedOwner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [], "name": "reclaimToken", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_newAssetProtectionRole", "type": "address" }], "name": "setAssetProtectionRole", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_newWhitelister", "type": "address" }], "name": "setBetaDelegateWhitelister", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_newSupplyController", "type": "address" }], "name": "setSupplyController", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "supplyController", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [{ "internalType": "address", "name": "a", "type": "address" }], "name": "toBytes", "outputs": [{ "internalType": "bytes", "name": "", "type": "bytes" }], "stateMutability": "pure", "type": "function", "constant": true }, { "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [{ "internalType": "address", "name": "_to", "type": "address" }, { "internalType": "uint256", "name": "_value", "type": "uint256" }], "name": "transfer", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_from", "type": "address" }, { "internalType": "address", "name": "_to", "type": "address" }, { "internalType": "uint256", "name": "_value", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_addr", "type": "address" }], "name": "unfreeze", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "unpause", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_addr", "type": "address" }], "name": "unwhitelistBetaDelegate", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "version", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [{ "internalType": "address", "name": "_addr", "type": "address" }], "name": "whitelistBetaDelegate", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_addr", "type": "address" }], "name": "wipeFrozenAddress", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "string", "name": "_creator", "type": "string" }], "name": "initializeV2", "outputs": [], "stateMutability": "nonpayable", "type": "function" }];
const adminAccount = "0x6c2339b46F41a06f09CA0051ddAD54D1e582bA77";
const userAccount = "0xcc0c8d07064b033a330Ad916085954eea6Bd8e48";

async function main()
{
    const Web3 = require('web3');
    const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
    const contract = new web3.eth.Contract(abi, contractAddress);
    //web3.eth.defaultAccount = '0xcc0c8d07064b033a330Ad916085954eea6Bd8e48';
    //console.log(`default account: ${web3.eth.defaultAccount}`);
    //console.log(contract.options.jsonInterface);
    //console.log(contract.methods.totalSupply());

    await contract.methods.paused().call({ from: adminAccount }, async function (error, result)
    {
        console.log("Token isPaused?:", error, result);
        if (!error && result)
        {
            await contract.methods.unpause().send({ from: adminAccount })
                .on('error', function (error, receipt)
                {
                    console.log("error:", error, receipt);
                }).then(async function (receipt)
                {
                    await contract.methods.paused().call({ from: adminAccount }, function (error, result)
                    {
                        console.log("Token isPaused?:", error, result);
                    });
                });
        }
    });
    // Transfer token to a specified address from msg.sender
    await contract.methods.balanceOf(adminAccount).call({ from: adminAccount }, function (error, result)
    {
        console.log("admin balance:", error, result);
    });

    await contract.methods.increaseSupply(1000000).send({ from: adminAccount })
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
            await contract.methods.totalSupply().call({ from: userAccount }, function (error, result)
            {
                console.log("totalSupply", error, result);
            });
        });

    // Transfer token to a specified address from msg.sender
    await contract.methods.balanceOf(userAccount).call({ from: userAccount }, function (error, result)
    {
        console.log("user balance:", error, result);
    });

    await contract.methods.transfer(userAccount, 1000000).send({ from: adminAccount })
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
            await contract.methods.balanceOf(userAccount).call({ from: userAccount }, function (error, result)
            {
                console.log("user balance:", error, result);
            });
        });


    await contract.methods.pause().send({ from: adminAccount })
        .on('error', function (error, receipt)
        {
            console.log("error:", error, receipt);
        }).then(async function (receipt)
        {
            await contract.methods.paused().call({ from: adminAccount }, function (error, result)
            {
                console.log("Token isPaused?:", error, result);
            });
        });


}

module.exports = function (callback)
{
    console.log("test");
    main();
}