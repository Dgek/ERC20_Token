// see: https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/tree/master/test/token/ERC777

const Token = artifacts.require('ERC777_TokenV3.sol');
const { deployProxy } = require('@openzeppelin/truffle-upgrades');
const ERC777SenderRecipientMock = artifacts.require('ERC777SenderRecipientMockUpgradeable');

const { BN, expectEvent, expectRevert, singletons, constants, time } = require('@openzeppelin/test-helpers');
const { ZERO_ADDRESS } = constants;
const { expect } = require('chai');

const {
    withNoERC777TokensSenderOrRecipient,
} = require('./ERC777.behavior');

const initialSupply = new BN(process.env.TOKEN_INITIAL_SUPPLY);
console.log(process.env.TOKEN_NAME, process.env.TOKEN_SYMBOL, initialSupply.toString());

const dataInception = web3.utils.sha3('inception');
const dataInUserTransaction = web3.utils.sha3('OZ777TestdataInUserTransaction');
const dataInOperatorTransaction = web3.utils.sha3('OZ777TestdataInOperatorTransaction');

const testBasics = true;
const testV1 = true;
const testV3 = true;
const bn0 = new BN("0".repeat(18));
const bn1 = new BN("1" + "0".repeat(18));
const bn2 = new BN("2" + "0".repeat(18));
const tokensToStake = new BN("1000000" + "0".repeat(18));
//
// Simulating
//
const BLOCKS_PER_DAY = 1;   // 1d is 1y
const halvingBlocksNumber = new BN(BLOCKS_PER_DAY * 365);     // Pretended when to do halvings
const stakingDifficulty = new BN(240);                     // Pretended initial difficulty

const prettyReward = (bn) =>
{
    let str = bn.toString();

    return str.length >= 18 ? str.substr(0, str.length - 18) : "0";
}

// Test that Token operates correctly as an ERC20Basic token.
contract(process.env.TOKEN_NAME, (accounts) =>
{
    const [registryFunder, treasury, defaultOperatorA, defaultOperatorB, newOperator, anyone, treasuryOperator, stakeDelegatedTo] = accounts;
    // Handy struct for future operations and tests
    const tokenArgs = {
        name: process.env.TOKEN_NAME,
        symbol: process.env.TOKEN_SYMBOL,
        defaultOperators: [defaultOperatorA, defaultOperatorB],
        initialSupply: initialSupply,
        treasury: treasury,
        data: dataInception,
        operationData: dataInception
    };

    beforeEach(async () =>
    {
        //
        // To not reset the contract
        //
        if (this.token != undefined)
        {
            return;
        }

        this.erc1820 = await singletons.ERC1820Registry(registryFunder); // only for dev network
        const useProxy = false;

        if (useProxy)
        {
            //
            // TODO: do all deployments and updates to test
            //
            this.token = await deployProxy(Token, [tokenArgs.name, tokenArgs.symbol, tokenArgs.defaultOperators, tokenArgs.initialSupply, tokenArgs.treasury, tokenArgs.data, tokenArgs.operationData], { treasury, initializer: 'initialize' });
        }
        else
        {
            this.token = await Token.new({ from: registryFunder });

            let logs;
            ({ logs } = await this.token.initialize(tokenArgs.name, tokenArgs.symbol, tokenArgs.defaultOperators, tokenArgs.initialSupply.toString(), tokenArgs.treasury, tokenArgs.data, tokenArgs.operationData));

            expectEvent.inLogs(logs, 'Minted', {
                operator: registryFunder,
                to: treasury,
                amount: tokenArgs.initialSupply,
                data: dataInception,
                operatorData: dataInception
            });
            //
            // V1
            //
            if (await this.token.paused())
            {
                await this.token.unpause();
                console.log(`is contract paused? ${await this.token.paused()}`)
            }
            await this.token.authorizeOperator(treasuryOperator, { from: treasury });
            //
            // V3
            //
            await this.token.setBlockNumberWhenCreated(await this.token.getBlockNumberWhenCreated(), { from: treasury });
            await this.token.setFlexibleStakeDifficulty(stakingDifficulty, halvingBlocksNumber, { from: treasury });

            const { 0: _stakingDifficulty, 1: _halvingBlocksNumber } = await this.token.getFlexibleStakeDifficulty({ from: treasury });
            console.log(`Staking Rewards difficulty set to: ${_stakingDifficulty.toString()} with halving at: ${_halvingBlocksNumber.toString()}`);

            expect(stakingDifficulty).to.be.bignumber.equal(_stakingDifficulty);
        }
    });

    if (testBasics)
    {
        it(`symbol ${tokenArgs.symbol}`, () => { });
        it(`initialSupply ${tokenArgs.initialSupply.toString()}`, () => { });
        it(`registryFunder ${registryFunder}`, () => { });
        it(`treasury ${tokenArgs.treasury}`, () => { });
        it(`first operator ${tokenArgs.defaultOperators[0]}`, () => { });
        it(`second operator ${tokenArgs.defaultOperators[1]}`, () => { });
        it(`new operator ${newOperator}`, () => { });
        it(`user account ${anyone}`, () => { });
        it(`treasury operator ${treasuryOperator}`, () => { });
    }
    //
    // V1
    //
    if (testV1)
    {
        describe('basic information', () =>
        {
            it('returns the name', async () =>
            {
                expect(await this.token.name()).to.equal(tokenArgs.name);
            });

            it('returns the symbol', async () =>
            {
                expect(await this.token.symbol()).to.equal(tokenArgs.symbol);
            });

            it('returns a granularity of 1', async () =>
            {
                expect(await this.token.granularity()).to.be.bignumber.equal('1');
            });

            it('returns the default operators', async () =>
            {
                expect(await this.token.defaultOperators()).to.deep.equal(tokenArgs.defaultOperators);
            });

            it('default operators are operators for all accounts', async () =>
            {
                for (const operator of tokenArgs.defaultOperators)
                {
                    expect(await this.token.isOperatorFor(operator, anyone)).to.equal(true);
                }
            });

            it('returns the total supply', async () =>
            {
                expect(await this.token.totalSupply()).to.be.bignumber.equal(initialSupply);
            });

            it('returns 18 when decimals is called', async () =>
            {
                expect(await this.token.decimals()).to.be.bignumber.equal('18');
            });

            it('the ERC777Token interface is registered in the registry', async () =>
            {
                expect(await this.erc1820.getInterfaceImplementer(this.token.address, web3.utils.soliditySha3('ERC777Token')))
                    .to.equal(this.token.address);
            });

            it('the ERC20Token interface is registered in the registry', async () =>
            {
                expect(await this.erc1820.getInterfaceImplementer(this.token.address, web3.utils.soliditySha3('ERC20Token')))
                    .to.equal(this.token.address);
            });
        });

        describe('balanceOf', () =>
        {
            context('for an account with no tokens', () =>
            {
                it(`returns ZERO_ADDRESS ${ZERO_ADDRESS} == zero`, async () =>
                {
                    expect(await this.token.balanceOf(ZERO_ADDRESS)).to.be.bignumber.equal(bn0);
                });

                it(`returns registryFunder ${registryFunder} == zero`, async () =>
                {
                    expect(await this.token.balanceOf(registryFunder)).to.be.bignumber.equal(bn0);
                });

                it(`returns first operator ${tokenArgs.defaultOperators[0]} == zero`, async () =>
                {
                    expect(await this.token.balanceOf(tokenArgs.defaultOperators[0])).to.be.bignumber.equal(bn0);
                });

                it(`returns second operator ${tokenArgs.defaultOperators[1]} == zero`, async () =>
                {
                    expect(await this.token.balanceOf(tokenArgs.defaultOperators[1])).to.be.bignumber.equal(bn0);
                });

                it(`returns anyone ${anyone} == zero`, async () =>
                {
                    expect(await this.token.balanceOf(anyone)).to.be.bignumber.equal(bn0);
                });
            });

            context('for an account with tokens', () =>
            {
                it(`returns treasury ${treasury} == initialSupply ${initialSupply}`, async () =>
                {
                    expect(await this.token.balanceOf(treasury)).to.be.bignumber.equal(initialSupply);
                });
            });
        });

        describe(`only treasury ${treasury} can mint tokens`, () =>
        {
            it(`reverts treasuryMint using registryFunder: ${registryFunder}`, async () =>
            {
                this.token.treasuryMint(bn1, dataInUserTransaction, dataInOperatorTransaction, { from: registryFunder });
                expect(await this.token.balanceOf(registryFunder), "registryFunder == 0").to.be.bignumber.equal(bn0);
            });

            it(`reverts treasuryMint using defaultOperatorA: ${defaultOperatorA}`, async () =>
            {
                await expectRevert.unspecified(
                    this.token.treasuryMint(bn1, dataInUserTransaction, dataInOperatorTransaction, { from: defaultOperatorA }),
                );
            });

            it(`reverts treasuryMint using defaultOperatorB: ${defaultOperatorB}`, async () =>
            {
                await expectRevert.unspecified(
                    this.token.treasuryMint(bn1, dataInUserTransaction, dataInOperatorTransaction, { from: defaultOperatorB }),
                );
            });

            it(`reverts treasuryMint using anyone: ${anyone}`, async () =>
            {
                await expectRevert.unspecified(
                    this.token.treasuryMint(bn1, dataInUserTransaction, dataInOperatorTransaction, { from: anyone }),
                );
            });

            it(`treasury mints to everybody`, async () =>
            {
                //
                // Toss coins
                //
                await this.token.treasuryMint(bn1, dataInUserTransaction, dataInOperatorTransaction, { from: treasury });
                await this.token.treasuryMintTo(registryFunder, bn1, dataInUserTransaction, dataInOperatorTransaction, { from: treasury });
                await this.token.treasuryMintTo(defaultOperatorA, bn1, dataInUserTransaction, dataInOperatorTransaction, { from: treasury });
                await this.token.treasuryMintTo(defaultOperatorB, bn1, dataInUserTransaction, dataInOperatorTransaction, { from: treasury });
                await this.token.treasuryMintTo(anyone, bn1, dataInUserTransaction, dataInOperatorTransaction, { from: treasury });

                expect(await this.token.balanceOf(registryFunder), "registryFunder == 1").to.be.bignumber.equal(bn1);
                expect(await this.token.balanceOf(defaultOperatorA), "defaultOperatorA == 1").to.be.bignumber.equal(bn1);
                expect(await this.token.balanceOf(defaultOperatorB), "defaultOperatorB == 1").to.be.bignumber.equal(bn1);
                expect(await this.token.balanceOf(anyone), "anyone == 1").to.be.bignumber.equal(bn1);
            });

            it(`returns anyone ${anyone} == 1 using treasury operator: ${treasuryOperator}`, async () =>
            {
                await this.token.operatorMintTo(anyone, bn1, dataInUserTransaction, dataInOperatorTransaction, { from: treasuryOperator });
                const balanceAnyone = await this.token.balanceOf(anyone);

                expect(balanceAnyone).to.be.bignumber.equal(bn2);
            });
        });

        describe(`only the holder account can burn the tokens of itself`, () =>
        {
            it(`returns registryFunder: ${registryFunder} balance == 0`, async () =>
            {
                const currentBalance = await this.token.balanceOf(registryFunder);

                await this.token.burn(currentBalance, dataInUserTransaction, { from: registryFunder });
                expect(await this.token.balanceOf(registryFunder)).to.be.bignumber.equal(bn0);
            });

            it(`returns defaultOperatorA: ${defaultOperatorA} balance == 0`, async () =>
            {
                const currentBalance = await this.token.balanceOf(defaultOperatorA);

                await this.token.burn(currentBalance, dataInUserTransaction, { from: defaultOperatorA });
                expect(await this.token.balanceOf(defaultOperatorA)).to.be.bignumber.equal(bn0);
            });

            it(`returns defaultOperatorB: ${defaultOperatorB} balance == 0`, async () =>
            {
                const currentBalance = await this.token.balanceOf(defaultOperatorB);

                await this.token.burn(currentBalance, dataInUserTransaction, { from: defaultOperatorB });
                expect(await this.token.balanceOf(defaultOperatorB)).to.be.bignumber.equal(bn0);
            });

            it(`returns anyone: ${anyone} balance == 0`, async () =>
            {
                const currentBalance = await this.token.balanceOf(anyone);

                await this.token.burn(currentBalance, dataInUserTransaction, { from: anyone });
                expect(await this.token.balanceOf(anyone)).to.be.bignumber.equal(bn0);
            });

            it(`returns treasury: ${treasury} balance == 0`, async () =>
            {
                const currentBalance = await this.token.balanceOf(treasury);
                const difference = currentBalance.sub(tokenArgs.initialSupply);

                await this.token.burn(difference, dataInUserTransaction, { from: treasury });
                expect(await this.token.balanceOf(treasury)).to.be.bignumber.equal(tokenArgs.initialSupply);
            });
        });

        describe('frozen accounts', () =>
        {
            const freezeAndUnfreezeAccount = (address, operator) =>
            {
                it(`freeze and unfreeze ${address}`, async () =>
                {
                    let logs;
                    ({ logs } = await this.token.freeze(address, { from: operator }));

                    expectEvent.inLogs(logs, 'AddressFrozen', {
                        addr: address
                    });

                    ({ logs } = await this.token.unfreeze(address, { from: operator }));
                    expectEvent.inLogs(logs, 'AddressUnfrozen', {
                        addr: address
                    });
                });
            }

            it('treasury cannot be frozen', async () =>
            {
                await expectRevert.unspecified(this.token.freeze(treasury, { from: registryFunder }));
                await expectRevert.unspecified(this.token.freeze(treasury, { from: treasury }));    // even by mistake
            });

            it('anyone cannot freeze accounts', async () =>
            {
                await expectRevert.unspecified(this.token.freeze(defaultOperatorA, { from: anyone }));
            });

            it('registryFunder cannot freeze accounts', async () =>
            {
                await expectRevert.unspecified(this.token.freeze(defaultOperatorA, { from: registryFunder }));
            });

            it('treasury can freeze accounts', async () =>
            {
                freezeAndUnfreezeAccount(defaultOperatorA, treasury);
            });

            it('set a new protector and freeze anyone account', async () =>
            {
                let logs;
                ({ logs } = await this.token.setAssetProtectionRole(defaultOperatorA, { from: treasury }));

                expectEvent.inLogs(logs, 'AssetProtectionRoleSet', {
                    oldAssetProtectionRole: treasury,
                    newAssetProtectionRole: defaultOperatorA
                });

                freezeAndUnfreezeAccount(anyone, defaultOperatorA);

                await expectRevert.unspecified(this.token.freeze(treasury, { from: defaultOperatorA }));    // no one can freeze the tresury account
                await expectRevert.unspecified(this.token.wipeFrozenAddress(treasury, web3.utils.sha3('badboy'), { from: defaultOperatorA }));    // no one can wipe the tresury account


                ({ logs } = await this.token.setAssetProtectionRole(treasury, { from: defaultOperatorA }));

                expectEvent.inLogs(logs, 'AssetProtectionRoleSet', {
                    oldAssetProtectionRole: defaultOperatorA,
                    newAssetProtectionRole: treasury
                });
            });

            it('transfer 1 token to anyone and wipe account', async () =>
            {
                await this.token.send(anyone, bn1, dataInUserTransaction, { from: treasury });
                expect(await this.token.balanceOf(anyone)).to.be.bignumber.equal(bn1);

                await expectRevert.unspecified(this.token.wipeFrozenAddress(treasury, web3.utils.sha3('badboy'), { from: treasury }));    // no one can wipe the tresury account

                let logs;
                ({ logs } = await this.token.freeze(anyone, { from: treasury }));

                expectEvent.inLogs(logs, 'AddressFrozen', {
                    addr: anyone
                });
                ({ logs } = await this.token.wipeFrozenAddress(anyone, web3.utils.sha3('badboy'), { from: treasury }));

                expectEvent.inLogs(logs, 'FrozenAddressWiped', {
                    addr: anyone
                });

                ({ logs } = await this.token.unfreeze(anyone, { from: treasury }));
                expectEvent.inLogs(logs, 'AddressUnfrozen', {
                    addr: anyone
                });
            });
        });

        it('with no ERC777TokensSender and no ERC777TokensRecipient implementers', async () =>
        {
            let balances = {}
            balances.initialSupply = (await this.token.initialSupply()).toString();
            balances.registryFunder = (await this.token.balanceOf(registryFunder)).toString();
            balances.treasury = (await this.token.balanceOf(treasury)).toString();
            balances.anyone = (await this.token.balanceOf(anyone)).toString();
            balances.defaultOperatorA = (await this.token.balanceOf(defaultOperatorA)).toString();
            balances.defaultOperatorB = (await this.token.balanceOf(defaultOperatorB)).toString();
            balances.newOperator = (await this.token.balanceOf(newOperator)).toString();
            console.log(balances);

            withNoERC777TokensSenderOrRecipient(this.token, treasury, anyone, defaultOperatorA, defaultOperatorB, newOperator, dataInUserTransaction, dataInOperatorTransaction);
        });
    }
    //
    // V3
    //
    if (testV3)
    {
        describe('staking functionality', () =>
        {
            it(`toss a coin to anyone`, async () =>
            {
                //
                // Toss a coin to anyone
                //
                await this.token.operatorMintTo(anyone, tokensToStake, dataInUserTransaction, dataInOperatorTransaction, { from: treasuryOperator });
                const balanceAnyone = await this.token.balanceOf(anyone, { from: anyone });
                expect(balanceAnyone).to.be.bignumber.equal(tokensToStake);
            });

            it(`cannot flexible stake delegated at -1%`, async () =>
            {
                try
                {
                    await this.token.flexibleStake(stakeDelegatedTo, -1, { from: anyone })
                    assert.fail("The transaction should have thrown an error");
                }
                catch (err)
                {
                    assert.include(err.code, "INVALID_ARGUMENT");
                }
            });

            it(`flexible stake delegated at 101%`, async () =>
            {
                await expectRevert.unspecified(this.token.flexibleStake(stakeDelegatedTo, 101, { from: anyone }));
            });

            it(`flexible stake delegated at 1%`, async () =>
            {
                //
                // Stake all coins
                //
                await this.token.flexibleStake(stakeDelegatedTo, new BN(1), { from: anyone });

                const { 0: amount, 1: delegateTo, 2: percentage } = await this.token.flexibleStakeBalance({ from: anyone });
                //console.log(`amount: ${amount.toString()}\ndelegateTo: ${delegateTo}\npercentage: ${percentage}`);
                expect(amount, "amount staked is not equal to tokensToStake").to.be.bignumber.equal(tokensToStake);
                expect(delegateTo, "delegated address is different").to.be.bignumber.equal(stakeDelegatedTo);
                expect(percentage, "percentage of delegation is different").to.be.bignumber.equal(new BN(1));
            });

            it(`cannot delegate to another address before unstake`, async () =>
            {
                await expectRevert.unspecified(this.token.flexibleStake(stakeDelegatedTo, new BN(1), { from: anyone }));
            });
        });

        describe('time travel...', () =>
        {
            it("travel in 1 day", async () =>
            {
                const blocksToAdvance = Math.round(BLOCKS_PER_DAY);
                const latest = await time.latestBlock();
                //console.log(`Current block: ${latest}`);

                await time.advanceBlockTo(parseInt(latest) + blocksToAdvance);

                const current = await time.latestBlock();
                //console.log(`Current block: ${current}`);

                assert.isTrue((current - latest) == blocksToAdvance);
            });

            it("rewards in 1 day", async () =>
            {
                const { 0: reward, 1: rewardDelegatedTo, 2: rewardDelegatedAmount } = await this.token.calculateFlexibleStakeReward({ from: anyone });
                console.log(`total rewards: ${prettyReward(reward.add(rewardDelegatedAmount))}\nstaking reward for holder: ${prettyReward(reward)}\ndelegated to: ${rewardDelegatedTo}\nreward delegated: ${prettyReward(rewardDelegatedAmount)}`);
            });

            it("travel in 7 days", async () =>
            {
                const blocksToAdvance = Math.round(BLOCKS_PER_DAY * 6);
                const latest = await time.latestBlock();
                //console.log(`Current block: ${latest}`);

                await time.advanceBlockTo(parseInt(latest) + blocksToAdvance);

                const current = await time.latestBlock();
                //console.log(`Current block: ${current}`);

                assert.isTrue((current - latest) == blocksToAdvance);
            });

            it("rewards in 7 days", async () =>
            {
                const { 0: reward, 1: rewardDelegatedTo, 2: rewardDelegatedAmount } = await this.token.calculateFlexibleStakeReward({ from: anyone });
                console.log(`total rewards: ${prettyReward(reward.add(rewardDelegatedAmount))}\nstaking reward for holder: ${prettyReward(reward)}\ndelegated to: ${rewardDelegatedTo}\nreward delegated: ${prettyReward(rewardDelegatedAmount)}`);
            });

            it("travel in 30 dayss", async () =>
            {
                const blocksToAdvance = Math.round(BLOCKS_PER_DAY * 23);
                const latest = await time.latestBlock();
                //console.log(`Current block: ${latest}`);

                await time.advanceBlockTo(parseInt(latest) + blocksToAdvance);

                const current = await time.latestBlock();
                //console.log(`Current block: ${current}`);

                assert.isTrue((current - latest) == blocksToAdvance);
            });

            it("rewards in 30 days", async () =>
            {
                const { 0: reward, 1: rewardDelegatedTo, 2: rewardDelegatedAmount } = await this.token.calculateFlexibleStakeReward({ from: anyone });
                console.log(`total rewards: ${prettyReward(reward.add(rewardDelegatedAmount))}\nstaking reward for holder: ${prettyReward(reward)}\ndelegated to: ${rewardDelegatedTo}\nreward delegated: ${prettyReward(rewardDelegatedAmount)}`);
            });

            it("travel in 3 months", async () =>
            {
                const blocksToAdvance = Math.round(BLOCKS_PER_DAY * 60);
                const latest = await time.latestBlock();
                //console.log(`Current block: ${latest}`);

                await time.advanceBlockTo(parseInt(latest) + blocksToAdvance);

                const current = await time.latestBlock();
                //console.log(`Current block: ${current}`);

                assert.isTrue((current - latest) == blocksToAdvance);
            });

            it("rewards in 3 months", async () =>
            {
                const { 0: reward, 1: rewardDelegatedTo, 2: rewardDelegatedAmount } = await this.token.calculateFlexibleStakeReward({ from: anyone });
                console.log(`total rewards: ${prettyReward(reward.add(rewardDelegatedAmount))}\nstaking reward for holder: ${prettyReward(reward)}\ndelegated to: ${rewardDelegatedTo}\nreward delegated: ${prettyReward(rewardDelegatedAmount)}`);
            });

            it("travel in 1 year", async () =>
            {
                const blocksToAdvance = Math.round(BLOCKS_PER_DAY * 275);
                const latest = await time.latestBlock();
                //console.log(`Current block: ${latest}`);

                await time.advanceBlockTo(parseInt(latest) + blocksToAdvance);

                const current = await time.latestBlock();
                //console.log(`Current block: ${current}`);

                assert.isTrue((current - latest) == blocksToAdvance);
            });

            it("rewards in 1 year", async () =>
            {
                const { 0: reward, 1: rewardDelegatedTo, 2: rewardDelegatedAmount } = await this.token.calculateFlexibleStakeReward({ from: anyone });
                console.log(`total rewards: ${prettyReward(reward.add(rewardDelegatedAmount))}\nstaking reward for holder: ${prettyReward(reward)}\ndelegated to: ${rewardDelegatedTo}\nreward delegated: ${prettyReward(rewardDelegatedAmount)}`);
            });

            it("unstake & burn rewards & stake after 1 year", async () =>
            {
                //
                // Unstake
                //
                await this.token.flexibleUntake({ from: anyone });
                const currentBalance = await this.token.balanceOf(anyone);
                //console.log(`current balance: ${prettyReward(currentBalance)}`);
                //
                // Burn to test the 2nd year profitability
                //            
                const balanceToBurn = currentBalance.sub(tokensToStake);
                await this.token.burn(balanceToBurn, dataInUserTransaction, { from: anyone });
                expect(await this.token.balanceOf(anyone)).to.be.bignumber.equal(tokensToStake);

                await this.token.flexibleStake(stakeDelegatedTo, 30, { from: anyone });
            });

            it("travel in 2 years", async () =>
            {
                const blocksToAdvance = Math.round(BLOCKS_PER_DAY * 365);
                const latest = await time.latestBlock();
                //console.log(`Current block: ${latest}`);

                await time.advanceBlockTo(parseInt(latest) + blocksToAdvance);

                const current = await time.latestBlock();
                //console.log(`Current block: ${current}`);

                assert.isTrue((current - latest) == blocksToAdvance);
            });

            it("rewards in 2 years", async () =>
            {
                const { 0: reward, 1: rewardDelegatedTo, 2: rewardDelegatedAmount } = await this.token.calculateFlexibleStakeReward({ from: anyone });
                console.log(`total rewards: ${prettyReward(reward.add(rewardDelegatedAmount))}\nstaking reward for holder: ${prettyReward(reward)}\ndelegated to: ${rewardDelegatedTo}\nreward delegated: ${prettyReward(rewardDelegatedAmount)}`);
            });
        });

        describe('check my staking rewards', () =>
        {
            it(`returns anyone ${anyone} unstaked rewards`, async () =>
            {
                //
                // Double check the balance
                //
                const balanceAnyone = await this.token.balanceOf(anyone, { from: anyone });
                expect(balanceAnyone).to.be.bignumber.equal(tokensToStake);
                //
                // Double check the staking balance
                //
                const { 0: amount, 1: delegateTo, 2: percentage } = await this.token.flexibleStakeBalance({ from: anyone });
                //console.log(`amount: ${amount.toString()}\ndelegateTo: ${delegateTo}\npercentage: ${percentage}`);
                expect(amount, "amount staked is not equal to tokensToStake").to.be.bignumber.equal(tokensToStake);
                expect(delegateTo, "delegated address is different").to.be.bignumber.equal(stakeDelegatedTo);
                expect(percentage, "percentage of delegation is different").to.be.bignumber.equal(new BN(1));
            });

            it(`returns anyone ${anyone} += rewards`, async () =>
            {
                //
                // Check balances before unstake
                //
                const balanceHolderOld = await this.token.balanceOf(anyone, { from: anyone });
                const balanceDelegateOld = await this.token.balanceOf(stakeDelegatedTo, { from: stakeDelegatedTo });
                expect(balanceHolderOld, `balanceHolderOld: ${balanceHolderOld.toString()} == ${tokensToStake.toString()}`).to.be.bignumber.equal(tokensToStake);
                expect(balanceDelegateOld, `balanceDelegateOld: ${balanceDelegateOld.toString()} == ${bn0.toString()}`).to.be.bignumber.equal(bn0);
                //
                // Calculate rewards
                //
                const { 0: reward, 1: rewardDelegatedTo, 2: rewardDelegatedAmount } = await this.token.calculateFlexibleStakeReward({ from: anyone });
                console.log(`staking reward for holder: ${prettyReward(reward)}\ndelegated to: ${rewardDelegatedTo}\nreward delegated: ${prettyReward(rewardDelegatedAmount)}`);
                //
                // Unstake
                //
                await this.token.flexibleUntake({ from: anyone });
                //
                // Check the new balances
                //
                const balanceHolderNew = await this.token.balanceOf(anyone, { from: anyone });
                const balanceDelegateNew = await this.token.balanceOf(stakeDelegatedTo, { from: stakeDelegatedTo });
                const result = tokensToStake.add(reward);
                console.log(`Balance holder: ${prettyReward(balanceHolderNew)} == ${prettyReward(tokensToStake)} + ${prettyReward(reward)} (${prettyReward(result)})`);
                console.log(`Balance of delegator: ${prettyReward(balanceDelegateNew)} - rewardDelegatedAmount: ${prettyReward(rewardDelegatedAmount)}`);
                expect(balanceHolderNew, `balanceHolderNew: ${balanceHolderNew.toString()} == ${tokensToStake.toString()} + ${reward.toString()} (${result.toString()})`).to.be.bignumber.gte(result);
                expect(balanceDelegateNew, `balanceDelegateNew should be ${bn0.toString()} + ${rewardDelegatedAmount.toString()}`).to.be.bignumber.gte(rewardDelegatedAmount);
            });
        });
    }
});
