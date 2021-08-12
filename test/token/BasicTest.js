// see: https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/tree/master/test/token/ERC777

const Token = artifacts.require('Token.sol');
const ERC777SenderRecipientMock = artifacts.require('ERC777SenderRecipientMockUpgradeable');

const { BN, expectEvent, expectRevert, singletons, constants } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

const {
    shouldBehaveLikeERC777DirectSendBurn,
    shouldBehaveLikeERC777OperatorSendBurn,
    shouldBehaveLikeERC777UnauthorizedOperatorSendBurn,
    shouldBehaveLikeERC777InternalMint,
    shouldBehaveLikeERC777SendBurnMintInternalWithReceiveHook,
    shouldBehaveLikeERC777SendBurnWithSendHook,
} = require('./ERC777.behavior');

const { ZERO_ADDRESS } = constants;
const initialSupply = new BN(process.env.TOKEN_INITIAL_SUPPLY);
console.log(process.env.TOKEN_NAME, process.env.TOKEN_SYMBOL, initialSupply.toString());

const userData = web3.utils.sha3('OZ777TestData');
const dataInOperatorTransaction = web3.utils.sha3('OZ777TestdataInOperatorTransaction');

// Test that Token operates correctly as an ERC20Basic token.
contract('ERC20Basic Token', (accounts) =>
{
    const [registryFunder, treasury, defaultOperatorA, defaultOperatorB, newOperator, anyone] = accounts;

    // Handy struct for future operations and tests
    const tokenArgs = {
        name: process.env.TOKEN_NAME,
        symbol: process.env.TOKEN_SYMBOL,
        defaultOperators: [defaultOperatorA, defaultOperatorB],
        initialSupply: initialSupply,
        treasury: treasury
    };

    const dataInUserTransaction = web3.utils.sha3('OZ777TestdataInUserTransaction');
    const dataInOperatorTransaction = web3.utils.sha3('OZ777TestdataInOperatorTransaction');

    beforeEach(async () =>
    {
        this.erc1820 = await singletons.ERC1820Registry(registryFunder); // only for dev network
        this.token = await Token.new({ from: treasury });
        await this.token.initialize(tokenArgs.name, tokenArgs.symbol, tokenArgs.defaultOperators, tokenArgs.initialSupply.toString(), tokenArgs.treasury);
    });

    it('log', async () =>
    {
        console.log(tokenArgs);
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
            it('returns anyone == zero', async () =>
            {
                expect(await this.token.balanceOf(anyone)).to.be.bignumber.equal('0');
            });
        });

        context('for an account with tokens', () =>
        {
            it('returns treasury == initialSupply', async () =>
            {
                expect(await this.token.balanceOf(treasury)).to.be.bignumber.equal(initialSupply);
            });
        });
    });

    describe('with no ERC777TokensSender and no ERC777TokensRecipient implementers', () =>
    {
        context('with treasury', async () =>
        {
            await shouldBehaveLikeERC777DirectSendBurn(treasury, anyone, dataInUserTransaction);
        });
    });
});

