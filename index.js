const kanban = require('./services/kanban');
var secret = require('./services/secret.json');
const { default: BigNumber } = require('bignumber.js');

const baseCoin = 'USDT';
const main = async function() {
    const mnemonic = secret.mnemonic;
    let { 
        privateKey, address
    } = kanban.getWalletIdentity(mnemonic);

    const item = await kanban.getBuyBackItem();

    if(!item) {
        return;
    }

    const rewardCoinType = item.rewardCoinType;
    const rewardCoin = kanban.getCoinNameByTypeId(rewardCoinType);
    const rewardCoinAmount = item.rewardCoinAmount;
    const sellOrders = await kanban.getSellOrders(rewardCoin + baseCoin);

    let price = 0;
    let quantityBig = new BigNumber(rewardCoinAmount).shiftedBy(-18);
    for(let i = 0; i < sellOrders.length; i++) {
        const sellOrder = sellOrders[i];
        price = sellOrder[0];
        const quantity = sellOrder[1];
        quantityBig = quantityBig.minus(new BigNumber(quantity));
        if(quantityBig.lte(new BigNumber(0))) {
            break;
        }
    }

    if(price > 0 && rewardCoinAmount) {
        const buyBackTxHex = await kanban.buyTxHex(
            privateKey, address,
            rewardCoinType, 
            kanban.getCoinTypeIdByName(baseCoin), 
            '0x' + new BigNumber(price).shiftedBy(18).toString(16),
            '0x' + new BigNumber(rewardCoinAmount).toString(16)
        );
        const submited = await kanban.submitBuyBackTransaction(item._id, buyBackTxHex);
        console.log('submited===', submited);
    }
}

setInterval(main, 10000);

