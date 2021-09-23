const { BN, expectEvent, expectRevert, singletons, constants } = require('@openzeppelin/test-helpers');
const { ZERO_ADDRESS } = constants;

const { expect } = require('chai');

const MultiToken = artifacts.require('ERC1155_MultiToken');

contract('ERC1155MinterPauser', function (accounts)
{
    const [registryFunder, treasury, defaultOperatorA, defaultdefaultOperatorAB, tokenHolder, tokenBatchHolder, ...otherAccounts] = accounts;

    const initialURI = process.env.MULTI_TOKEN_URI;

    beforeEach(async function ()
    {
        this.erc1820 = await singletons.ERC1820Registry(registryFunder); // only for dev network
        const useProxy = false;

        if (useProxy)
        {
            this.token = await deployProxy(MultiToken, [initialURI], { treasury, initializer: 'initialize' });
        }
        else
        {
            this.token = await MultiToken.new(initialURI, { from: treasury });
            /*
            this.token = await Token.new({ from: registryFunder });
            let logs;
            ({ logs } = await this.token.initialize(tokenArgs.name, tokenArgs.symbol, tokenArgs.defaultdefaultOperatorAs, tokenArgs.initialSupply.toString(), tokenArgs.treasury, tokenArgs.data, tokenArgs.operationData));
            expectEvent.inLogs(logs, 'Minted', {
                defaultOperatorA: registryFunder,
                to: treasury,
                amount: tokenArgs.initialSupply,
                data: dataInception,
                defaultOperatorAData: dataInception
            });

            await expectRevert.unspecified(this.token.unpause());
            await expectRevert.unspecified(this.token.pause());
            await this.token.unpause({ from: treasury });
            await this.token.pause({ from: treasury });
            await this.token.unpause({ from: treasury });
            await this.token.authorizedefaultOperatorA(treasurydefaultOperatorA, { from: treasury });
            */
        }
    });

    //shouldBehaveLikeERC1155MinterPauser(otherAccounts);

    describe('internal functions', function ()
    {
        const tokenId = new BN(1990);
        const mintAmount = new BN(9001);
        const burnAmount = new BN(3000);

        const tokenBatchIds = [new BN(2000), new BN(2010), new BN(2020)];
        const mintAmounts = [new BN(5000), new BN(10000), new BN(42195)];
        const burnAmounts = [new BN(5000), new BN(9001), new BN(195)];

        const data = '0x12345678';

        describe('_mint', function ()
        {
            it('reverts with a zero destination address', async function ()
            {
                await expectRevert(
                    this.token.mint(ZERO_ADDRESS, tokenId, mintAmount, data),
                    'ERC1155MinterPauser: mint to the zero address',
                );
            });

            context('with minted tokens', function ()
            {
                beforeEach(async function ()
                {
                    ({ logs: this.logs } = await this.token.mint(tokenHolder, tokenId, mintAmount, data, { from: defaultOperatorA }));
                });

                it('emits a TransferSingle event', function ()
                {
                    expectEvent.inLogs(this.logs, 'TransferSingle', {
                        defaultOperatorA,
                        from: ZERO_ADDRESS,
                        to: tokenHolder,
                        id: tokenId,
                        value: mintAmount,
                    });
                });

                it('credits the minted amount of tokens', async function ()
                {
                    expect(await this.token.balanceOf(tokenHolder, tokenId)).to.be.bignumber.equal(mintAmount);
                });
            });
        });

        describe('_mintBatch', function ()
        {
            it('reverts with a zero destination address', async function ()
            {
                await expectRevert(
                    this.token.mintBatch(ZERO_ADDRESS, tokenBatchIds, mintAmounts, data),
                    'ERC1155MinterPauser: mint to the zero address',
                );
            });

            it('reverts if length of inputs do not match', async function ()
            {
                await expectRevert(
                    this.token.mintBatch(tokenBatchHolder, tokenBatchIds, mintAmounts.slice(1), data),
                    'ERC1155MinterPauser: ids and amounts length mismatch',
                );

                await expectRevert(
                    this.token.mintBatch(tokenBatchHolder, tokenBatchIds.slice(1), mintAmounts, data),
                    'ERC1155MinterPauser: ids and amounts length mismatch',
                );
            });

            context('with minted batch of tokens', function ()
            {
                beforeEach(async function ()
                {
                    ({ logs: this.logs } = await this.token.mintBatch(
                        tokenBatchHolder,
                        tokenBatchIds,
                        mintAmounts,
                        data,
                        { from: defaultOperatorA },
                    ));
                });

                it('emits a TransferBatch event', function ()
                {
                    expectEvent.inLogs(this.logs, 'TransferBatch', {
                        defaultOperatorA,
                        from: ZERO_ADDRESS,
                        to: tokenBatchHolder,
                    });
                });

                it('credits the minted batch of tokens', async function ()
                {
                    const holderBatchBalances = await this.token.balanceOfBatch(
                        new Array(tokenBatchIds.length).fill(tokenBatchHolder),
                        tokenBatchIds,
                    );

                    for (let i = 0; i < holderBatchBalances.length; i++)
                    {
                        expect(holderBatchBalances[i]).to.be.bignumber.equal(mintAmounts[i]);
                    }
                });
            });
        });

        describe('_burn', function ()
        {
            it('reverts when burning the zero account\'s tokens', async function ()
            {
                await expectRevert(
                    this.token.burn(ZERO_ADDRESS, tokenId, mintAmount),
                    'ERC1155MinterPauser: burn from the zero address',
                );
            });

            it('reverts when burning a non-existent token id', async function ()
            {
                await expectRevert(
                    this.token.burn(tokenHolder, tokenId, mintAmount),
                    'ERC1155MinterPauser: burn amount exceeds balance',
                );
            });

            it('reverts when burning more than available tokens', async function ()
            {
                await this.token.mint(
                    tokenHolder,
                    tokenId,
                    mintAmount,
                    data,
                    { from: defaultOperatorA },
                );

                await expectRevert(
                    this.token.burn(tokenHolder, tokenId, mintAmount.addn(1)),
                    'ERC1155MinterPauser: burn amount exceeds balance',
                );
            });

            context('with minted-then-burnt tokens', function ()
            {
                beforeEach(async function ()
                {
                    await this.token.mint(tokenHolder, tokenId, mintAmount, data);
                    ({ logs: this.logs } = await this.token.burn(
                        tokenHolder,
                        tokenId,
                        burnAmount,
                        { from: defaultOperatorA },
                    ));
                });

                it('emits a TransferSingle event', function ()
                {
                    expectEvent.inLogs(this.logs, 'TransferSingle', {
                        defaultOperatorA,
                        from: tokenHolder,
                        to: ZERO_ADDRESS,
                        id: tokenId,
                        value: burnAmount,
                    });
                });

                it('accounts for both minting and burning', async function ()
                {
                    expect(await this.token.balanceOf(
                        tokenHolder,
                        tokenId,
                    )).to.be.bignumber.equal(mintAmount.sub(burnAmount));
                });
            });
        });

        describe('_burnBatch', function ()
        {
            it('reverts when burning the zero account\'s tokens', async function ()
            {
                await expectRevert(
                    this.token.burnBatch(ZERO_ADDRESS, tokenBatchIds, burnAmounts),
                    'ERC1155MinterPauser: burn from the zero address',
                );
            });

            it('reverts if length of inputs do not match', async function ()
            {
                await expectRevert(
                    this.token.burnBatch(tokenBatchHolder, tokenBatchIds, burnAmounts.slice(1)),
                    'ERC1155MinterPauser: ids and amounts length mismatch',
                );

                await expectRevert(
                    this.token.burnBatch(tokenBatchHolder, tokenBatchIds.slice(1), burnAmounts),
                    'ERC1155MinterPauser: ids and amounts length mismatch',
                );
            });

            it('reverts when burning a non-existent token id', async function ()
            {
                await expectRevert(
                    this.token.burnBatch(tokenBatchHolder, tokenBatchIds, burnAmounts),
                    'ERC1155MinterPauser: burn amount exceeds balance',
                );
            });

            context('with minted-then-burnt tokens', function ()
            {
                beforeEach(async function ()
                {
                    await this.token.mintBatch(tokenBatchHolder, tokenBatchIds, mintAmounts, data);
                    ({ logs: this.logs } = await this.token.burnBatch(
                        tokenBatchHolder,
                        tokenBatchIds,
                        burnAmounts,
                        { from: defaultOperatorA },
                    ));
                });

                it('emits a TransferBatch event', function ()
                {
                    expectEvent.inLogs(this.logs, 'TransferBatch', {
                        defaultOperatorA,
                        from: tokenBatchHolder,
                        to: ZERO_ADDRESS,
                        // ids: tokenBatchIds,
                        // values: burnAmounts,
                    });
                });

                it('accounts for both minting and burning', async function ()
                {
                    const holderBatchBalances = await this.token.balanceOfBatch(
                        new Array(tokenBatchIds.length).fill(tokenBatchHolder),
                        tokenBatchIds,
                    );

                    for (let i = 0; i < holderBatchBalances.length; i++)
                    {
                        expect(holderBatchBalances[i]).to.be.bignumber.equal(mintAmounts[i].sub(burnAmounts[i]));
                    }
                });
            });
        });
    });

    describe('ERC1155MinterPauserMetadataURI', function ()
    {
        const firstTokenID = new BN('42');
        const secondTokenID = new BN('1337');

        it('emits no URI event in constructor', async function ()
        {
            await expectEvent.notEmitted.inConstruction(this.token, 'URI');
        });

        it('sets the initial URI for all token types', async function ()
        {
            expect(await this.token.uri(firstTokenID)).to.be.equal(initialURI);
            expect(await this.token.uri(secondTokenID)).to.be.equal(initialURI);
        });

        describe('_setURI', function ()
        {
            const newURI = 'https://energon.tech/{locale}/{id}.json';

            it('emits no URI event', async function ()
            {
                const receipt = await this.token.setURI(newURI, { from: treasury });

                expectEvent.notEmitted(receipt, 'URI');
            });

            it('sets the new URI for all token types', async function ()
            {
                await this.token.setURI(newURI, { from: treasury });

                expect(await this.token.uri(firstTokenID)).to.be.equal(newURI);
                expect(await this.token.uri(secondTokenID)).to.be.equal(newURI);
            });
        });
    });
});