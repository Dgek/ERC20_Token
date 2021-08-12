// see: https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/tree/master/test/token/ERC777

const Token = artifacts.require('Token.sol');

const { BN, expectEvent, expectRevert, singletons, constants } = require('@openzeppelin/test-helpers');
const { ZERO_ADDRESS } = constants;
const initialSupply = new BN(process.env.TOKEN_INITIAL_SUPPLY);
console.log(process.env.TOKEN_NAME, process.env.TOKEN_SYMBOL, initialSupply);

const userData = web3.utils.sha3('OZ777TestData');
const operatorData = web3.utils.sha3('OZ777TestOperatorData');

// Test that Token operates correctly as an ERC20Basic token.
contract('ERC20Basic Token', (accounts) =>
{
    const [owner, operator, user] = accounts;

    // Handy struct for future operations and tests
    const tokenArgs = {
        name: process.env.TOKEN_NAME,
        symbol: process.env.TOKEN_SYMBOL,
        defaultOperators: [operator],
        initialSupply: process.env.TOKEN_INITIAL_SUPPLY,
        owner: owner
    };

    beforeEach(async () =>
    {
        const erc1820 = await singletons.ERC1820Registry(owner); // only for dev network
        this.token = await Token.new({ from: owner });
        await this.token.initialize(tokenArgs.name, tokenArgs.symbol, tokenArgs.defaultOperators, tokenArgs.initialSupply, tokenArgs.owner);
    });

    it('log', async () =>
    {
        console.log(tokenArgs);
    });

    describe('basic data', () =>
    {
        it('has getters for the name, symbol, and decimals', async () =>
        {
            const name = await this.token.name();
            assert.equal(name, tokenArgs.name);
            const symbol = await this.token.symbol();
            assert.equal(symbol, tokenArgs.symbol);
            const decimals = await this.token.decimals();
            assert.equal(decimals, 18); // ERC777 standard
        });
    });

    describe('total supply', () =>
    {
        it('returns the total amount of tokens at the beginning', async () =>
        {
            const token = await Token.deployed();
            const totalSupply = await token.totalSupply();

            assert.equal(tokenArgs.initialSupply, totalSupply);
        });
    });
    /*
    describe('balanceOf', () =>
    {
        describe('when the requested account has no tokens', () =>
        {
            it('returns zero', async () =>
            {
                const balance = await this.token.balanceOf(user);

                assert.equal(balance, 0);
            });
        });

        describe('when the requested account has some tokens', () =>
        {
            it('returns the total amount of tokens', async () =>
            {
                const balance = await this.token.balanceOf(owner);

                assert.equal(balance, 100);
            });
        });
    });

    it('the total supply is hold by the owner', async () =>
    {
        const totalSupply = await this.token.totalSupply();
        const ownerBalance = await this.token.balanceOf(owner);
        //console.log(`totalSupply: ${totalSupply} ownerBalance: ${ownerBalance}`);
        assert.equal(ownerBalance, totalSupply);

        await expectEvent.inConstruction(this.token, 'Transfer', {
            from: ZERO_ADDRESS,
            to: owner,
            value: totalSupply,
        });
    });

        it('half of the total supply is transfer to operator', async () =>
        {
            const totalSupply = await this.token.totalSupply();
            const ownerBalance = await this.token.balanceOf(owner);
            console.log(`totalSupply: ${totalSupply} ownerBalance: ${ownerBalance}`);
            const halfTotalSupply = totalSupply * 0.5;
            assert.equal(ownerBalance, totalSupply);

            await expectEvent.inConstruction(this.token, 'send', {
                recipient: user,
                amount: halfTotalSupply,
                data: "user data"
            });

            const ownerBalanceAfterTransfer = await this.token.balanceOf(owner);
            const operatorBalance = await this.token.balanceOf(operator);
            console.log(`totalSupply: ${totalSupply} ownerBalance: ${ownerBalanceAfterTransfer} operatorBalance: ${operatorBalance}`);
            assert.equal(ownerBalanceAfterTransfer, halfTotalSupply);
            assert.equal(operatorBalance, halfTotalSupply);
        });

          it('allows operator burn', async () => {
            const ownerBalance = await this.token.balanceOf(owner);
            const data = web3.utils.sha3('Simple777Data');
            const operatorData = web3.utils.sha3('Simple777OperatorData');

            await this.token.authorizeOperator(operator, { from: owner });
            await this.token.operatorBurn(owner, ownerBalance, data, operatorData, { from: operator });
            (await this.token.balanceOf(owner)).should.be.bignumber.equal("0");

          });

            describe('transfer', () =>
            {
                describe('when the recipient is not the zero address', () =>
                {
                    const to = recipient;

                    describe('when the sender does not have enough balance', () =>
                    {
                        const amount = 101;

                        it('reverts', async () =>
                        {
                            await assertRevert(this.token.transfer(to, amount, { from: owner }));
                        });
                    });

                    describe('when the sender has enough balance', () =>
                    {
                        const amount = 100;

                        it('transfers the requested amount', async () =>
                        {
                            await this.token.transfer(to, amount, { from: owner });

                            const senderBalance = await this.token.balanceOf(owner);
                            assert.equal(senderBalance, 0);

                            const recipientBalance = await this.token.balanceOf(to);
                            assert.equal(recipientBalance, amount);
                        });

                        it('emits a transfer event', async () =>
                        {
                            const { logs } = await this.token.transfer(to, amount, { from: owner });

                            assert.equal(logs.length, 1);
                            assert.equal(logs[0].event, 'Transfer');
                            assert.equal(logs[0].args.from, owner);
                            assert.equal(logs[0].args.to, to);
                            assert.equal(logs[0].args.value, amount);
                        });
                    });
                });

                describe('when the recipient is the zero address', () =>
                {
                    const to = ZERO_ADDRESS;

                    it('reverts', async () =>
                    {
                        await assertRevert(this.token.transfer(to, 100, { from: owner }));
                    });
                });
            });
                */
});

