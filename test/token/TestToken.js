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
const maxSupply = new BN(process.env.TOKEN_MAX_SUPPLY);

const dataInception = web3.utils.sha3('inception');
const dataInUserTransaction = web3.utils.sha3('OZ777TestdataInUserTransaction');
const dataInOperatorTransaction = web3.utils.sha3('OZ777TestdataInOperatorTransaction');
//
// v1
//
const hasToPrintBasicInfo = false;
const testV1 = false;
//
// v3
//
const hasToTestFlexibleStaking = true;
const hasToTestMaxSupply = false;

const bn0 = new BN("0".repeat(18));
const bn1 = new BN("1" + "0".repeat(18));
const bn2 = new BN("2" + "0".repeat(18));
const tokensToStake = new BN("1000000" + "0".repeat(18));
const percentageToDelegate = new BN(30);
//
// Simulating
// With staking difficulty in 240 gives with 1 million tokens: 1 540 404 rewards in the first year, 72420 in the second year
//
const BLOCKS_PER_DAY = 1;   // 1d is 1y
const halvingBlocksNumber = new BN(BLOCKS_PER_DAY * 365);       // Pretended when to do halvings
const stakingDifficulty = new BN(240);                          // Pretended initial difficulty

const prettyBn = (bn) =>
{
    let str = bn.toString();

    return (str.length >= 18 ? str.substr(0, str.length - 18) : "0").replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
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
        maxSupply: maxSupply,
        treasury: treasury,
        data: dataInception,
        operationData: dataInception
    };

    const travelInTimeForDays = async (daysToAdvance) =>
    {

        const blocksToAdvance = Math.round(BLOCKS_PER_DAY * daysToAdvance);
        const latest = await time.latestBlock();
        //console.log(`Current block: ${latest}`);

        await time.advanceBlockTo(parseInt(latest) + blocksToAdvance);

        const current = await time.latestBlock();
        //console.log(`Current block: ${current}`);

        assert.isTrue((current - latest) == blocksToAdvance);
    }

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
            this.token = await deployProxy(Token, [tokenArgs.name, tokenArgs.symbol, tokenArgs.defaultOperators, tokenArgs.initialSupply, tokenArgs.maxSupply, tokenArgs.treasury, tokenArgs.data, tokenArgs.operationData], { treasury, initializer: 'initialize' });
        }
        else
        {
            this.token = await Token.new({ from: registryFunder });

            let logs;
            ({ logs } = await this.token.initialize(tokenArgs.name, tokenArgs.symbol, tokenArgs.defaultOperators, tokenArgs.initialSupply, tokenArgs.maxSupply, tokenArgs.treasury, tokenArgs.data, tokenArgs.operationData));

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
            await this.token.initializeFlexibleStaking(stakingDifficulty, halvingBlocksNumber, { from: treasury });

            const { 0: _stakingDifficulty, 1: _halvingBlocksNumber } = await this.token.getFlexibleStakeDifficulty({ from: treasury });
            //console.log(`Staking Rewards difficulty set to: ${_stakingDifficulty.toString()} with halving at: ${_halvingBlocksNumber.toString()}`);
            expect(stakingDifficulty).to.be.bignumber.equal(_stakingDifficulty);
        }
    });

    if (hasToPrintBasicInfo)
    {
        it(`symbol ${tokenArgs.symbol}`, () => { });
        it(`initialSupply ${tokenArgs.initialSupply.toString()}`, () => { });
        it(`initialSupply ${tokenArgs.maxSupply.toString()}`, () => { });
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

            it('returns the max supply', async () =>
            {
                expect(await this.token.maxSupply()).to.be.bignumber.equal(maxSupply);
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

            await withNoERC777TokensSenderOrRecipient(this.token, treasury, anyone, defaultOperatorA, defaultOperatorB, newOperator, dataInUserTransaction, dataInOperatorTransaction);
        });
    }
    //
    // V3
    //
    if (hasToTestFlexibleStaking)
    {
        describe('staking functionality', () =>
        {
            it(`toss a coin to anyone`, async () =>
            {
                //
                // Toss a coin to anyone
                //
                await this.token.operatorMintTo(anyone, tokensToStake, dataInUserTransaction, dataInOperatorTransaction, { from: treasuryOperator });
                const { 0: totalBalance,
                    1: flexibleStakingBalance,
                    2: flexibleStakingBalanceDelegatedTo,
                    3: flexibleStakingBalancePercentage,
                    4: timeLockStakingBalance } = await this.token.balances({ from: anyone });
                expect(totalBalance).to.be.bignumber.equal(tokensToStake);
                expect(flexibleStakingBalance).to.be.bignumber.equal(bn0);
                expect(flexibleStakingBalanceDelegatedTo).to.be.bignumber.equal(ZERO_ADDRESS);
                expect(flexibleStakingBalancePercentage).to.be.bignumber.equal(bn0);
                expect(timeLockStakingBalance).to.be.bignumber.equal(bn0);
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

            it(`flexible stake delegated at ${percentageToDelegate}%`, async () =>
            {
                //
                // Stake all coins
                //
                await this.token.flexibleStake(stakeDelegatedTo, percentageToDelegate, { from: anyone });

                const { 0: amount, 1: delegateTo, 2: percentage } = await this.token.flexibleStakeBalance({ from: anyone });
                //console.log(`amount: ${amount.toString()}\ndelegateTo: ${delegateTo}\npercentage: ${percentage}`);
                expect(amount, "amount staked is not equal to tokensToStake").to.be.bignumber.equal(tokensToStake);
                expect(delegateTo, "delegated address is different").to.be.bignumber.equal(stakeDelegatedTo);
                expect(percentage, "percentage of delegation is different").to.be.bignumber.equal(percentageToDelegate);
            });

            it(`cannot delegate to another address before unstake`, async () =>
            {
                await expectRevert.unspecified(this.token.flexibleStake(stakeDelegatedTo, percentageToDelegate, { from: anyone }));
            });
        });

        const checkFlexibleStakingRewards = async () =>
        {
            const { 0: reward, 1: rewardDelegatedTo, 2: rewardDelegatedAmount } = await this.token.calculateFlexibleStakeReward({ from: anyone });
            console.log(`total rewards: ${prettyBn(reward.add(rewardDelegatedAmount))}\nstaking reward for holder: ${prettyBn(reward)}\ndelegated to: ${rewardDelegatedTo}\nreward delegated: ${prettyBn(rewardDelegatedAmount)}`);

            const { 0: _stakingDifficulty, 1: _halvingBlocksNumber } = await this.token.getFlexibleStakeDifficulty({ from: treasury });
            console.log(`Staking Rewards difficulty set to: ${_stakingDifficulty.toString()} with halving at: ${_halvingBlocksNumber.toString()}`);
        }

        const flexibleUnstakeAndBurn = async () =>
        {
            //
            // Before unstake
            //
            const { 0: before_totalBalance,
                1: before_flexibleStakingBalance,
                2: before_flexibleStakingBalanceDelegatedTo,
                3: before_flexibleStakingBalancePercentage,
                4: before_timeLockStakingBalance } = await this.token.balances({ from: anyone });
            console.log(`totalBalance: ${prettyBn(before_totalBalance)}\nflexibleStakingBalance: ${prettyBn(before_flexibleStakingBalance)}\nflexibleStakingBalanceDelegatedTo: ${before_flexibleStakingBalanceDelegatedTo}\nflexibleStakingBalancePercentage: ${before_flexibleStakingBalancePercentage}\ntimeLockStakingBalance: ${before_timeLockStakingBalance}`);
            expect(before_totalBalance).to.be.bignumber.equal(tokensToStake);
            expect(before_flexibleStakingBalance).to.be.bignumber.equal(tokensToStake);
            expect(before_flexibleStakingBalanceDelegatedTo).to.be.bignumber.equal(stakeDelegatedTo);
            expect(before_flexibleStakingBalancePercentage).to.be.bignumber.equal(percentageToDelegate);
            expect(before_timeLockStakingBalance).to.be.bignumber.equal(bn0);
            //
            // Unstake
            //
            await this.token.flexibleUntake({ from: anyone });
            //
            // After unstake
            //
            const { 0: after_totalBalance,
                1: after_flexibleStakingBalance,
                2: after_flexibleStakingBalanceDelegatedTo,
                3: after_flexibleStakingBalancePercentage,
                4: after_timeLockStakingBalance } = await this.token.balances({ from: anyone });
            console.log(`totalBalance: ${prettyBn(after_totalBalance)}\nflexibleStakingBalance: ${prettyBn(after_flexibleStakingBalance)}\nflexibleStakingBalanceDelegatedTo: ${after_flexibleStakingBalanceDelegatedTo}\nflexibleStakingBalancePercentage: ${after_flexibleStakingBalancePercentage}\ntimeLockStakingBalance: ${after_timeLockStakingBalance}`);
            expect(after_totalBalance).to.be.bignumber.gt(tokensToStake);
            expect(after_flexibleStakingBalance).to.be.bignumber.equal(bn0);
            expect(after_flexibleStakingBalanceDelegatedTo).to.be.bignumber.equal(ZERO_ADDRESS);
            expect(after_flexibleStakingBalancePercentage).to.be.bignumber.equal(bn0);
            expect(after_timeLockStakingBalance).to.be.bignumber.equal(bn0);

            assert.isTrue(after_totalBalance.gt(before_totalBalance));
            //
            // Burn to test the 2nd year profitability
            //            
            const balanceToBurn = after_totalBalance.sub(tokensToStake);
            await this.token.burn(balanceToBurn, dataInUserTransaction, { from: anyone });
            await this.token.burn(await this.token.balanceOf(stakeDelegatedTo, { from: stakeDelegatedTo }), dataInUserTransaction, { from: stakeDelegatedTo });
            expect(await this.token.balanceOf(anyone)).to.be.bignumber.equal(tokensToStake);
            expect(await this.token.balanceOf(stakeDelegatedTo)).to.be.bignumber.equal(bn0);
        }

        describe('time travel...', () =>
        {
            it("travel in 1 day", async () =>
            {
                await travelInTimeForDays(0);
            });

            it("rewards in 1 day", async () =>
            {
                await checkFlexibleStakingRewards();
            });

            it("travel in 7 days", async () =>
            {
                await travelInTimeForDays(6);
            });

            it("rewards in 7 days", async () =>
            {
                await checkFlexibleStakingRewards();
            });

            it("travel in 30 dayss", async () =>
            {
                await travelInTimeForDays(23);
            });

            it("rewards in 30 days", async () =>
            {
                await checkFlexibleStakingRewards();
            });

            it("travel in 3 months", async () =>
            {
                await travelInTimeForDays(60);
            });

            it("rewards in 3 months", async () =>
            {
                await checkFlexibleStakingRewards();
            });

            it("travel in 1 year", async () =>
            {
                await travelInTimeForDays(275);
            });

            it("rewards in 1 year", async () =>
            {
                await checkFlexibleStakingRewards();
            });

            it("unstake & burn rewards & stake after 1 year", async () =>
            {
                await flexibleUnstakeAndBurn();
                await this.token.flexibleStake(stakeDelegatedTo, percentageToDelegate, { from: anyone });
            });

            it("travel in 2 years", async () =>
            {
                await travelInTimeForDays(365);
            });

            it("rewards in 2 years", async () =>
            {
                await checkFlexibleStakingRewards();
            });

            it("unstake & burn rewards & stake after 2 year", async () =>
            {
                await flexibleUnstakeAndBurn();
                await this.token.flexibleStake(stakeDelegatedTo, percentageToDelegate, { from: anyone });
            });

            it("travel in 3 years", async () =>
            {
                await travelInTimeForDays(365);
            });

            it("rewards in 3 years", async () =>
            {
                await checkFlexibleStakingRewards();
            });

            it("unstake & burn rewards & stake after 3 year", async () =>
            {
                await flexibleUnstakeAndBurn();
            });
        });

        describe('2 accounts doing flexible staking do operations', () =>
        {
            it(`toss a coin to anyone and stakeDelegatedTo`, async () =>
            {
                //
                // Toss a coin to anyone
                //
                await this.token.burn(await this.token.balanceOf(anyone, { from: anyone }), dataInUserTransaction, { from: anyone });
                await this.token.burn(await this.token.balanceOf(stakeDelegatedTo, { from: stakeDelegatedTo }), dataInUserTransaction, { from: stakeDelegatedTo });
                expect(await this.token.balanceOf(anyone)).to.be.bignumber.equal(bn0);
                expect(await this.token.balanceOf(stakeDelegatedTo)).to.be.bignumber.equal(bn0);
                await this.token.operatorMintTo(anyone, tokensToStake, dataInUserTransaction, dataInOperatorTransaction, { from: treasuryOperator });
                await this.token.operatorMintTo(stakeDelegatedTo, tokensToStake, dataInUserTransaction, dataInOperatorTransaction, { from: treasuryOperator });
                expect(await this.token.balanceOf(anyone)).to.be.bignumber.equal(tokensToStake);
                expect(await this.token.balanceOf(stakeDelegatedTo)).to.be.bignumber.equal(tokensToStake);
            });

            it(`send and check flexible staking`, async () =>
            {
                //
                // Stake to each other
                //
                await this.token.flexibleStake(stakeDelegatedTo, percentageToDelegate, { from: anyone });
                await this.token.flexibleStake(anyone, percentageToDelegate, { from: stakeDelegatedTo });
                await travelInTimeForDays(1);
                //
                // Send tokens and check that grows or reduce flexible staking automatically
                //
                const anyoneLogs = await this.token.send(stakeDelegatedTo, bn1, dataInUserTransaction, { from: anyone });
                const stakeDelegatedToLogs = await this.token.send(anyone, bn1, dataInUserTransaction, { from: stakeDelegatedTo });
                //console.log(anyoneLogs.logs);
                //console.log(stakeDelegatedToLogs.logs);
                //
                // anyone log analysis
                //
                expectEvent.inLogs(anyoneLogs.logs, 'LogReduceStake', {
                    holder: anyone,
                    amount: tokensToStake.sub(bn1),
                    delegateTo: stakeDelegatedTo,
                    percentage: percentageToDelegate
                });

                expectEvent.inLogs(anyoneLogs.logs, 'LogGrowStake', {
                    holder: stakeDelegatedTo,
                    amount: tokensToStake.add(bn1),
                    delegateTo: anyone,
                    percentage: percentageToDelegate
                });
                //
                // stakeDelegatedTo log analysis
                //
                expectEvent.inLogs(stakeDelegatedToLogs.logs, 'LogReduceStake', {
                    holder: stakeDelegatedTo,
                    amount: tokensToStake.sub(bn1),
                    delegateTo: anyone,
                    percentage: percentageToDelegate
                });

                expectEvent.inLogs(stakeDelegatedToLogs.logs, 'LogGrowStake', {
                    holder: anyone,
                    amount: tokensToStake.add(bn1),
                    delegateTo: stakeDelegatedTo,
                    percentage: percentageToDelegate
                });
                expect(await this.token.balanceOf(anyone, { from: anyone })).to.be.bignumber.equal(tokensToStake);
                expect(await this.token.balanceOf(stakeDelegatedTo, { from: stakeDelegatedTo })).to.be.bignumber.equal(tokensToStake);
            });

            it(`send and check flexible staking`, async () =>
            {
            });

            it(`burn and check flexible staking`, async () =>
            {
            });
        });
    }

    if (hasToTestMaxSupply)
    {
        describe('test max supply', () =>
        {
            it(`toss a coin to anyone`, async () =>
            {
                //
                // Toss a coin to anyone
                //
                const balance = await this.token.balanceOf(anyone, { from: anyone });
                if (balance.lt(tokensToStake))
                    await this.token.operatorMintTo(anyone, tokensToStake, dataInUserTransaction, dataInOperatorTransaction, { from: treasuryOperator });
            });

            it(`mint maxSupply -1`, async () =>
            {
                const totalSupply = await this.token.totalSupply();
                const maxSupply = await this.token.maxSupply();
                const toMint = maxSupply.sub(totalSupply).sub(bn1);
                await this.token.treasuryMint(toMint, dataInUserTransaction, dataInOperatorTransaction, { from: treasury });
                const newTotalSupply = await this.token.totalSupply();

                console.log(`totalSupply: ${(totalSupply)}\nmaxSupply: ${(maxSupply)}\ntoMint: ${(toMint)}\nnewTotalSupply: ${(newTotalSupply)}`);

                const totalMinus1Coin = maxSupply.sub(totalSupply).sub(bn1);

                expect(newTotalSupply, "totalSupply == maxSupply - 1").to.be.bignumber.equal(maxSupply.sub(bn1));
            });

            it(`mint more than maxSupply returns error`, async () =>
            {
                await expectRevert.unspecified(this.token.treasuryMint(bn2, dataInUserTransaction, dataInOperatorTransaction, { from: treasury }));
            });

            it(`mint the latest coin and burn it`, async () =>
            {
                await this.token.treasuryMint(bn1, dataInUserTransaction, dataInOperatorTransaction, { from: treasury });
                await this.token.burn(bn1, dataInUserTransaction, { from: treasury });
            });

            it(`flexible stake near max supply ${percentageToDelegate}%`, async () =>
            {
                //
                // Stake all coins
                //
                await this.token.flexibleStake(stakeDelegatedTo, percentageToDelegate, { from: anyone });

                const { 0: amount, 1: delegateTo, 2: percentage } = await this.token.flexibleStakeBalance({ from: anyone });
                //console.log(`amount: ${amount.toString()}\ndelegateTo: ${delegateTo}\npercentage: ${percentage}`);
                expect(amount, "amount staked is not equal to tokensToStake").to.be.bignumber.equal(tokensToStake);
                expect(delegateTo, "delegated address is different").to.be.bignumber.equal(stakeDelegatedTo);
                expect(percentage, "percentage of delegation is different").to.be.bignumber.equal(percentageToDelegate);
            });

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

            it(`flexible unstake returns +1 delegated +0`, async () =>
            {
                //
                // Calculate rewards
                //
                //const { 0: reward, 1: rewardDelegatedTo, 2: rewardDelegatedAmount } = await this.token.calculateFlexibleStakeReward({ from: anyone });
                //console.log(`staking reward for holder: ${prettyBn(reward)}\ndelegated to: ${rewardDelegatedTo}\nreward delegated: ${prettyBn(rewardDelegatedAmount)}`);
                //
                // Unstake
                //
                await this.token.flexibleUntake({ from: anyone });
                //
                // Max supply reached
                //
                const totalSupply = await this.token.totalSupply();
                const maxSupply = await this.token.maxSupply();
                expect(totalSupply, "didn't reach max supply").to.be.bignumber.equal(maxSupply);
            });

            it(`Burn all balance in the treasury previously created to text max supply`, async () =>
            {
                const treasuryBalance = await this.token.balanceOf(treasury, { from: treasury });

                await this.token.burn(treasuryBalance, dataInUserTransaction, { from: treasury });
                await this.token.treasuryMint(bn1, dataInUserTransaction, dataInOperatorTransaction, { from: treasury });
            });
        });
    }
});
