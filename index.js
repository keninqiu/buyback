const kanban = require('./services/kanban');
var secret = require('./services/secret.json');
const config = require('./services/config');

const main = async function() {
    const mnemonic = "dune stem onion cliff equip seek kiwi salute area elegant atom injury";
    let { 
        privateKey, address, 
        privateKeyBTC, addressBTC, 
        privateKeyETH, addressETH, 
        privateKeyTRX, addressTRX,
        privateKeyLTC, addressLTC,
        privateKeyDOGE, addressDOGE,
        privateKeyBCH, addressBCH
    } = kanban.getWalletIdentity(mnemonic);

    const body = {
        currency: "USDT",
        items: [
            {
                title: "apple", 
                giveAwayRate: 12, 
                taxRate: 13, 
                lockedDays: 366, 
                price: 10, 
                quantity: 2
            },
            {
                title: "balance", 
                giveAwayRate: 12, 
                taxRate: 13, 
                lockedDays: 90, 
                price: 5, 
                quantity: 3
            }],
        store: "620bc00f2670171289caee54",
        totalSale: 35,
        totalTax: 4.55
    };
    const order = await kanban.createOrder(body);
    console.log('order=', order);

    const qrcode1 = kanban.generateQrcodeByOrder(order._id);
    const qrcode2 = kanban.generateQrcodeByStore("620bc00f2670171289caee54");

    console.log('qrcode1===', qrcode1);
    console.log('qrcode2===', qrcode2);

    const pay1 = await kanban.payOrder(privateKey, address, order._id);
    console.log('pay1=', pay1);

    const pay2 = await kanban.payStore(privateKey, address, "620bc00f2670171289caee54", 'USDT', 1000, 'pay for tutorfee');
    console.log('pay2=', pay2);
    /*
    const info = await kanban.get7StarInfo(address);
    console.log('info===', info);

    //address = '186UP7dhSaLo833xNVP8UU14KLXzeWQjUU';
    const isValid = await kanban.isValidMember(address);
    console.log('isValid====', isValid);
    */

    /*
    const balances = await kanban.getWalletBalances( //钱包数量和价格
        address, addressBTC, addressETH, addressTRX, addressLTC, addressDOGE, addressBCH
    );

    console.log('balances33333=', balances);
    */
    /*
    let ret = await kanban.deposit('TRX', null, 6, privateKeyTRX, addressTRX, privateKey, address, 0.1214, {});
    console.log('ret===', ret);
    */
    /*
    const balances = await kanban.getWalletBalances( //钱包数量和价格
        address, addressBTC, addressETH, addressTRX, addressLTC, addressDOGE, addressBCH
    );

    console.log('balances33333=', balances);
    */
   /*
    address = '1Lvf95PtnGD8n91arhqxJk53L7v3iLLGoJ';
    const pageSize = 10;
    const pageNum = 2;
    let ret = await kanban.getLockerDetails(address, pageSize, pageNum); //获取锁仓明细
    console.log('ret===', ret);
    */
    /*
    const smartContractAddr = '0x340c50c2602dbefdc4009fe99b21e7c30e3ff0cf';
    const orderId = '0x3554402a9786447e93d134ef615c64365ddda6bf26035ec61c5f9824526c4c5e';

    const respMerchant = await kanban.getMerchantBySmartContractAddress(smartContractAddr);
    console.log('respMerchant===', respMerchant);
    console.log('address=', address);
    */
    /*
    const refundResp = await kanban.refund(privateKey, smartContractAddr, orderId); // by merchant
    console.log('refundResp====', refundResp);
    */
    /*
    const transactionHistory = await kanban.getTransactionHistoryEvents( //钱包转七星和七星转钱包明细
        address, addressBTC, addressETH, addressTRX, addressLTC, addressDOGE, addressBCH
    );
    console.log('transactionHistory=', transactionHistory);
    
    const pageSize = 10;
    const pageNum = 1;
    const dateCreated = '2021-12-18';
    let transactions = await kanban.get7StarTransactions(address, pageSize, pageNum, dateCreated); //收入和支出： from=address为支出， merchantRecipient=address为收入
    console.log('transactions=', transactions);
    transactions = await kanban.get7StarTransactions(address, pageSize, pageNum);
    console.log('transactions=', transactions);

    let ret = await kanban.getLightningRemitTransactions(address, pageSize, pageNum); //获取闪汇明细 (待完成)
    ret = await kanban.getLightningRemitTransactions(address, pageSize, pageNum, dateCreated); //获取闪汇明细 (待完成)


    ret = await kanban.getLockerDetails(address, pageSize, pageNum); //获取锁仓明细
    ret = await kanban.getLockerDetails(address, pageSize, pageNum, dateCreated); //获取锁仓明细
    */

    /*
    console.log('address==', address);
    console.log('addressBTC==', addressBTC);
console.log('addressETH==', addressETH);
    console.log('addressTRX==', addressTRX);
    console.log('addressLTC==', addressLTC);
    console.log('addressDOGE==', addressDOGE);
    console.log('addressBCH==', addressBCH);
  
    
    console.log('privateKey==', privateKey);
    console.log('privateKeyBTC==', privateKeyBTC);
    console.log('privateKeyETH==', privateKeyETH);
    console.log('privateKeyTRX==', privateKeyTRX);
    console.log('privateKeyLTC==', privateKeyLTC);
    console.log('privateKeyDOGE==', privateKeyDOGE);
    console.log('privateKeyBCH==', privateKeyBCH);
    
   /*
    const balances = await kanban.getWalletBalances( //钱包数量和价格
        address, addressBTC, addressETH, addressTRX, addressLTC, addressDOGE, addressBCH
    );
    */
    //let feeChargerSmartContractAddress = store.feeChargerSmartContractAddress;
    /*
    const feeChargerSmartContractAddress = '0x340c50c2602dbefdc4009fe99b21e7c30e3ff0cf';

    
    const totalAmount = 179.4;
    const taxAmount = 41.4;
    //const orderId = '0x' + kanban.makeid(64);
    const orderId = '0x541779c2165a4ffbbccb4dd05a968aa7d99ff5db108640775f132c84eda389c3';
    console.log('orderId=', orderId);
    const coinNew = 'USDT';

    //let ret = await kanban.deposit('ETH', config.addresses.smartcontract.USDT.ETH, 6, privateKeyETH, addressETH, privateKey, address, 1, {});

    ///console.log('ret===', ret);
    
    //const chargeFundResp = await kanban.chargeFund(privateKey, feeChargerSmartContractAddress, orderId, coinNew, totalAmount, taxAmount);
    //console.log('chargeFundResp===', chargeFundResp);

    let ret = await kanban.deposit('ETH', config.addresses.smartcontract.USDT.ETH, 6, privateKeyETH, addressETH, privateKey, address, 2.056, {});

    //console.log('balances===', balances);
 */

    /*
    const respMerchant = await kanban.getMerchantBySmartContractAddress(feeChargerSmartContractAddress);
    //通过智能合约获取商户信息
    console.log('respMerchant===', respMerchant);
    
    const qrcodeString = kanban.generateQrcode(feeChargerSmartContractAddress, orderId, coinNew, totalAmount, taxAmount);
    //生成支付二维码
    console.log('qrcodeString===', qrcodeString);

    const chargeFunFromQrcode = await kanban.chargeFundFromQrcode(privateKey, qrcodeString);
    //扫描二维码支付
    console.log('chargeFunFromQrcode===', chargeFunFromQrcode);
    */

    /*
    let ret = await kanban.sendTransaction('BTC', null, 8, privateKeyBTC, addressBTC, 'mzUQnX1Bgoy2SrMjfBM33F64g5Mub7avX9', 0.001, {}, true);
    ret = await kanban.sendTransaction('FAB', null, 8, privateKey, address, 'mjxXkdgZxyQJ8B9i8Xow7jEmEQyQGzp97r', 10, {}, true);
    ret = await kanban.sendTransaction('LTC', null, 8, privateKeyLTC, addressLTC, 'n3VDXYPaz9e3RyYvBbn8XzTLpxPwpwWj6Y', 10, {}, true);
    
    ret = await kanban.sendTransaction('ETH', null, 18, privateKeyETH, addressETH, 
        '0x9b3897652a033916b733b2c39aa98a79cf64470e', 0.01, 
        {
        gasPrice: 100,
        gasLimit: 21000
    }, true);

    ret = await kanban.sendTransaction('ETH',  // USDT-ERC20
        config.addresses.smartcontract.USDT.ETH, 
        6, privateKeyETH, addressETH, 
        '0x9b3897652a033916b733b2c39aa98a79cf64470e', 0.01, 
        {
        gasPrice: 100,
        gasLimit: 70000
    }, true);

    ret = await kanban.sendTransaction(  // EXG
        'FAB', 
        config.addresses.smartcontract.EXG.FAB,
        18, privateKey, address, 
        'mw1H8n3QqTFCT4cdikkB8stsoeids8yaeC', 20, 
        {
            satoshisPerBytes: 100,
            bytesPerInput: 152,
            gasPrice: 40,
            gasLimit: 100000
        }, true);
    ret = await kanban.sendTransaction('TRX', null, 6, privateKeyTRX, addressTRX, 'TSGTqL78E6x1PGqrv6Cw7R4yXYRiXU1kwR', 1, {}, true);
    //console.log('ret===', ret);
    // USDT-TRC20
    ret = await kanban.sendTransaction('TRX', config.addresses.smartcontract.USDT.TRX, 6, privateKeyTRX, addressTRX, 'TSGTqL78E6x1PGqrv6Cw7R4yXYRiXU1kwR', 1, {}, true);
    */
    

    //let ret = await kanban.deposit('FAB', null, 8, privateKey, address, privateKey, address, 13, {}); //存款

    //let ret = await kanban.deposit('BTC', null, 8, privateKeyBTC, addressBTC, privateKey, address, 0.002, {});

    
    
    //let ret = await kanban.deposit('ETH', null, 18, privateKeyETH, addressETH, privateKey, address, 0.056, {});

    //let ret = await kanban.deposit('ETH', config.addresses.smartcontract.USDT.ETH, 6, privateKeyETH, addressETH, privateKey, address, 2.056, {});

    //let ret = await kanban.deposit('FAB', config.addresses.smartcontract.EXG.FAB, 18, privateKey, address, privateKey, address, 2.056, {});

    //let ret = await kanban.deposit('TRX', null, 6, privateKeyTRX, addressTRX, privateKey, address, 1, {});
    //let ret = await kanban.deposit('TRX', config.addresses.smartcontract.USDT.TRX, 6, privateKeyTRX, addressTRX, privateKey, address, 0.1, {});
    


    
    //ret = await kanban.getTransactionFee('TRX', null, 6, addressTRX, 1);
    
    //ret = await kanban.getTransactionFee('TRX', config.addresses.smartcontract.USDT.TRX, 6, addressTRX, 1);
    //ret = await kanban.getTransactionFee('BTC', null, 8, addressBTC, 0.01);

    //ret = await kanban.getTransactionFee('FAB', null, 8, address, 0.01);
    //ret = await kanban.getTransactionFee('FAB', config.addresses.smartcontract.EXG.FAB, 8, address, 0.01);
    //ret = await kanban.getTransactionFee('ETH', null, 18, address, 0.01);
    //ret = await kanban.getTransactionFee('ETH', config.addresses.smartcontract.USDT.ETH, 6, address, 0.01);
    //console.log('rettt=', ret);
    /*
    const redepositList = await kanban.getRedepositList(address); //获取确认存款列表
    console.log('redepositList=', redepositList);
    for(let i = 0; i < redepositList.length; i++) {
        console.log('i===', i);
        const redepositItem = redepositList[i];
        const coinType = redepositItem.coinType;
        const transactionID = redepositItem.transactionID;
        const amount = redepositItem.amount;
        const signature = {r: redepositItem.r, s: redepositItem.s, v: redepositItem.v};
        await kanban.redeposit(coinType, amount, transactionID, privateKey, address, signature); //确认存款   
    }
    */


    /*
    let ret = await kanban.withdraw('FAB', null, privateKey, address, 'n1eXG5oe6wJ6h43akutyGfphqQsY1UfAUR', 1);
    console.log('ret====', ret);
    */
    //let ret = await kanban.withdraw('BTC', null, privateKey, address, 'muQDw5hVmFgD1GrrWvUt6kjrzauC4Msaki', 0.02);

    //let ret = await kanban.withdraw('FAB', config.addresses.smartcontract.EXG.FAB, privateKey, address, 'n1eXG5oe6wJ6h43akutyGfphqQsY1UfAUR', 100);
    //let ret = await kanban.withdraw('ETH', null, privateKey, address, '0x02c55515e62a0b25d2447c6d70369186b8f10359', 0.2);
    //console.log('ret====', ret);

    /*
    let ret = await kanban.addGas(privateKey, address, 0.1, {}); //购买gas
    console.log('ret===', ret);
    */
    

    //const pageSize = 10;
    //const pageNum = 1;
    /*
    let ret = await kanban.getLockerDetails(address, pageSize, pageNum); //获取锁仓明细
    console.log('ret in getLockerDetails====', ret);
    */
    
    /*
    const lightningRemitAddress = await kanban.getLightningRemitAddress(address); //获取闪汇地址

    console.log('lightningRemitAddress===', lightningRemitAddress);
    const tokenName = 'USDT';
    //const ret = await kanban.lightningRemit(privateKey, address, 'oMJwh4siohFoPui4ED9D4EKukS1B7YjeJP', tokenName, 1.1); //闪汇转账
    

    const ret = await kanban.getLightningRemitTransactions(address, pageSize, pageNum); //获取闪汇明细
    console.log('ret===', ret);
    */
    /*
    const addressHex = kanban.fabToExgAddress(address);
    console.log('addressHex==', addressHex);
    const nonce = await kanban.getTransactionCount(addressHex);

    console.log('nonce=', nonce);
    */
    /*
    const name = 'store';
    const nameChinese = '中文店铺';
    const addr = '888 sss ave';
    const addrChinese = '中文地址';
    const contactName = 'mr. zhang';
    const contactNameChinese = '张先生';
    const phone = '666775544';
    const fax = '566665443';
    const email = 'dere@gmail.com';
    const website = 'store';
    const openTime = '9:00 am';
    const closeTime = '6:00 pm';
    const businessContents = 'online store for nutrition';
    const businessContentsChinese = '主营业务，在线电子商务';
    const coin = 'USDT';
    const giveAwayRate = 15;
    const taxRate = 13;
    const refAddress = '14h3WSyJva6itCpZ7pirXwLpK52Ek3qHGz';
    const image = '';
    const hideOnStore = true;
    */
   
    const name = '测试22';
    const nameChinese = '测试33';
    const addr = '山东省青岛市黄岛区薛家岛街道昆泉星港凤海苑';
    const addrChinese = '山东省青岛市黄岛区薛家岛街道昆泉星港凤海苑';
    const contactName = '测试';
    const contactNameChinese = '测试';
    const phone = null;
    const fax = '053288888888';
    const email = '308178561@qq.com';
    const website = '';
    const openTime = '';
    const closeTime = '';
    const businessContents = 19;
    const businessContentsChinese = 19;
    const coin = 'USDT';
    const giveAwayRate = "13";
    const taxRate = "13";
    const image = '';
    const hideOnStore = true;  


    const store = await kanban.getStore(address);
    const resp = await kanban.updateStore( // 修改商店
        privateKey,
        store._id,
        name,
        nameChinese,
        addr,
        addrChinese,
        contactName,
        contactNameChinese,
        phone,
        fax,
        email,
        website,
        openTime,
        closeTime,
        businessContents,
        businessContentsChinese,
        coin,
        giveAwayRate,
        taxRate,
        image,
        hideOnStore
    );
    //console.log('resppp=', resp);
    /*
    	"name": "测试",
	"nameChinese": "测试",
	"addr": "山东省青岛市黄岛区薛家岛街道昆泉星港凤海苑",
	"addrChinese": "山东省青岛市黄岛区薛家岛街道昆泉星港凤海苑",
	"contactName": "测试",
	"contactNameChinese": "测试",
	"phone": "13012410050",
	"fax": "053288888888",
	"email": "308178561@qq.com",
	"website": "",
	"openTime": "",
	"closeTime": "",
	"businessContents": 19,
	"businessContentsChinese": 19,
	"coin": "USDT",
	"giveAwayRate": "13",
	"taxRate": "13",
	"refAddress": "1HNFSS4TdSNesb4thffndBXPAeUWAyj4HV",
	"image": "",
	"hideOnStore": true,
	"notify_url": "https://7star.xiaomustang.com//api/notice/store_check"
    */

    /*
    const notify_url = "https://7star.xiaomustang.com//api/notice/store_check";
    // data: store对象
    const resp = await kanban.createStore( // 生成商店
        privateKey,
        name,
        nameChinese,
        addr,
        addrChinese,
        contactName,
        contactNameChinese,
        phone,
        fax,
        email,
        website,
        openTime,
        closeTime,
        businessContents,
        businessContentsChinese,
        coin,
        giveAwayRate,
        taxRate,
        refAddress,
        image,
        hideOnStore,
        notify_url
    );
    console.log('resp==', resp);
    if(resp && resp.ok) {

        const store = resp._body;
        console.log('new store=', store);
    } else {
        console.log('resp===', resp);
    }
    
    const storeId = '61cbeb9e56c2fb67f608194b';
    const deleted = await kanban.deleteStore(privateKey, storeId);
    console.log('deleted===', deleted);
    */
    /*
    const status = await kanban.getStoreStatus(address);
    //address: store owner的钱包地址
    // -1: store不存在， 0: 待审核   1:审核通过

    let feeChargerSmartContractAddress = store.feeChargerSmartContractAddress;
    */
   /*
    feeChargerSmartContractAddress = '0x1e89b7d555fe1b68c048b68eb28724950e1051f2';
    const totalAmount = 10;
    const taxAmount = 1.3;
    const orderId = '0x' + kanban.makeid(64);
    const chargeFundResp = await kanban.chargeFund(privateKey, feeChargerSmartContractAddress, orderId, coin, totalAmount, taxAmount);
    //支付
    console.log('chargeFundResp===', chargeFundResp);
    */
    /*
    const requestRefundResp = await kanban.requestRefund(privateKey, feeChargerSmartContractAddress, orderId); // by customer
    //请求退款
    
    const cancelRefundRequestResp = await kanban.cancelRefundRequest(privateKey, feeChargerSmartContractAddress, orderId); // by customer
    //撤销退款请求
    
    const refundResp = await kanban.refund(privateKey, feeChargerSmartContractAddress, orderId); // by merchant
    //批准退款
    
    

    const gas = await kanban.getGas(address); //获取燃料余额
    //console.log('gas=', gas);
 
    const pageSize = 10;
    const pageNum = 1;
    address = 'n1eXG5oe6wJ6h43akutyGfphqQsY1UfAUR';
    const transactions = await kanban.get7StarTransactions(address, pageSize, pageNum); //收入和支出： from=address为支出， merchantRecipient=address为收入
    console.log('transactions===', transactions);

    const balances = await kanban.get7StarBalance(address); //当前余额
    console.log('balances==', balances);
    */
   
}

main();



// 分页，主动查询审核状态，异步通知