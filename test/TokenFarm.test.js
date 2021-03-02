const { assert } = require('chai');

const DaiToken = artifacts.require('DaiToken');
const DappToken = artifacts.require('DappToken');
const TokenFarm = artifacts.require('TokenFarm');

require('chai').use(require('chai-as-promised')).should();

function tokens(n) {
    return web3.utils.toWei(n, 'ether'); 
}

contract('TokenFarm', ([owner, investor]) => {
    let daiToken, dappToken, tokenFarm;

    before(async () => {
        // Load Contracts
        daiToken = await DaiToken.new();
        dappToken = await DappToken.new();
        tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address);

        // Transfer all Dapp tokens
        await dappToken.transfer(tokenFarm.address, tokens('100000'));

        // Send tokens to investor
        await daiToken.transfer(investor, tokens('100'), { from: owner });
    });

    describe('Mock DAI Deployment', async () => {
        it('has a name', async () => {
            const name = await daiToken.name();

            assert.equal(name, 'Mock DAI Token');
        });
    });

    describe('DApp Token Deployment', async () => {
        it('has a name', async () => {
            const name = await dappToken.name();

            assert.equal(name, 'DApp Token');
        });
    });

    describe('Token Farm Deployment', async () => {
        it('has a name', async () => {
            const name = await tokenFarm.name();

            assert.equal(name, 'Dapp Token Farm');
        });

        it('contract has tokens', async () => {
            let balance = await dappToken.balanceOf(tokenFarm.address);
            assert.equal(balance.toString(), tokens('100000'));
        });
    });

    describe('Farming Tokens', async () => {
        it('reward investors for staking mDai', async () => {
            let result;

            // Check investor balance before staking
            result = await daiToken.balanceOf(investor);
            assert.equal(result.toString(), tokens('100'), 'Investor mDai wallet balance correct before staking');

            // Stake Mock DAI
            await daiToken.approve(tokenFarm.address, tokens('100'), { from: investor });
            await tokenFarm.stakeTokens(tokens('100'), {from: investor});

            // Check Staking status
            result = await daiToken.balanceOf(investor);
            assert.equal(result.toString(), tokens('0'), 'investor mDai wallet balance correct after staking');

            result = await daiToken.balanceOf(tokenFarm.address);
            assert.equal(result.toString(), tokens('100'), 'Token Farm balance correct');

            result = await tokenFarm.stakingBalance(investor);
            assert.equal(result.toString(), tokens('100'), 'invesotr staking balance correct');

            result = await tokenFarm.isStaking(investor);
            assert.equal(result.toString(), 'true', 'investor staking balance correct');


            // Issue Tokens
            await tokenFarm.issueTokens({from: owner});

            // Check balance after issuance
            result = await dappToken.balanceOf(investor);
            assert.equal(result.toString(), tokens('100'), 'Invesotr Dapp token wallet balance correct after issuance');

            // Ensure that only owner can issue tokens
            await tokenFarm.issueTokens({from: investor}).should.be.rejected;

            // Unstake tokens
            await tokenFarm.unstakeTokens({from: investor});

            // Check results after unstaking
            result = await daiToken.balanceOf(investor);
            assert.equal(result.toString(), tokens('100'), 'investor mDai wallet balance correct after unstaking');

            result = await daiToken.balanceOf(tokenFarm.address);
            assert.equal(result.toString(), tokens('0'), 'Token farm mDai wallet balance correct after unstaking');

            result = await tokenFarm.stakingBalance(investor);
            assert.equal(result.toString(), tokens('0'), 'investor staking balance correct after unstaking');

            result = await tokenFarm.isStaking(investor);
            assert.equal(result.toString(), 'false', 'investor staking status correct after unstaking');
        });
    });

});