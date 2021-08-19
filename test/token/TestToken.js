// see: https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/tree/master/test/token/ERC777

const Token = artifacts.require('Token.sol');
const { deployProxy } = require('@openzeppelin/truffle-upgrades');
const ERC777SenderRecipientMock = artifacts.require('ERC777SenderRecipientMockUpgradeable');

const { BN, expectEvent, expectRevert, singletons, constants } = require('@openzeppelin/test-helpers');
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

// Test that Token operates correctly as an ERC20Basic token.
contract(process.env.TOKEN_NAME, (accounts) =>
{
    const [registryFunder, treasury, defaultOperatorA, defaultOperatorB, newOperator, anyone, treasuryOperator] = accounts;
    console.log("accounts: ", registryFunder, treasury, defaultOperatorA, defaultOperatorB, newOperator, anyone, treasuryOperator);
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
        this.erc1820 = await singletons.ERC1820Registry(registryFunder); // only for dev network
        const useProxy = false;

        if (useProxy)
        {
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

            await expectRevert.unspecified(this.token.unpause());
            await expectRevert.unspecified(this.token.pause());
            await this.token.unpause({ from: treasury });
            await this.token.pause({ from: treasury });
            await this.token.unpause({ from: treasury });
            await this.token.authorizeOperator(treasuryOperator, { from: treasury });
        }
    });

    it(`symbol ${tokenArgs.symbol}`, () => { });
    it(`initialSupply ${tokenArgs.initialSupply.toString()}`, () => { });
    it(`registryFunder ${registryFunder}`, () => { });
    it(`treasury ${tokenArgs.treasury}`, () => { });
    it(`first operator ${tokenArgs.defaultOperators[0]}`, () => { });
    it(`second operator ${tokenArgs.defaultOperators[1]}`, () => { });
    it(`new operator ${newOperator}`, () => { });
    it(`user account ${anyone}`, () => { });
    it(`treasury operator ${treasuryOperator}`, () => { });

    it('upgrade smart-contract', async () =>
    {
        //console.log(tokenArgs);
        /* https://docs.openzeppelin.com/upgrades-plugins/1.x/
        it('works before and after upgrading', async function ()
        {
            const instance = await upgrades.deployProxy(Box, [42]);
            assert.strictEqual(await instance.retrieve(), 42);

            await upgrades.upgradeProxy(instance.address, BoxV2);
            assert.strictEqual(await instance.retrieve(), 42);
        });
        */
    });

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
                expect(await this.token.balanceOf(ZERO_ADDRESS)).to.be.bignumber.equal('0');
            });

            it(`returns registryFunder ${registryFunder} == zero`, async () =>
            {
                expect(await this.token.balanceOf(registryFunder)).to.be.bignumber.equal('0');
            });

            it(`returns first operator ${tokenArgs.defaultOperators[0]} == zero`, async () =>
            {
                expect(await this.token.balanceOf(tokenArgs.defaultOperators[0])).to.be.bignumber.equal('0');
            });

            it(`returns second operator ${tokenArgs.defaultOperators[1]} == zero`, async () =>
            {
                expect(await this.token.balanceOf(tokenArgs.defaultOperators[1])).to.be.bignumber.equal('0');
            });

            it(`returns anyone ${anyone} == zero`, async () =>
            {
                expect(await this.token.balanceOf(anyone)).to.be.bignumber.equal('0');
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
        context(`only treasury ${treasury} can mint the tokens of the treasury`, () =>
        {
            it(`reverts treasury ${treasury} == initialSupply using ${registryFunder}`, async () =>
            {
                await expectRevert.unspecified(
                    this.token.treasuryMint(new BN('1'), dataInUserTransaction, dataInOperatorTransaction, { from: registryFunder }),
                );
                expect(await this.token.balanceOf(treasury)).to.be.bignumber.equal(tokenArgs.initialSupply);
            });

            it(`reverts treasury ${treasury} == initialSupply using defaultOperatorA: ${defaultOperatorA}`, async () =>
            {
                await expectRevert.unspecified(
                    this.token.treasuryMint(new BN('1'), dataInUserTransaction, dataInOperatorTransaction, { from: defaultOperatorA }),
                );
                expect(await this.token.balanceOf(treasury)).to.be.bignumber.equal(tokenArgs.initialSupply);
            });

            it(`reverts treasury ${treasury} == initialSupply using defaultOperatorB: ${defaultOperatorB}`, async () =>
            {
                await expectRevert.unspecified(
                    this.token.treasuryMint(new BN('1'), dataInUserTransaction, dataInOperatorTransaction, { from: defaultOperatorB }),
                );
                expect(await this.token.balanceOf(treasury)).to.be.bignumber.equal(tokenArgs.initialSupply);
            });

            it(`reverts treasury ${treasury} == initialSupply using anyone: ${anyone}`, async () =>
            {
                await expectRevert.unspecified(
                    this.token.treasuryMint(new BN('1'), dataInUserTransaction, dataInOperatorTransaction, { from: anyone }),
                );
                expect(await this.token.balanceOf(treasury)).to.be.bignumber.equal(tokenArgs.initialSupply);
            });

            it(`returns treasury ${treasury} == initialSupply +1`, async () =>
            {
                await this.token.treasuryMint(new BN('1'), dataInUserTransaction, dataInOperatorTransaction, { from: treasury });
                const balanceAfterMint = initialSupply.addn(1);
                const balanceCurrent = await this.token.balanceOf(treasury);

                expect(balanceCurrent).to.be.bignumber.equal(balanceAfterMint);
            });

            it(`returns anyone ${anyone} == 1 using treasury operator: ${treasuryOperator}`, async () =>
            {
                const bn1 = new BN(1);
                await this.token.operatorMintTo(anyone, bn1, dataInUserTransaction, dataInOperatorTransaction, { from: treasuryOperator });
                const balanceAnyone = await this.token.balanceOf(anyone);

                expect(balanceAnyone).to.be.bignumber.equal(bn1);
            });
        });

        const selfAccountCanCanBurnItsTokens = (amount, registryFunder, treasury, defaultOperatorA, defaultOperatorB, anyone) =>
        {
            it(`returns treasury ${treasury} == initialSupply using ${registryFunder}`, async () =>
            {
                await expectRevert.unspecified(
                    this.token.burn(amount, dataInUserTransaction, { from: registryFunder }),
                );
                expect(await this.token.balanceOf(treasury)).to.be.bignumber.equal(tokenArgs.initialSupply);
            });

            it(`returns treasury ${treasury} == initialSupply using defaultOperatorA: ${defaultOperatorA}`, async () =>
            {
                await expectRevert.unspecified(
                    this.token.burn(amount, dataInUserTransaction, { from: registryFunder }),
                );
                expect(await this.token.balanceOf(treasury)).to.be.bignumber.equal(tokenArgs.initialSupply);
            });

            it(`returns treasury ${treasury} == initialSupply using defaultOperatorB: ${defaultOperatorB}`, async () =>
            {
                await expectRevert.unspecified(
                    this.token.burn(amount, dataInUserTransaction, { from: registryFunder }),
                );
                expect(await this.token.balanceOf(treasury)).to.be.bignumber.equal(tokenArgs.initialSupply);
            });

            it(`returns treasury ${treasury} == initialSupply using anyone: ${anyone}`, async () =>
            {
                await expectRevert.unspecified(
                    this.token.burn(amount, dataInUserTransaction, { from: anyone }),
                );
                expect(await this.token.balanceOf(treasury)).to.be.bignumber.equal(tokenArgs.initialSupply);
            });

            it(`returns treasury ${treasury} == initialSupply -1 using ${treasury}`, async () =>
            {
                this.token.burn(amount, dataInUserTransaction, { from: treasury });
                expect(await this.token.balanceOf(treasury)).to.be.bignumber.equal(tokenArgs.initialSupply.addn(-1));
            });

            it(`returns anyone ${anyone} == 0 after transfering 1`, async () =>
            {
                //expect(await this.token.balanceOf(treasury)).to.be.bignumber.equal(tokenArgs.initialSupply);

                await this.token.send(anyone, new BN(1), dataInUserTransaction, { from: treasury });
                expect(await this.token.balanceOf(anyone)).to.be.bignumber.equal(new BN(1));

                await this.token.operatorBurn(anyone, new BN(1), dataInUserTransaction, dataInOperatorTransaction, { from: anyone });
                expect(await this.token.balanceOf(anyone)).to.be.bignumber.equal(new BN(0));
            });
        }

        context(`only the holder account can burn the tokens of itself`, () =>
        {
            selfAccountCanCanBurnItsTokens(new BN(1), registryFunder, treasury, defaultOperatorA, defaultOperatorB, anyone);
        });

        /*
        removeBalance(this.token, treasury);

        it(`only treasury ${treasury} can burn the tokens of the treasury`, async () =>
        {
            burnAllBalance
            mintInitialSupply,
                ,
                expect(await this.token.balanceOf(treasury)).to.be.bignumber.equal(initialSupply);
        });

        it(`only treasury ${treasury} can mint tokens`, async () =>
        {
            burnAllBalance
            mintInitialSupply,
                ,
            expect(await this.token.balanceOf(treasury)).to.be.bignumber.equal(initialSupply);
        });
        */
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
            await this.token.send(anyone, new BN(1), dataInUserTransaction, { from: treasury });
            expect(await this.token.balanceOf(anyone)).to.be.bignumber.equal(new BN(1));

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

            freezeAndUnfreezeAccount(anyone, defaultOperatorA);
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
});
