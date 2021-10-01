const { BN, expectEvent, expectRevert, singletons, constants } = require("@openzeppelin/test-helpers");
const { ZERO_ADDRESS } = constants;

const { expect } = require("chai");

const MultiToken = artifacts.require("ERC1155_MultiToken");
//
// Test types
//
const hasToTestBasics = true;
const hasToTestSupply = true;
const hasToTestNfts = true;
const initialURI = process.env.MULTI_TOKEN_TYPES_URI;
const NFT_BASE_URI = "https://energon.tech/nft";

contract("MultiToken", function (accounts)
{
    const [registryFunder, treasury, defaultOperatorA, defaultOperatorB, tokenHolder, tokenBatchHolder, ...otherAccounts] = accounts;

    const MINERAL = new BN(0);
    const GAS = new BN(1);
    const ENERGON = new BN(2);
    const NFT = new BN(3);

    const mintAmount = new BN(9001);
    const burnAmount = new BN(3000);
    const mintAmounts = [new BN(5000), new BN(10000), new BN(42195)];
    const burnAmounts = [new BN(5000), new BN(9001), new BN(195)];
    const tokenBatchIds = [MINERAL, GAS, ENERGON];

    const fakeTokenId = new BN(1990);
    const fakeTokenBatchIds = [new BN(2000), new BN(2010), new BN(2020)];
    const data = web3.utils.sha3('TestUnit');

    const nft0Id = new BN(0);
    const nft0Uri = `${NFT_BASE_URI}/${nft0Id.toString()}.json`;
    const nft1Id = new BN(1);
    const nft1Uri = `${NFT_BASE_URI}/${nft1Id.toString()}.json`;
    const nft2Id = new BN(2);
    const nft2Uri = `${NFT_BASE_URI}/${nft2Id.toString()}.json`;
    const nftIdsBatch = [nft0Id, nft1Id, nft2Id];
    const nftUrisBatch = [nft0Uri, nft1Uri, nft2Uri];

    async function burnAllAssets(token, holder)
    {
        const holderBatchBalances = await token.balanceOfBatch(
            new Array(tokenBatchIds.length).fill(holder),
            tokenBatchIds, { from: treasury }
        );

        await token.burnAssetBatch(holder, tokenBatchIds, holderBatchBalances, { from: treasury });
    }

    async function burnAllNft(token, holder)
    {
        const holderNftsBalance = await token.balanceNftsOf(holder, { from: treasury });
        console.log(holderNftsBalance);
        //await token.burnNft(holder, holderNftsBalance[0].id, { from: treasury });
    }

    const prettyBn = (bn) =>
    {
        let str = bn.toString();
        let returnValue;

        if (str.length >= 18)
        {
            returnValue = str.substr(0, str.length - 18).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
        }
        else
        {
            const pad = 18 - str.length;
            returnValue = "0." + "0".repeat(pad) + str;
        }
        return returnValue;
    }

    beforeEach(async () =>
    {
        this.erc1820 = await singletons.ERC1820Registry(registryFunder); // only for dev network
        const useProxy = true;

        if (useProxy)
        {
            this.token = await MultiToken.deployed();
        }
        else
        {
            this.token = await MultiToken.new(initialURI, treasury, [defaultOperatorA, defaultOperatorB], { from: treasury });
        }
    });
    //
    // Minimum checks to validate the extended and ad-hoc functionality
    //
    if (hasToTestBasics)
    {
        describe(`double check internal functions`, () =>
        {
            describe(`mint assets`, () =>
            {
                it(`reverts with a zero destination address`, async () =>
                {
                    await expectRevert.unspecified(this.token.mintAsset(ZERO_ADDRESS, MINERAL, mintAmount, data, { from: tokenHolder }));
                    await expectRevert.unspecified(this.token.mintAsset(ZERO_ADDRESS, GAS, mintAmount, data, { from: tokenHolder }));
                    await expectRevert.unspecified(this.token.mintAsset(ZERO_ADDRESS, ENERGON, mintAmount, data, { from: tokenHolder }));
                });

                it(`mint MINERAL`, async () =>
                {
                    const { logs: logs } = await this.token.mintAsset(tokenHolder, MINERAL, mintAmount, data, { from: defaultOperatorA });
                    expectEvent.inLogs(logs, `TransferSingle`, {
                        operator: defaultOperatorA,
                        from: ZERO_ADDRESS,
                        to: tokenHolder,
                        id: MINERAL,
                        value: mintAmount,
                    });
                });

                it(`mint GAS`, async () =>
                {
                    ({ logs: this.logs } = await this.token.mintAsset(tokenHolder, GAS, mintAmount, data, { from: defaultOperatorA }));
                    expectEvent.inLogs(this.logs, `TransferSingle`, {
                        operator: defaultOperatorA,
                        from: ZERO_ADDRESS,
                        to: tokenHolder,
                        id: GAS,
                        value: mintAmount,
                    });
                });

                it(`mint ENERGON`, async () =>
                {
                    ({ logs: this.logs } = await this.token.mintAsset(tokenHolder, ENERGON, mintAmount, data, { from: defaultOperatorA }));
                    expectEvent.inLogs(this.logs, `TransferSingle`, {
                        operator: defaultOperatorA,
                        from: ZERO_ADDRESS,
                        to: tokenHolder,
                        id: ENERGON,
                        value: mintAmount,
                    });
                });

                it(`credits MINERAL amount of tokens`, async () =>
                {
                    expect(await this.token.balanceOf(tokenHolder, MINERAL, { from: tokenHolder })).to.be.bignumber.equal(mintAmount);
                });

                it(`credits GAS amount of tokens`, async () =>
                {
                    expect(await this.token.balanceOf(tokenHolder, GAS, { from: tokenHolder })).to.be.bignumber.equal(mintAmount);
                });

                it(`credits ENERGON amount of tokens`, async () =>
                {
                    expect(await this.token.balanceOf(tokenHolder, ENERGON, { from: tokenHolder })).to.be.bignumber.equal(mintAmount);
                });

                it(`burn all assets`, async () =>
                {
                    await burnAllAssets(this.token, tokenHolder);
                    await burnAllAssets(this.token, tokenBatchHolder);
                });
            });

            describe(`mint assets batch`, () =>
            {
                it(`reverts with a zero destination address`, async () =>
                {
                    await expectRevert(
                        this.token.mintAssetBatch(ZERO_ADDRESS, tokenBatchIds, mintAmounts, data),
                        `ERC1155: mint to the zero address`,
                    );
                });

                it(`reverts if length of inputs do not match`, async () =>
                {
                    await expectRevert(
                        this.token.mintAssetBatch(tokenBatchHolder, tokenBatchIds, mintAmounts.slice(1), data),
                        `ERC1155: ids and amounts length mismatch`,
                    );

                    await expectRevert(
                        this.token.mintAssetBatch(tokenBatchHolder, tokenBatchIds.slice(1), mintAmounts, data),
                        `ERC1155: ids and amounts length mismatch`,
                    );
                });

                it(`with minted batch of tokens`, async () =>
                {
                    ({ logs: this.logs } = await this.token.mintAssetBatch(
                        tokenBatchHolder,
                        tokenBatchIds,
                        mintAmounts,
                        data,
                        { from: defaultOperatorB },
                    ));
                });

                it(`emits a TransferBatch event`, () =>
                {
                    expectEvent.inLogs(this.logs, `TransferBatch`, {
                        operator: defaultOperatorB,
                        from: ZERO_ADDRESS,
                        to: tokenBatchHolder,
                    });
                });

                it(`credits the minted batch of tokens`, async () =>
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

                it(`burn all assets`, async () =>
                {
                    await burnAllAssets(this.token, tokenHolder);
                    await burnAllAssets(this.token, tokenBatchHolder);
                });
            });

            describe(`burn assets`, () =>
            {
                it(`reverts when burning a non-existent token id`, async () =>
                {
                    await expectRevert(
                        this.token.burnAsset(tokenHolder, fakeTokenId, mintAmount, { from: defaultOperatorA }),
                        `MultiToken: id is not an asset`,
                    );
                });

                it(`reverts when burning more than available tokens`, async () =>
                {
                    await this.token.mintAsset(
                        tokenHolder,
                        MINERAL,
                        mintAmount,
                        data,
                        { from: defaultOperatorA },
                    );

                    expect(await this.token.balanceOf(
                        tokenHolder,
                        MINERAL,
                    )).to.be.bignumber.equal(mintAmount);

                    await expectRevert(
                        this.token.burnAsset(tokenHolder, MINERAL, mintAmount.addn(1), { from: defaultOperatorA }),
                        `ERC1155: burn amount exceeds balance`,
                    );
                });

                it(`burn exact amount of assets`, async () =>
                {
                    ({ logs: this.logs } = await this.token.burnAsset(
                        tokenHolder,
                        MINERAL,
                        burnAmount,
                        { from: defaultOperatorA },
                    ));
                });

                it(`emits a TransferSingle event`, () =>
                {
                    expectEvent.inLogs(this.logs, `TransferSingle`, {
                        operator: defaultOperatorA,
                        from: tokenHolder,
                        to: ZERO_ADDRESS,
                        id: MINERAL,
                        value: burnAmount,
                    });
                });

                it(`accounts for both minting and burning`, async () =>
                {
                    expect(await this.token.balanceOf(
                        tokenHolder,
                        MINERAL,
                    )).to.be.bignumber.equal(mintAmount.sub(burnAmount));
                });

                it(`burn all assets`, async () =>
                {
                    await burnAllAssets(this.token, tokenHolder);
                    await burnAllAssets(this.token, tokenBatchHolder);
                });
            });

            describe(`burn in batches`, () =>
            {
                it(`reverts when burning the zero account\`s tokens`, async () =>
                {
                    await expectRevert(
                        this.token.burnAssetBatch(ZERO_ADDRESS, tokenBatchIds, burnAmounts, { from: defaultOperatorB }),
                        `ERC1155: burn from the zero address`,
                    );
                });
                it(`reverts if length of inputs do not match`, async () =>
                {
                    await expectRevert(
                        this.token.burnAssetBatch(tokenBatchHolder, tokenBatchIds, burnAmounts.slice(1), { from: defaultOperatorB }),
                        `ERC1155: ids and amounts length mismatch`,
                    );

                    await expectRevert(
                        this.token.burnAssetBatch(tokenBatchHolder, tokenBatchIds.slice(1), burnAmounts, { from: defaultOperatorB }),
                        `ERC1155: ids and amounts length mismatch`,
                    );
                });

                it(`reverts when burning a non-existent token id`, async () =>
                {
                    await expectRevert(
                        this.token.burnAssetBatch(tokenBatchHolder, tokenBatchIds, burnAmounts, { from: defaultOperatorB }),
                        `ERC1155: burn amount exceeds balance`,
                    );
                });

                it(`with minted-then-burnt tokens`, async () =>
                {
                    await this.token.mintAssetBatch(tokenBatchHolder, tokenBatchIds, mintAmounts, data, { from: defaultOperatorB });
                    ({ logs: this.logs } = await this.token.burnAssetBatch(
                        tokenBatchHolder,
                        tokenBatchIds,
                        burnAmounts,
                        { from: defaultOperatorA },
                    ));
                });

                it(`emits a TransferBatch event`, () =>
                {
                    expectEvent.inLogs(this.logs, `TransferBatch`, {
                        operator: defaultOperatorA,
                        from: tokenBatchHolder,
                        to: ZERO_ADDRESS,
                        //ids: tokenBatchIds,
                        //values: burnAmounts,
                    });
                });

                it(`accounts for both minting and burning`, async () =>
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

                it(`burn all assets`, async () =>
                {
                    await burnAllAssets(this.token, tokenHolder);
                    await burnAllAssets(this.token, tokenBatchHolder);
                });
            });
        });
    }

    describe(`metadata uri`, () =>
    {
        it(`sets the initial URI for all token types`, async () =>
        {
            expect(await this.token.uri(MINERAL)).to.be.equal(initialURI);
            expect(await this.token.uri(GAS)).to.be.equal(initialURI);
            expect(await this.token.uri(ENERGON)).to.be.equal(initialURI);
        });

        describe(`setUri`, () =>
        {
            const newURI = `https://energon.tech/{locale}/{id}.json`;

            it(`emits no URI event`, async () =>
            {
                const receipt = await this.token.setUri(newURI, { from: registryFunder });
                expectEvent.notEmitted(receipt, `URI`);
            });

            it(`sets the new URI for all token types`, async () =>
            {
                await this.token.setUri(newURI, { from: registryFunder });

                expect(await this.token.uri(MINERAL)).to.be.equal(newURI);
                expect(await this.token.uri(GAS)).to.be.equal(newURI);
                expect(await this.token.uri(ENERGON)).to.be.equal(newURI);
            });
        });
    });
    //
    // Extended functionality
    //
    if (hasToTestSupply)
    {
        describe(`assets supply`, () =>
        {
            it(`burn all assets`, async () =>
            {
                await burnAllAssets(this.token, treasury);
                await burnAllAssets(this.token, tokenHolder);
                await burnAllAssets(this.token, tokenBatchHolder);
            });

            it(`give tokens around`, async () =>
            {
                await this.token.mintAsset(tokenHolder, MINERAL, mintAmounts[MINERAL], data, { from: defaultOperatorB });
                await this.token.mintAsset(tokenHolder, GAS, mintAmounts[GAS], data, { from: defaultOperatorB });
                await this.token.mintAsset(tokenHolder, ENERGON, mintAmounts[ENERGON], data, { from: defaultOperatorB });

                await this.token.mintAssetBatch(
                    tokenBatchHolder,
                    tokenBatchIds,
                    mintAmounts,
                    data,
                    { from: defaultOperatorB },
                );
                await this.token.mintAssetBatch(
                    treasury,
                    tokenBatchIds,
                    mintAmounts,
                    data,
                    { from: defaultOperatorB },
                );
            });

            it(`total assets supply`, async () =>
            {
                const assetsSupply = await this.token.totalAssetsSuply();
                //console.log(assetsSupply);
                expect(assetsSupply[MINERAL].amount).to.be.bignumber.equal(mintAmounts[MINERAL].muln(3));
                expect(assetsSupply[GAS].amount).to.be.bignumber.equal(mintAmounts[GAS].muln(3));
                expect(assetsSupply[ENERGON].amount).to.be.bignumber.equal(mintAmounts[ENERGON].muln(3));
            });
        });
    }
    //
    // NFTs functionality
    //
    if (hasToTestNfts)
    {
        describe(`mint NFTs`, () =>
        {
            it(`NFTs cannot be minted from non operators`, async () =>
            {
                await expectRevert.unspecified(this.token.mintNft(tokenHolder, nft0Id, nft0Uri, data, { from: tokenHolder }));
            });

            it(`give NFTs around`, async () =>
            {
                await this.token.mintNft(tokenHolder, nft0Id, nft0Uri, data, { from: defaultOperatorA });
            });

            it(`check balance of NFTs`, async () =>
            {
                const { 0: nftCount, 1: holderNftsBalance } = await token.balanceNftsOf(tokenHolder, { from: tokenHolder });

                //console.log(nftCount, holderNftsBalance);
                expect(nftCount).to.be.bignumber.equal(new BN(holderNftsBalance.length));
                expect(holderNftsBalance[0].id).to.be.bignumber.equal(nft0Id);
                expect(holderNftsBalance[0].owner).equal(tokenHolder);
                expect(holderNftsBalance[0].uri).equal(nft0Uri);
            });

            it(`total NFTs supply`, async () =>
            {
                const totalNftsSupply = await token.totalNftsSupply({ from: tokenHolder });
                expect(totalNftsSupply).to.be.bignumber.equal(new BN(1));
            });
        });

        describe(`mint NFTs batch`, () =>
        {
            it(`NFTs batch cannot be minted from non operators`, async () =>
            {
                await expectRevert.unspecified(this.token.mintNftBatch(tokenHolder, nftIdsBatch, nftUrisBatch, { from: tokenHolder }));
            });

            it(`give NFTs around in batch`, async () =>
            {
                await this.token.mintNftBatch(tokenHolder, nftIdsBatch, nftUrisBatch, { from: defaultOperatorA });
            });

            it(`check balance of NFTs`, async () =>
            {
                const { 0: nftCount, 1: holderNftsBalance } = await token.balanceNftsOf(tokenHolder, { from: tokenHolder });

                console.log(nftCount, holderNftsBalance);
                expect(nftCount).to.be.bignumber.equal(new BN(holderNftsBalance.length));
            });

            it(`total NFTs supply`, async () =>
            {
                const totalNftsSupply = await token.totalNftsSupply({ from: tokenHolder });
                expect(totalNftsSupply).to.be.bignumber.equal(new BN(nftIdsBatch.length));
            });
        });

        describe(`burn NFTs`, () =>
        {
            it(`get NFTs balance and burn them all`, async () =>
            {
                const { 0: nftCount, 1: holderNftsBalance } = await token.balanceNftsOf(tokenHolder, { from: tokenHolder });
                for (let i = 0; i < holderNftsBalance.length; ++i)
                {
                    const e = holderNftsBalance[i];
                    await expectRevert.unspecified(this.token.burnNft(tokenHolder, e.id, { from: tokenHolder }));
                    await this.token.burnNft(tokenHolder, e.id, { from: defaultOperatorA });
                }
            });

            it(`check the tokenHolder has no more NFTs`, async () =>
            {
                const { 0: nftCount, 1: holderNftsBalance } = await token.balanceNftsOf(tokenHolder, { from: tokenHolder });

                expect(nftCount).to.be.bignumber.equal(new BN(holderNftsBalance.length));
                expect(new BN(0)).to.be.bignumber.equal(new BN(holderNftsBalance.length));
            });
        });
    }
});