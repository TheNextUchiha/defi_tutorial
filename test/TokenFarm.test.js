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

            result = await daiToken.balanceOf(investor);
            assert.equal(result.toString(), tokens('100'), 'Investor mDai wallet balance correct before staking');
        })
    });

});