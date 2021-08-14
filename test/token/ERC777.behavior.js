const Token = artifacts.require('Token.sol');
const { BN, constants, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { ZERO_ADDRESS } = constants;

const { expect } = require('chai');

const ERC777SenderRecipientMock = artifacts.require('ERC777SenderRecipientMockUpgradeable');

const shouldBehaveLikeERC777DirectSendBurn = (token, holder, recipient, data) =>
{
    shouldBehaveLikeERC777DirectSend(token, holder, recipient, data);
    shouldBehaveLikeERC777DirectBurn(token, holder, data);
}

const shouldBehaveLikeERC777OperatorSendBurn = (token, holder, recipient, operator, data, operatorData) =>
{
    shouldBehaveLikeERC777OperatorSend(token, holder, recipient, operator, data, operatorData);
    shouldBehaveLikeERC777OperatorBurn(token, holder, operator, data, operatorData);
}

const shouldBehaveLikeERC777UnauthorizedOperatorSendBurn = (token, holder, recipient, operator, data, operatorData) =>
{
    shouldBehaveLikeERC777UnauthorizedOperatorSend(token, holder, recipient, operator, data, operatorData);
    shouldBehaveLikeERC777UnauthorizedOperatorBurn(token, holder, operator, data, operatorData);
}

const shouldBehaveLikeERC777DirectSend = (token, holder, recipient, data) =>
{
    describe('direct send', () =>
    {
        context('when the sender has tokens', async () =>
        {
            shouldDirectSendTokens(token, holder, recipient, new BN('0'), data);
            shouldDirectSendTokens(token, holder, recipient, new BN('1'), data);

            it('reverts when sending more than the balance', async () =>
            {
                const balance = await token.balanceOf(holder);
                await expectRevert.unspecified(token.send(recipient, balance.addn(1), data, { from: holder }));
            });

            it('reverts when sending to the zero address', async () =>
            {
                await expectRevert.unspecified(token.send(ZERO_ADDRESS, new BN('1'), data, { from: holder }));
            });
        });

        context('when the sender has no tokens', async () =>
        {
            removeBalance(token, holder);
            shouldDirectSendTokens(token, holder, recipient, new BN('0'), data);

            it('reverts when sending a non-zero amount', async () =>
            {
                await expectRevert.unspecified(token.send(recipient, new BN('1'), data, { from: holder }));
            });
            restoreBalance(token, holder);
        });
    });
}

const shouldBehaveLikeERC777OperatorSend = (token, holder, recipient, operator, data, operatorData) =>
{
    describe('operator send', () =>
    {
        context('when the sender has tokens', async () =>
        {
            shouldOperatorSendTokens(token, holder, operator, recipient, new BN('0'), data, operatorData);
            shouldOperatorSendTokens(token, holder, operator, recipient, new BN('1'), data, operatorData);

            it('reverts when sending more than the balance', async () =>
            {
                const balance = await token.balanceOf(holder);
                await expectRevert.unspecified(
                    token.operatorSend(holder, recipient, balance.addn(1), data, operatorData, { from: operator }),
                );
            });

            it('reverts when sending to the zero address', async () =>
            {
                await expectRevert.unspecified(
                    token.operatorSend(
                        holder, ZERO_ADDRESS, new BN('1'), data, operatorData, { from: operator },
                    ),
                );
            });
        });

        context('when the sender has no tokens', () =>
        {
            removeBalance(token, holder);
            shouldOperatorSendTokens(token, holder, operator, recipient, new BN('0'), data, operatorData);

            it('reverts when sending a non-zero amount', async () =>
            {
                await expectRevert.unspecified(
                    token.operatorSend(holder, recipient, new BN('1'), data, operatorData, { from: operator }),
                );
            });

            it('reverts when sending from the zero address', async () =>
            {
                // This is not yet reflected in the spec
                await expectRevert.unspecified(
                    token.operatorSend(
                        ZERO_ADDRESS, recipient, new BN('0'), data, operatorData, { from: operator },
                    ),
                );
            });
            restoreBalance(token, holder);
        });
    });
}

const shouldBehaveLikeERC777UnauthorizedOperatorSend = (token, holder, recipient, operator, data, operatorData) =>
{
    describe('operator send', () =>
    {
        it('reverts', async () =>
        {
            await expectRevert.unspecified(token.operatorSend(holder, recipient, new BN('0'), data, operatorData));
        });
    });
}

const shouldBehaveLikeERC777DirectBurn = (token, holder, data) =>
{
    describe('direct burn', () =>
    {
        context('when the sender has tokens', async () =>
        {
            restoreBalance(token, holder);
            shouldDirectBurnTokens(token, holder, new BN('0'), data);
            shouldDirectBurnTokens(token, holder, new BN('1'), data);

            it('reverts when burning more than the balance', async () =>
            {
                const balance = await token.balanceOf(holder);
                await expectRevert.unspecified(token.burn(balance.addn(1), data, { from: holder }));
            });
        });

        context('when the sender has no tokens', async () =>
        {
            removeBalance(token, holder);
            shouldDirectBurnTokens(token, holder, new BN('0'), data);

            it('reverts when burning a non-zero amount', async () =>
            {
                await expectRevert.unspecified(token.burn(new BN('1'), data, { from: holder }));
            });
            restoreBalance(token, holder);
        });
    });
}

const shouldBehaveLikeERC777OperatorBurn = (token, holder, operator, data, operatorData) =>
{
    describe('operator burn', () =>
    {
        context('when the sender has tokens', () =>
        {
            shouldOperatorBurnTokens(token, holder, operator, new BN('0'), data, operatorData);
            shouldOperatorBurnTokens(token, holder, operator, new BN('1'), data, operatorData);

            it('reverts when burning more than the balance', async () =>
            {
                const balance = await token.balanceOf(holder);
                await expectRevert.unspecified(
                    token.operatorBurn(holder, balance.addn(1), data, operatorData, { from: operator }),
                );
            });
        });

        context('when the sender has no tokens', () =>
        {
            removeBalance(token, holder);
            shouldOperatorBurnTokens(token, holder, operator, new BN('0'), data, operatorData);

            it('reverts when burning a non-zero amount', async () =>
            {
                await expectRevert.unspecified(
                    token.operatorBurn(holder, new BN('1'), data, operatorData, { from: operator }),
                );
            });

            it('reverts when burning from the zero address', async () =>
            {
                // This is not yet reflected in the spec
                await expectRevert.unspecified(
                    token.operatorBurn(
                        ZERO_ADDRESS, new BN('0'), data, operatorData, { from: operator },
                    ),
                );
            });
            restoreBalance(token, holder);
        });
    });
}

const shouldBehaveLikeERC777UnauthorizedOperatorBurn = (token, holder, operator, data, operatorData) =>
{
    describe('unauthorized operator burn', () =>
    {
        it('reverts', async () =>
        {
            await expectRevert.unspecified(token.operatorBurn(holder, new BN('0'), data, operatorData));
        });
    });
}

const shouldDirectSendTokens = (token, from, to, amount, data) =>
{
    shouldSendTokens(token, from, null, to, amount, data, null);
}

const shouldOperatorSendTokens = (token, from, operator, to, amount, data, operatorData) =>
{
    shouldSendTokens(token, from, operator, to, amount, data, operatorData);
}

const shouldSendTokens = async (token, from, operator, to, amount, data, operatorData) =>
{
    const operatorCall = operator !== null;

    it(`${operatorCall ? `operator ${operator}` : `${from}`} can send an amount of ${amount} from ${from}`, async () =>
    {
        const initialTotalSupply = await token.totalSupply();
        const initialFromBalance = await token.balanceOf(from);
        const initialToBalance = await token.balanceOf(to);

        let logs;
        if (!operatorCall)
        {
            ({ logs } = await token.send(to, amount, data, { from: from }));

            expectEvent.inLogs(logs, 'Sent', {
                operator: from,
                from: from,
                to: to,
                amount: amount,
                data: data,
                operatorData: null,
            });
        }
        else
        {
            ({ logs } = await token.operatorSend(from, to, amount, data, operatorData, { from: operator }));
            expectEvent.inLogs(logs, 'Sent', {
                operator: operator,
                from: from,
                to: to,
                amount: amount,
                data: data,
                operatorData: operatorData,
            });
        }

        expectEvent.inLogs(logs, 'Transfer', {
            from: from,
            to: to,
            value: amount,
        });

        const finalTotalSupply = await token.totalSupply();
        const finalFromBalance = await token.balanceOf(from);
        const finalToBalance = await token.balanceOf(to);

        expect(finalTotalSupply).to.be.bignumber.equal(initialTotalSupply);
        expect(finalToBalance.sub(initialToBalance)).to.be.bignumber.equal(amount);
        expect(finalFromBalance.sub(initialFromBalance)).to.be.bignumber.equal(amount.neg());
    });
}

const shouldDirectBurnTokens = (token, from, amount, data) =>
{
    shouldBurnTokens(token, from, null, amount, data, null);
}

const shouldOperatorBurnTokens = (token, from, operator, amount, data, operatorData) =>
{
    shouldBurnTokens(token, from, operator, amount, data, operatorData);
}

const shouldBurnTokens = async (token, from, operator, amount, data, operatorData) =>
{
    const operatorCall = operator !== null;

    it(`${operatorCall ? `operator ${operator}` : `${from}`} can burn an amount of ${amount}`, async () =>
    {
        const initialTotalSupply = await token.totalSupply();
        const initialFromBalance = await token.balanceOf(from);

        let logs;
        if (!operatorCall)
        {
            ({ logs } = await token.burn(amount, data, { from }));
            expectEvent.inLogs(logs, 'Burned', {
                operator: from,
                from: from,
                amount: amount,
                data: data,
                operatorData: operatorData,
            });
        }
        else
        {
            ({ logs } = await token.operatorBurn(from, amount, data, operatorData, { from: operator }));
            expectEvent.inLogs(logs, 'Burned', {
                operator: operator,
                from: from,
                amount: amount,
                data: data,
                operatorData: operatorData,
            });
        }

        expectEvent.inLogs(logs, 'Transfer', {
            from: from,
            to: ZERO_ADDRESS,
            value: amount,
        });

        const finalTotalSupply = await token.totalSupply();
        const finalFromBalance = await token.balanceOf(from);

        expect(finalTotalSupply.sub(initialTotalSupply)).to.be.bignumber.equal(amount.neg());
        expect(finalFromBalance.sub(initialFromBalance)).to.be.bignumber.equal(amount.neg());
    });
}

const shouldBehaveLikeERC777InternalMint = async (token, recipient, operator, amount, data, operatorData) =>
{
    shouldInternalMintTokens(token, operator, recipient, new BN('0'), data, operatorData);
    shouldInternalMintTokens(token, operator, recipient, amount, data, operatorData);

    it('reverts when minting tokens for the zero address', async () =>
    {
        await expectRevert.unspecified(
            token.mintInternal(ZERO_ADDRESS, amount, data, operatorData, { from: operator }),
        );
    });
}

const shouldInternalMintTokens = async (token, operator, to, amount, data, operatorData) =>
{
    it(`can (internal) mint an amount of ${amount}`, async () =>
    {
        const initialTotalSupply = await token.totalSupply();
        const initialToBalance = await token.balanceOf(to);

        const { logs } = await token.mintInternal(to, amount, data, operatorData, { from: operator });

        expectEvent.inLogs(logs, 'Minted', {
            operator,
            to,
            amount,
            data,
            operatorData,
        });

        expectEvent.inLogs(logs, 'Transfer', {
            from: ZERO_ADDRESS,
            to,
            value: amount,
        });

        const finalTotalSupply = await token.totalSupply();
        const finalToBalance = await token.balanceOf(to);

        expect(finalTotalSupply.sub(initialTotalSupply)).to.be.bignumber.equal(amount);
        expect(finalToBalance.sub(initialToBalance)).to.be.bignumber.equal(amount);
    });
}

const shouldBehaveLikeERC777SendBurnMintInternalWithReceiveHook = async (token, operator, amount, data, operatorData) =>
{
    context('when TokensRecipient reverts', () =>
    {
        beforeEach(async () =>
        {
            await this.tokensRecipientImplementer.setShouldRevertReceive(true);
        });

        it('send reverts', async () =>
        {
            await expectRevert.unspecified(sendFromHolder(token, this.sender, this.recipient, amount, data));
        });

        it('operatorSend reverts', async () =>
        {
            await expectRevert.unspecified(
                token.operatorSend(this.sender, this.recipient, amount, data, operatorData, { from: operator }),
            );
        });

        it('mint (internal) reverts', async () =>
        {
            await expectRevert.unspecified(
                token.mintInternal(this.recipient, amount, data, operatorData, { from: operator }),
            );
        });
    });

    context('when TokensRecipient does not revert', () =>
    {
        beforeEach(async () =>
        {
            await this.tokensRecipientImplementer.setShouldRevertSend(false);
        });

        it('TokensRecipient receives send data and is called after state mutation', async () =>
        {
            const { tx } = await sendFromHolder(token, this.sender, this.recipient, amount, data);

            const postSenderBalance = await token.balanceOf(this.sender);
            const postRecipientBalance = await token.balanceOf(this.recipient);

            await assertTokensReceivedCalled(
                token,
                tx,
                this.sender,
                this.sender,
                this.recipient,
                amount,
                data,
                null,
                postSenderBalance,
                postRecipientBalance,
            );
        });

        it('TokensRecipient receives operatorSend data and is called after state mutation', async () =>
        {
            const { tx } = await token.operatorSend(
                this.sender, this.recipient, amount, data, operatorData,
                { from: operator },
            );

            const postSenderBalance = await token.balanceOf(this.sender);
            const postRecipientBalance = await token.balanceOf(this.recipient);

            await assertTokensReceivedCalled(
                token,
                tx,
                operator,
                this.sender,
                this.recipient,
                amount,
                data,
                operatorData,
                postSenderBalance,
                postRecipientBalance,
            );
        });

        it('TokensRecipient receives mint (internal) data and is called after state mutation', async () =>
        {
            const { tx } = await token.mintInternal(
                this.recipient, amount, data, operatorData, { from: operator },
            );

            const postRecipientBalance = await token.balanceOf(this.recipient);

            await assertTokensReceivedCalled(
                token,
                tx,
                operator,
                ZERO_ADDRESS,
                this.recipient,
                amount,
                data,
                operatorData,
                new BN('0'),
                postRecipientBalance,
            );
        });
    });
}

const shouldBehaveLikeERC777SendBurnWithSendHook = async (operator, amount, data, operatorData) =>
{
    context('when TokensSender reverts', () =>
    {
        beforeEach(async () =>
        {
            await this.tokensSenderImplementer.setShouldRevertSend(true);
        });

        it('send reverts', async () =>
        {
            await expectRevert.unspecified(sendFromHolder(token, this.sender, this.recipient, amount, data));
        });

        it('operatorSend reverts', async () =>
        {
            await expectRevert.unspecified(
                token.operatorSend(this.sender, this.recipient, amount, data, operatorData, { from: operator }),
            );
        });

        it('burn reverts', async () =>
        {
            await expectRevert.unspecified(burnFromHolder(token, this.sender, amount, data));
        });

        it('operatorBurn reverts', async () =>
        {
            await expectRevert.unspecified(
                token.operatorBurn(this.sender, amount, data, operatorData, { from: operator }),
            );
        });
    });

    context('when TokensSender does not revert', () =>
    {
        beforeEach(async () =>
        {
            await this.tokensSenderImplementer.setShouldRevertSend(false);
        });

        it('TokensSender receives send data and is called before state mutation', async () =>
        {
            const preSenderBalance = await token.balanceOf(this.sender);
            const preRecipientBalance = await token.balanceOf(this.recipient);

            const { tx } = await sendFromHolder(token, this.sender, this.recipient, amount, data);

            await assertTokensToSendCalled(
                token,
                tx,
                this.sender,
                this.sender,
                this.recipient,
                amount,
                data,
                null,
                preSenderBalance,
                preRecipientBalance,
            );
        });

        it('TokensSender receives operatorSend data and is called before state mutation', async () =>
        {
            const preSenderBalance = await token.balanceOf(this.sender);
            const preRecipientBalance = await token.balanceOf(this.recipient);

            const { tx } = await token.operatorSend(
                this.sender, this.recipient, amount, data, operatorData,
                { from: operator },
            );

            await assertTokensToSendCalled(
                token,
                tx,
                operator,
                this.sender,
                this.recipient,
                amount,
                data,
                operatorData,
                preSenderBalance,
                preRecipientBalance,
            );
        });

        it('TokensSender receives burn data and is called before state mutation', async () =>
        {
            const preSenderBalance = await token.balanceOf(this.sender);

            const { tx } = await burnFromHolder(token, this.sender, amount, data, { from: this.sender });

            await assertTokensToSendCalled(
                token, tx, this.sender, this.sender, ZERO_ADDRESS, amount, data, null, preSenderBalance,
            );
        });

        it('TokensSender receives operatorBurn data and is called before state mutation', async () =>
        {
            const preSenderBalance = await token.balanceOf(this.sender);

            const { tx } = await token.operatorBurn(this.sender, amount, data, operatorData, { from: operator });

            await assertTokensToSendCalled(
                token, tx, operator, this.sender, ZERO_ADDRESS, amount, data, operatorData, preSenderBalance,
            );
        });
    });
}

const removeBalance = (token, holder) =>
{
    it(`burning balance from ${holder}`, async () =>
    {
        const initialSupply = await token.initialSupply();
        const balanceInit = await token.balanceOf(holder);
        const toBurn = balanceInit; // all
        const data = web3.utils.sha3('beforeEach'); // '0x'
        await token.burn(balanceInit, data, { from: holder });
        const balanceEnd = await token.balanceOf(holder);

        //console.log(`holder: ${holder}\ninitialSupply: ${initialSupply.toString()}\nbalanceInit: ${balanceInit.toString()}\ntoBurn: ${toBurn.toString()}\nbalanceEnd: ${balanceEnd.toString()}`)
        expect(balanceEnd).to.be.bignumber.equal('0');
    });
}

const restoreBalance = (token, holder) =>
{
    it(`minting balance from ${holder}`, async () =>
    {
        const initialSupply = await token.initialSupply();
        const balanceCurrent = await token.balanceOf(holder);
        if (balanceCurrent < initialSupply)
        {
            const toMint = initialSupply.addn(-balanceCurrent);
            const data = web3.utils.sha3('afterEach');
            const operatorData = web3.utils.sha3('test');
            await token.mint(holder, toMint, data, operatorData, { from: holder });
            const balanceEnd = await token.balanceOf(holder);

            //console.log(`holder: ${holder}\ninitialSupply: ${initialSupply.toString()}\nbalanceCurrent: ${balanceCurrent.toString()}\ntoMint: ${toMint.toString()}\nbalanceEnd: ${balanceEnd.toString()}`)
            expect(balanceEnd).to.be.bignumber.equal(initialSupply);
        }
    });
}

const assertTokensReceivedCalled = async (token, txHash, operator, from, to, amount, data, operatorData, fromBalance, toBalance = '0') =>
{
    await expectEvent.inTransaction(txHash, ERC777SenderRecipientMock, 'TokensReceivedCalled', {
        operator, from, to, amount, data, operatorData, token: token.address, fromBalance, toBalance,
    });
}

const assertTokensToSendCalled = async (token, txHash, operator, from, to, amount, data, operatorData, fromBalance, toBalance = '0') =>
{
    await expectEvent.inTransaction(txHash, ERC777SenderRecipientMock, 'TokensToSendCalled', {
        operator, from, to, amount, data, operatorData, token: token.address, fromBalance, toBalance,
    });
}

const sendFromHolder = async (token, holder, to, amount, data) =>
{
    if ((await web3.eth.getCode(holder)).length <= '0x'.length)
    {
        return token.send(to, amount, data, { from: holder });
    } else
    {
        // assume holder is ERC777SenderRecipientMock contract
        return (await ERC777SenderRecipientMock.at(holder)).send(token.address, to, amount, data);
    }
}

const burnFromHolder = async (token, holder, amount, data) =>
{
    if ((await web3.eth.getCode(holder)).length <= '0x'.length)
    {
        return token.burn(amount, data, { from: holder });
    } else
    {
        // assume holder is ERC777SenderRecipientMock contract
        return (await ERC777SenderRecipientMock.at(holder)).burn(token.address, amount, data);
    }
}

const withNoERC777TokensSenderOrRecipient = (token, treasury, anyone, defaultOperatorA, defaultOperatorB, newOperator, dataInUserTransaction, dataInOperatorTransaction) =>
{
    describe('with no ERC777TokensSender and no ERC777TokensRecipient implementers', () =>
    {
        context(`with treasury ${treasury} directly`, () =>
        {
            shouldBehaveLikeERC777DirectSendBurn(token, treasury, anyone, dataInUserTransaction);
        });

        context(`with treasury ${treasury} as operator`, () =>
        {
            shouldBehaveLikeERC777OperatorSendBurn(token, treasury, anyone, treasury, dataInUserTransaction, dataInOperatorTransaction);
        });

        context(`with first default operator ${defaultOperatorA}`, () =>
        {
            shouldBehaveLikeERC777OperatorSendBurn(token, treasury, anyone, defaultOperatorA, dataInUserTransaction, dataInOperatorTransaction);
        });

        context(`with second default operator ${defaultOperatorB}`, () =>
        {
            shouldBehaveLikeERC777OperatorSendBurn(token, treasury, anyone, defaultOperatorB, dataInUserTransaction, dataInOperatorTransaction);
        });

        context(`before authorizing a new operator ${newOperator}`, () =>
        {
            shouldBehaveLikeERC777UnauthorizedOperatorSendBurn(token, treasury, anyone, newOperator, dataInUserTransaction, dataInOperatorTransaction);
        });

        /*
        context(`with new authorized operator ${newOperator}`, () =>
        {
            beforeEach(async () =>
            {
                await this.token.authorizeOperator(newOperator, { from: treasury });
            });
 
            shouldBehaveLikeERC777OperatorSendBurn(token, treasury, anyone, newOperator, dataInUserTransaction, dataInOperatorTransaction);
 
            context('with revoked operator ${newOperator}', () =>
            {
                beforeEach(async () =>
                {
                    await this.token.revokeOperator(newOperator, { from: treasury });
                });
 
                shouldBehaveLikeERC777UnauthorizedOperatorSendBurn(token, treasury, anyone, newOperator, dataInUserTransaction, dataInOperatorTransaction);
            });
        });
        */
    });
}


module.exports = {
    withNoERC777TokensSenderOrRecipient,

    shouldBehaveLikeERC777UnauthorizedOperatorSendBurn,
    shouldBehaveLikeERC777InternalMint,
    shouldBehaveLikeERC777SendBurnMintInternalWithReceiveHook,
    shouldBehaveLikeERC777SendBurnWithSendHook,
};