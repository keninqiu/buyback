var secret = require('./secret.json');
const config = require('./config');
const feeCharger = require('./feeCharger');
const axios = require('axios');
const bs58 = require('bs58');
const Web3 = require('web3');
const { default: BigNumber } = require('bignumber.js');
const createHash =  require('create-hash');
var Btc = require('bitcoinjs-lib');
var CryptoJS = require('crypto-js');
var  Hash = require('eth-lib/lib/hash');
const util = require('ethereumjs-util');
const Web3EthAbi = require('web3-eth-abi');
var auth_code = 'encrypted by crypto-js|';
var coin_list = require('./coins');
var Common = require('ethereumjs-common').default;
var BIP32 = require('bip32');
//const TronWeb = require('tronweb');
const tron = require('./tron');
const ethWallet = require('ethereumjs-wallet');
const hdkey = ethWallet.hdkey;
const varuint = require('varuint-bitcoin');
var BIP39 = require('bip39');
//var bitcoinMessage = require('bitcoinjs-message');
const bchaddr = require('bchaddrjs');
const EthereumTx = require('ethereumjs-tx').Transaction;
const Account = require('eth-lib/lib/account');
/*
const HttpProvider = TronWeb.providers.HttpProvider;
const fullNode = new HttpProvider('https://api.trongrid.io');
const solidityNode = new HttpProvider('https://api.trongrid.io');
const eventServer = new HttpProvider('https://api.trongrid.io');
const ADDRESS_PREFIX_REGEX = /^(41)/;
*/
var exaddr = require('./exaddr');
var txids = [];
var globalNonce = {};
var __importDefault = (this && this.__importDefault) || function(mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};

Object.defineProperty(exports, "__esModule", { value: true });
var service_1 = __importDefault(require("./service"));

var ETH = {
    chain: 'ropsten',
    hardfork: 'byzantium',
    gasPrice: 30,
    gasLimit: 100000
};

var KANBAN = {
    chain: {
        name: 'test',
        networkId: 212,
        chainId: 212
    },
    gasPrice: 50000000,
    gasLimit: 20000000
};

if (secret.production) {
    ETH = {
        chain: 'mainnet',
        hardfork: 'petersburg',
        gasPrice: 90,
        gasLimit: 200000
    };
    KANBAN = {
        chain: {
            name: 'mainnet',
            networkId: 211,
            chainId: 211
        },
        gasPrice: 50000000,
        gasLimit: 20000000
    };
}

module.exports = {

    removeGlobalNonce: () => {
        globalNonce = {};
    },
    getTransactionHash: (txhex) => {
        const hash = util.keccak(txhex).toString('hex');
        return '0x' + hash;
    },
    makeid: (length) => {
        var result           = '';
        var characters       = 'abcdef0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
          result += characters.charAt(Math.floor(Math.random() * 
     charactersLength));
       }
       return result;
    },
    getFuncABI: (func, args) => {
        var encoded = Web3EthAbi.encodeFunctionCall(func, args);
        return encoded;
    },
    getTransactionHistoryEvents: async(address, addressBTC, addressETH, addressTRX, addressLTC, addressDOGE, addressBCH) => {
        const data = {
            bchAddress: addressBCH,
            btcAddress: addressBTC,
            dogeAddress: addressDOGE,
            ethAddress: addressETH,
            fabAddress: address,
            ltcAddress: addressLTC,
            timestamp: 0,
            trxAddress: addressTRX,
            pageSize: 10,
            pageNum: 1,
            coin: 'USDT',
            dateCreated: '2021-12-18'
        }

        const url = 'https://kanban' + (secret.production ? 'prod' : 'test') +'.fabcoinapi.com/getTransactionHistoryEvents';
        let resp = '';
        try {
            const response = await axios.post(url, data);
            resp = response.data;

        }catch (err) {
        }
        
        return resp;  
    },
    getWalletBalances: async (address, addressBTC, addressETH, addressTRX, addressLTC, addressDOGE, addressBCH) => {
        const data = {
            bchAddress: addressBCH,
            btcAddress: addressBTC,
            dogeAddress: addressDOGE,
            ethAddress: addressETH,
            fabAddress: address,
            ltcAddress: addressLTC,
            timestamp: 0,
            trxAddress: addressTRX
        }

        console.log('data===', data);
        const url = 'https://kanban' + (secret.production ? 'prod' : 'test') +'.fabcoinapi.com/walletBalances';
        console.log('url=', url);
        let resp = '';
        try {
            const response = await axios.post(url, data);
            resp = response.data;
            if(resp && resp.data) {
                resp.data = resp.data.map(item => {
                    if(item.balance == -1) {
                        item.balance = 0;
                    }
                    if(item.lockBalance == -1) {
                        item.lockBalance = 0;
                    }       
                    return item;             
                });
            }

        }catch (err) {
        }
        
        return resp;        
    },

    getNetwork: (coinName) => {
        let network = secret.production ? Btc.networks.bitcoin : Btc.networks.testnet;

        if(coinName == 'LTC') {
            network = secret.production ? {
                messagePrefix: '\u0019Litecoin Signed Message:\n',
                bech32: 'tb',
                bip32: {
                    public: 0x0436f6e1,
                    private: 0x0436ef7d,
                },
                pubKeyHash: 0x6f,
                scriptHash: 0x3a,
                wif: 0xef,
            } : {
                messagePrefix: '\u0019Litecoin Signed Message:\n',
                bech32: 'tb',
                bip32: {
                  public: 0x019da462,
                  private: 0x019d9cfe,
                },
                pubKeyHash: 0x30,
                scriptHash: 0x32,
                wif: 0xb0,
            }
        } else
        if(coinName == 'DOGE') {
            network = secret.production ? {
                messagePrefix: '\u0019Dogecoin Signed Message:\n',
                bech32: 'tb',
                bip32: {
                  public: 0x02facafd,
                  private: 0x02fac398,
                },
                pubKeyHash: 0x1e,
                scriptHash: 0x16,
                wif: 0x9e,
            } : {
                messagePrefix: '\u0019Dogecoin Signed Message:\n',
                bech32: 'tb',
                bip32: {
                    public: 0x043587cf,
                    private: 0x04358394,
                },
                pubKeyHash: 0x71,
                scriptHash: 0xc4,
                wif: 0xf1,
            }
        } else
        if(coinName == 'BCH') {
            network = secret.production ? {
                messagePrefix: '\u0018Bitcoin Signed Message:\n',
                bech32: 'tb',
                bip32: {
                  public: 0x0488b21e,
                  private: 0x0488ade4,
                },
                pubKeyHash: 28,
                scriptHash: 40,
                wif: 0x80,
            } : {
                messagePrefix: '\u0018Bitcoin Signed Message:\n',
                bech32: 'tb',
                bip32: {
                    public: 0x043587cf,
                    private: 0x04358394,
                },
                pubKeyHash: 0x6f,
                scriptHash: 0xc4,
                wif: 0xef,
            }
        }

        return network;
    },

    signTxWithPrivateKey: async(txParams, privateKey) => {

        const EthereumTx = Eth.Transaction;
        const tx = new EthereumTx(
            txParams, 
            { 
                chain: environment.chains.ETH.chain, 
                hardfork: environment.chains.ETH.hardfork 
            }
        );
        tx.sign(privateKey);
        const serializedTx = tx.serialize();
        const txhex = '0x' + serializedTx.toString('hex');
        return txhex;
    },
    getUtxos: async(coin, address) => {
        const url = 'https://' + coin.toLowerCase(coin) + (secret.production ? 'prod' : 'test') + '.fabcoinapi.com/' + 'getutxos/' + address;
        
        console.log('url in getBtcUtxos' + url);
        let resp = null;

        try {
            const response = await axios.get(url);
            resp = response.data;

        }catch (err) {
        }

        return resp;
    },

    getEthNonce: async (address) => {
        const url = 'https://' + 'eth' + (secret.production ? 'prod' : 'test') + '.fabcoinapi.com/' + 'getnonce/' + address + '/latest';
        resp = '0';
        try {
            const response = await axios.get(url);
            resp = response.data;

        }catch (err) {
        }
        return Number(resp);
    },

    postTx: async(coin, txHex) => {
        let txHash = '';
        let errMsg = '';
        const url = 'https://' + coin.toLowerCase(coin) + (secret.production ? 'prod' : 'test') + '.fabcoinapi.com/' + 'postrawtransaction';
        console.log('url for postTx===', url);
        let resp = null;
 
        const data = {
         rawtx: txHex
        };

        try {
             if (txHex) {
                const response = await axios.post(url, data);
                resp = response.data;
                console.log('resp===', resp);
             }
             if (resp && resp.txid) {
                txHash = resp.txid;
             }
        } catch (err) {
            console.log('err===', err);
             if (err.error && err.error.Error) {
                errMsg = err.error.Error;
             console.log('err there we go', err.error.Error);
            }
        }
 
        //return ret;
        return {txHash, errMsg};
    },
    
    postEthTx: async (txHex) => {

        let txHash = '';
        let errMsg = '';
        const url = 'https://' + 'eth' + (secret.production ? 'prod' : 'test') + '.fabcoinapi.com/' + 'sendsignedtransaction';
        const data = {
            signedtx: txHex
        };
        if (txHex) {

            try {
                const response = await axios.post(url, data);
                txHash = response.data.trim();
           } catch (err) {
                if (err.error && err.error.Error) {
                   errMsg = err.error.Error;
               }
           }
        }    
        const ret = {txHash, errMsg};
        return ret;
    },

    getCoinPoolAddress: async () => {
        const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
        let url =  'https://' + 'kanban' + (secret.production ? 'prod' : 'test') + '.fabcoinapi.com/' + 'exchangily/getCoinPoolAddress';
        let addr = '';
        try {
            try {
                const response = await axios.get(url);
                addr = response.data.trim();
           } catch (err) {
                if (err.error && err.error.Error) {
               }
           }
        } catch (e) {
        }

        return addr;
    },

    getUpdatedCoinType(coinName, tokenId) {
        console.log('coinName===', coinName);
        console.log('tokenId====', tokenId);
        if(!tokenId) {
            console.log('tokenId is null');
            for (let i = 0; i < coin_list.length; i++) {
                const coin2 = coin_list[i];
                console.log('coin2===', coin2);
                if (coin2.name === coinName) {
                    return coin2.id;
                }
            }
        } else {
            console.log('tokenId is not null');
            const smartcontractes = config.addresses.smartcontract;
            const keys = Object.keys(smartcontractes);
            for(let i = 0; i < keys.length; i++) {
                const key = keys[i];
                if(smartcontractes[key][coinName] == tokenId) {
                    let name = key;
                    if (name === 'USDT' && coinName === 'TRX') {
                        name = 'USDTX';
                    } else 
                    if (name === 'FAB' && coinName === 'ETH') {
                        name = 'FABE';
                    } else 
                    if (name === 'EXG' && coinName === 'ETH') {
                        name = 'EXGE';
                    } else 
                    if (name === 'DSC' && coinName === 'ETH') {
                        name = 'DSCE';
                    } else 
                    if (name === 'BST' && coinName === 'ETH') {
                        name = 'BSTE';
                    }
                    
                    console.log('name===', name);
                    return module.exports.getUpdatedCoinType(name, null);
                }
            }

        }

        return -1;
    },
    fixedLengh: (obj, length ) => {
        let str = obj.toString();
        const strLength = str.length;
        if (strLength >= length) {
            str = str.substring(strLength - length);
            // console.log(str);
            return str;
        }
        for (let i = 0; i < length - strLength; i++) {
            str = '0' + str;
        }
        return str;
    },
    getOriginalMessage: (coinType, txHash, amount, address) => {

        let buf = '';
        const coinTypeHex = coinType.toString(16);

        buf += module.exports.fixedLengh(coinTypeHex, 8);

        
        buf += module.exports.fixedLengh(txHash, 64);
        const hexString = amount.toString(16);
        buf += module.exports.fixedLengh(hexString, 64);
        buf += module.exports.fixedLengh(address, 64);

        return buf;
    },
    sha256: (b) => {
        return createHash('sha256')
          .update(b)
          .digest()
    },
    hash256: (buffer) => {
        return module.exports.sha256(module.exports.sha256(buffer))
    },
    magicHash: (message, messagePrefix) => {
        messagePrefix = messagePrefix || '\u0018Bitcoin Signed Message:\n'
        if (!Buffer.isBuffer(messagePrefix)) {
          messagePrefix = Buffer.from(messagePrefix, 'utf8')
        }
        if (!Buffer.isBuffer(message)) {
          message = Buffer.from(message, 'utf8')
        }
        const messageVISize = varuint.encodingLength(message.length)
        const buffer = Buffer.allocUnsafe(
          messagePrefix.length + messageVISize + message.length
        )
        messagePrefix.copy(buffer, 0)
        varuint.encode(message.length, buffer, messagePrefix.length)
        message.copy(buffer, messagePrefix.length + messageVISize)
        return module.exports.hash256(buffer)
    },
    async signedMessage(originalMessage, coinName, privateKey) {
        // originalMessage = '000254cbd93f69af7373dcf5fc01372230d309684f95053c7c9cbe95cf4e4e2da731000000000000000000000000000000000000000000000000000009184e72a000000000000000000000000000a2a3720c00c2872397e6d98f41305066cbf0f8b3';
        // console.log('originalMessage=', originalMessage);
        let signature

        if (coinName === 'ETH') {

            
            const msg = Buffer.from(originalMessage);
            const msgHash = util.hashPersonalMessage(msg);
            console.log('msgHash====', msgHash);
            signature = util.ecsign(msgHash, privateKey);

            signature.r = '0x' + signature.r.toString('hex');
            signature.s = '0x' + signature.s.toString('hex');
            signature.v = '0x' + signature.v.toString(16);
            console.log('final signature=', signature);
            /*
            const pk = `0x${privateKey.toString('hex')}`;
            const web3 = new Web3();
        
            signature = web3.eth.accounts.sign(originalMessage, pk);
            console.log('signature===', signature);
            */
        } else 
        if (coinName === 'TRX') {
            const priKeyDisp = privateKey.toString('hex'); 
            signature = tron.signString(originalMessage, priKeyDisp);
        }
        else if (
            ['BTC', 'FAB', 'LTC', 'DOGE'].indexOf(coinName) >= 0) {
            console.log('1aaa');
            let signBuffer;

            let messagePrefix = '\u0018Bitcoin Signed Message:\n';
            if(coinName == 'LTC') {
                messagePrefix = '\u0019Litecoin Signed Message:\n';
            } else
            if(coinName == 'DOGE') {
                messagePrefix = '\u0019Dogecoin Signed Message:\n';
            }

            /*
            let v = '';
            let r = '';
            let s = '';

            
            signBuffer = bitcoinMessage.sign(originalMessage, privateKey,
                true, messagePrefix);
            




            v = `0x${signBuffer.slice(0, 1).toString('hex')}`;
            r = `0x${signBuffer.slice(1, 33).toString('hex')}`;
            s = `0x${signBuffer.slice(33, 65).toString('hex')}`; 

            const signature1 = { r: r, s: s, v: v };
            */

            const hash = module.exports.magicHash(originalMessage, messagePrefix);
            signature = util.ecsign(hash, privateKey);

            signature.r = '0x' + signature.r.toString('hex');
            signature.s = '0x' + signature.s.toString('hex');
            signature.v = '0x' + (signature.v + 4).toString(16);
            console.log('signature=', signature);

        } else 
        if (coinName === 'BCH') {

           let signBuffer;
           const message = new BchMessage(originalMessage);

           // var signature = message.sign(privateKey);
           
           const hash = message.magicHash();
           const ecdsa = new bitcore.crypto.ECDSA();
           ecdsa.hashbuf = hash;
           ecdsa.privkey = keyPair.privateKey;
           ecdsa.pubkey = keyPair.privateKey.toPublicKey();
           ecdsa.signRandomK();
           ecdsa.calci();
           signBuffer = ecdsa.sig.toCompact();

           console.log('signBuffer===', signBuffer);
           let v = '';
           let r = '';
           let s = '';

           v = `0x${signBuffer.slice(0, 1).toString('hex')}`;
           r = `0x${signBuffer.slice(1, 33).toString('hex')}`;
           s = `0x${signBuffer.slice(33, 65).toString('hex')}`; 

           signature = { r: r, s: s, v: v };
           // console.log('signature=', signature);

        }    

        return signature;
    },
    getDepositFuncABI: (coinType, txHash, amount, addressInKanban, signedMessage) => {

        let abiHex = '379eb862';
        abiHex += module.exports.stripHexPrefix(signedMessage.v);

        let coinTypeHex = coinType.toString(16);
        if(coinTypeHex == '70001') { //TRC20 USDT
            coinTypeHex = '700030001';
        }
        abiHex += module.exports.fixedLengh(coinTypeHex, 62);

        
        abiHex += module.exports.stripHexPrefix(txHash);
        const amountHex = amount.toString(16);
        abiHex += module.exports.fixedLengh(amountHex, 64);
        abiHex += module.exports.fixedLengh(module.exports.stripHexPrefix(addressInKanban), 64);
        abiHex += module.exports.stripHexPrefix(signedMessage.r);
        abiHex += module.exports.stripHexPrefix(signedMessage.s);
        
        return abiHex;
    
    },
    submitDeposit: async(rawTransaction, rawKanbanTransaction) => {
        if(!rawTransaction) {
            return 'no rawTransaction';
        }
        if(!rawKanbanTransaction) {
            return 'no rawKanbanTransaction';
        }
        const data = {
            'rawTransaction': rawTransaction,
            'rawKanbanTransaction': rawKanbanTransaction
        };

        let resp = '';
        const url = 'https://kanban' + (secret.production ? 'prod' : 'test') + '.fabcoinapi.com/' + 'submitDeposit';

        try {
            const response = await axios.post(url, data);

            resp = response.data;

        }catch (err) {
            console.log('errr=', err);
        }

        return resp;
    },

    getCoinTypePrefix(coinName, tokenId) {
        let prefix = 0;
        if(coinName == 'TRX' && tokenId == config.addresses.smartcontract.USDT.TRX) {
            prefix = 7;
        }
        if(coinName == 'ETH' && 
        (  
            tokenId == config.addresses.smartcontract.FAB.ETH
            || tokenId == config.addresses.smartcontract.EXG.ETH
            || tokenId == config.addresses.smartcontract.DSC.ETH
            || tokenId == config.addresses.smartcontract.BST.ETH
        )
        ) {
            prefix = 3;
        }
        
        return prefix;
    },
    withdraw: async(coinName, tokenId, privateKey, address, toAddress, amount) => {

        const amountInLink = new BigNumber(amount).shiftedBy(18); // it's for all coins.
        let addressInWallet = toAddress;

        if (['BTC', 'FAB', 'LTC', 'DOGE', 'TRX'].indexOf(coinName) >= 0) {
            const bytes = bs58.decode(addressInWallet);
            addressInWallet = bytes.toString('hex');
            console.log('addressInWallet there we go:', addressInWallet);

        } 

        const coinPoolAddress = await module.exports.getCoinPoolAddress();
        const coinType = module.exports.getUpdatedCoinType(coinName, tokenId);
        const abiData = module.exports.getWithdrawFuncABI(coinType, amountInLink, addressInWallet);
        const txhex = await module.exports.getExecSmartContractHexByData(privateKey, address, coinPoolAddress, abiData);
        console.log('txhex==', txhex);
        const res = await module.exports.sendRawSignedTransactionPromise(txhex);
        return res;
    },
    getScarAddress: async() => {
        let url = 'https://kanban' + (secret.production ? 'prod' : 'test') + '.fabcoinapi.com/' + 'kanban/getScarAddress';
        let addr = '';
        try {
            const response = await axios.get(url);

            addr = response.data;

           gas = new BigNumber(resp.balance.FAB).shiftedBy(-18).toNumber();

        }catch (err) {
        }

        return addr;
    },
    addGas: async(privateKey, address, amount, options) => {
        let gasLimit = 800000;
        let gasPrice = 40;
        const contractAddress = await module.exports.getScarAddress();
        if(options) {
            if(options.gasLimit) {
                gasLimit = options.gasLimit;
            }
            if(options.gasPrice) {
                gasPrice = options.gasPrice;
            }
        } else {
            options = {
                gasLimit: 800000,
                gasPrice: 40
            };
        }

        const funcDeposit = {
            'constant': false,
            'inputs': [],
            'name': 'addDeposit',
            'outputs': [
                {
                    'name': '',
                    'type': 'address'
                }
            ],
            'payable': true,
            'stateMutability': 'payable',
            'type': 'function'
        };

        let fxnCallHex = module.exports.getFuncABI(funcDeposit, []);
        fxnCallHex = module.exports.stripHexPrefix(fxnCallHex);

        const totalAmount = gasLimit * gasPrice / 1e8;

        let totalFee = totalAmount;
        const contract = Btc.script.compile([
            84,
            module.exports.number2Buffer(gasLimit),
            module.exports.number2Buffer(gasPrice),
            module.exports.hex2Buffer(fxnCallHex),
            module.exports.hex2Buffer(contractAddress),
            194
        ]);

        const contractSize = contract.toJSON.toString().length;
        totalFee += module.exports.convertLiuToFabcoin(contractSize * 10);

        options.extraFee = totalFee;
        return await module.exports.sendTransaction('FAB', null, 8, privateKey, address, contract, amount, options, true);
    },
    getWithdrawFuncABI: (coinType, amount, destAddress) => {
        let abiHex = '3295d51e';
        // console.log('abiHex there we go:' + abiHex);  
        let coinTypeHex = coinType.toString(16);
        if(coinTypeHex == '70001') { //TRC20 USDT
            coinTypeHex = '700030001';
        }
        abiHex += module.exports.fixedLengh(coinTypeHex, 64);
        
        // console.log('abiHex1=' + abiHex);
    
        const amountHex = amount.toString(16);
        // console.log('amount=' + amount);
        // console.log('amountHex=' + amountHex);
        abiHex += module.exports.fixedLengh(amountHex, 64);
        // console.log('abiHex2=' + abiHex);
        abiHex += module.exports.fixedLengh(module.exports.stripHexPrefix(destAddress), 64);
        // console.log('abiHex final:' + abiHex);    
        return abiHex;
    },

    deposit: async(coinName, tokenId, decimals, privateKey, address, fabPrivateKey, fabAddress, amount, options) => {
        console.log('coinName===', coinName);
        console.log('tokenId===', tokenId);
        console.log('decimals===', decimals);
        console.log('privateKey===', privateKey);
        console.log('address===', address);
        console.log('fabPrivateKey===', fabPrivateKey);
        console.log('fabAddress===', fabAddress);
        console.log('amount===', amount);
        console.log('options===', options);
        const toAddress = config.addresses.exchangilyOfficial[coinName];
        console.log('toAddress===', toAddress);
        const ret = await module.exports.sendTransaction(coinName, tokenId, decimals, privateKey, address, toAddress, amount, options, false);
        
        const txHash = ret.txHash;
        const txHex = ret.txHex;

        if(!txHash || !txHex) {
            console.log('txHash or txHex not available.');
            return '';
        }
        const amountInLink = new BigNumber(amount).shiftedBy(18);
        const updatedCoinType = module.exports.getUpdatedCoinType(coinName, tokenId);
        if(updatedCoinType < 0) {
            console.log('updatedCoinType==', updatedCoinType);
            return '';
        }
        
        const addressInKanban = module.exports.fabToExgAddress(fabAddress);
        const originalMessage = module.exports.getOriginalMessage(updatedCoinType, module.exports.stripHexPrefix(txHash)
        , amountInLink, module.exports.stripHexPrefix(addressInKanban));
        //console.log('originalMessage===', originalMessage);
        const signedMessage = await module.exports.signedMessage(originalMessage, coinName, privateKey);
        const coinPoolAddress = await module.exports.getCoinPoolAddress();
        const abiData = module.exports.getDepositFuncABI(updatedCoinType, txHash, amountInLink, addressInKanban, signedMessage);

        const txKanbanHex = await module.exports.getExecSmartContractHexByData(fabPrivateKey, fabAddress, coinPoolAddress, abiData);

        const submited = await module.exports.submitDeposit(txHex, txKanbanHex);
        return submited;
        
    },

    getTransactionFee: async (coinName, tokenId, decimals, fromAddress, amount) => {
        const options = {
            getTransFeeOnly: true
        };
        const ret = await module.exports.sendTransaction(coinName, tokenId, decimals, null, fromAddress, fromAddress, amount, options, false);
        const transFee = ret.transFee;
        return transFee;
    },

    sendTransaction: async (coinName, tokenId, decimals, privateKey, fromAddress, toAddress, amount,
        options, doSubmit) => {

        let index = 0;
        let finished = false;
        let totalInput = 0;

        let gasPrice = 90;
        let gasLimit = 21000;
        if(tokenId) {
            gasLimit = 70000;
        }
        let satoshisPerBytes = 90;
        let bytesPerInput = 152;
        let feeLimit = 5;
        let txHex = '';
        let txHash = '';
        let errMsg = '';
        let transFee = 0;
        let tranFeeUnit = '';
        let txids = [];
        let amountInTx = new BigNumber(0);
        let getTransFeeOnly = false;
        if (options) {
            console.log('optionsoptionsoptions=', options);
            if (options.gasPrice) {
                gasPrice = options.gasPrice;
            }
            if (options.gasLimit) {
                gasLimit = options.gasLimit;
            }
            if (options.satoshisPerBytes) {
                satoshisPerBytes = options.satoshisPerBytes;
            }
            if (options.bytesPerInput) {
                bytesPerInput = options.bytesPerInput;
            }
            if (options.getTransFeeOnly) {
                getTransFeeOnly = options.getTransFeeOnly;
            }
            if(options.feeLimit) {
                feeLimit = options.feeLimit;
            }
        }
        console.log('satoshisPerBytes=', satoshisPerBytes);
        const receiveAddsIndexArr = [];
        const changeAddsIndexArr = [];


        let amountNum = new BigNumber(amount).shiftedBy(decimals);
        if(options && options.extraFee) {
            amountNum = amountNum.plus(new BigNumber(options.extraFee).shiftedBy(decimals));
        }
        // it's for all coins.
        amountNum = amountNum.plus((2 * 34) * satoshisPerBytes);

        if (!tokenId && ( ['BTC', 'FAB','LTC', 'DOGE', 'BCH'].indexOf(coinName) >= 0)) { // btc address format
            console.log('go here');
            if (coinName === 'BCH') {
                toAddress = bchaddr.toLegacyAddress(toAddress);
            }

            const BtcNetwork = module.exports.getNetwork(coinName);
            const txb = new Btc.TransactionBuilder(BtcNetwork);


            const address = fromAddress;
            const balanceFull = await module.exports.getUtxos(coinName, address);
            console.log('balanceFull====', balanceFull);
            for (let i = 0; i < balanceFull.length; i++) {
                const tx = balanceFull[i];
                if (tx.idx < 0) {
                    continue;
                }

                const txidItem = {
                    txid: tx.txid,
                    idx: tx.idx
                };

                let existed = false;
                for (let iii = 0; iii < txids.length; iii++) {
                    const ttt = txids[iii];
                    if ((ttt.txid === txidItem.txid) && (ttt.idx === txidItem.idx)) {
                        existed = true;
                        break;
                    }
                }

                if (existed) {
                    continue;
                }

                txids.push(txidItem);

                txb.addInput(tx.txid, tx.idx);
                amountNum = amountNum.minus(tx.value);
                amountNum = amountNum.plus(bytesPerInput * satoshisPerBytes);
                totalInput += tx.value;
                receiveAddsIndexArr.push(index);
                if (amountNum.isLessThanOrEqualTo(0)) {
                    finished = true;
                    break;
                }
            }


            if (!finished) {
                txHex = '';
                txHash = '';
                errMsg = 'not enough fund.';
                return { txHex: txHex, txHash: txHash, errMsg: errMsg, amountInTx: amountInTx, txids: txids };
            }

            let outputNum = 2;
            if (amount === 0) {
                outputNum = 1;
            }

            transFee = ((receiveAddsIndexArr.length + changeAddsIndexArr.length) * bytesPerInput + outputNum * 34 + 10) * satoshisPerBytes;

            // console.log('totalInput=' + totalInput);
            // console.log('amount=' + amount);
            // console.log('transFee=' + transFee);
            let output1 = Math.round(new BigNumber(totalInput - new BigNumber(amount).multipliedBy(new BigNumber(1e8)).toNumber() - transFee).toNumber());

            if(options && options.extraFee) {
                output1 = Math.round(output1 - new BigNumber(options.extraFee).shiftedBy(decimals).toNumber());
            }
            
            if (output1 < 2730) {
                transFee += output1;
            }
            transFee = new BigNumber(transFee).dividedBy(new BigNumber(1e8)).toNumber();

            if (getTransFeeOnly) {
                return { txHex: '', txHash: '', errMsg: '', transFee: transFee, amountInTx: amountInTx, txids: txids };
            }
            // const output2 = Math.round(new BigNumber(amount * 1e8).toNumber());

            const output2 = new BigNumber(amount).shiftedBy(8);
            amountInTx = output2;
            if (output1 >= 2730) {
                txb.addOutput(fromAddress, output1);
            }
            txb.addOutput(toAddress, output2.toNumber());
            for(let i = 0; i < toAddress.length; i++) {
                console.log(toAddress[i]);
            }

            for (index = 0; index < receiveAddsIndexArr.length; index++) {
                //const alice = Btc.ECPair.fromWIF(keyPair.privateKey, BtcNetwork);
                const alice = Btc.ECPair.fromPrivateKey(privateKey, { network: BtcNetwork })
                txb.sign(index, alice);
            }

            txHex = txb.build().toHex();
            // console.log('doSubmit=', doSubmit);
            if (doSubmit) {
                // console.log('1');
                const res = await module.exports.postTx(coinName, txHex);
                txHash = res.txHash;
                errMsg = res.errMsg;
                // console.log(txHash);

            } else {
                // console.log('2');
                const tx = Btc.Transaction.fromHex(txHex);
                txHash = tx.getId();
                // console.log(txHash);
            }
        } else
        if (coinName === 'ETH' && !tokenId) {
            console.log('mycoin.name==ETH');

            transFee = Number(new BigNumber(gasPrice).multipliedBy(new BigNumber(gasLimit)).dividedBy(new BigNumber(1e9)).toFixed(6));
            if (getTransFeeOnly) {
                return { 
                    txHex: '', txHash: '', errMsg: '', 
                    transFee: transFee, 
                    amountInTx: amountInTx, 
                    txids: txids 
                };
            };
                    // amountNum = amount * 1e18;
            amountNum = new BigNumber(amount).shiftedBy(18);
            const nonce = await module.exports.getEthNonce(fromAddress);
            console.log('nonce==', nonce);
            const gasPriceFinal = new BigNumber(gasPrice).shiftedBy(9).toNumber();

            amountInTx = amountNum;

            const txParams = {
                nonce: nonce,
                gasPrice: gasPriceFinal,
                gasLimit: gasLimit,
                to: toAddress,
                value: '0x' + amountNum.toString(16)
            };

            const tx = new EthereumTx(txParams, { 
                chain: secret.production ? 'mainnet' : 'ropsten', 
                hardfork: secret.production ? 'petersburg' : 'byzantium'
            });

            tx.sign(privateKey);
            const serializedTx = tx.serialize();

            txHex= '0x' + serializedTx.toString('hex');
            console.log('txHex==', txHex);
            if (doSubmit) {
                const retEth = await module.exports.postEthTx(txHex);
                console.log('retEth==', retEth);
                txHash = retEth.txHash;
                errMsg = retEth.errMsg;
                if (txHash.indexOf('txerError') >= 0) {
                    errMsg = txHash;
                    txHash = '';
                }
            } else {
                txHash = module.exports.getTransactionHash(txHex);
            }
        } else
        if (coinName === 'ETH' && tokenId) { // etheruem tokens
            transFee = new BigNumber(gasPrice).multipliedBy(new BigNumber(gasLimit)).dividedBy(new BigNumber(1e9)).toNumber();
            if (getTransFeeOnly) {
                return { txHex: '', txHash: '', errMsg: '', 
                    transFee: transFee, 
                            amountInTx: amountInTx, txids: txids 
                };
            }
            const nonce = await module.exports.getEthNonce(fromAddress);

            const amountSent = new BigNumber(amount).shiftedBy(decimals);

            const func = {
                'constant': false,
                'inputs': [
                    {
                        'name': 'recipient',
                        'type': 'address'
                    },
                    {
                        'name': 'amount',
                        'type': 'uint256'
                    }
                ],
                'name': 'transfer',
                'outputs': [
                    {
                        'name': '',
                        'type': 'bool'
                    }
                ],
                'payable': false,
                'stateMutability': 'nonpayable',
                'type': 'function'
            };

            const abiHex = module.exports.getFuncABI(func, [toAddress, '0x' + amountSent.toString(16)]);

            const gasPriceFinal = new BigNumber(gasPrice).shiftedBy(9).toNumber();

            amountInTx = amountSent;
            const txParams = {
                nonce: nonce,
                gasPrice: gasPriceFinal,
                gasLimit: gasLimit,
                from:  fromAddress,
                value: Number(0),
                to: tokenId,
                data: abiHex
            };
            console.log('txParams==', txParams);
            const tx = new EthereumTx(txParams, { 
                chain: secret.production ? 'mainnet' : 'ropsten', 
                hardfork: secret.production ? 'petersburg' : 'byzantium'
            });

            tx.sign(privateKey);
            const serializedTx = tx.serialize();

            txHex= '0x' + serializedTx.toString('hex');
            if (doSubmit) {
                const retEth = await module.exports.postEthTx(txHex);
                console.log('retEth====', retEth);
                txHash = retEth.txHash;
                errMsg = retEth.errMsg;

                if (txHash.indexOf('txerError') >= 0) {
                    errMsg = txHash;
                    txHash = '';
                }
            } else {
                txHash = module.exports.getTransactionHash(txHex);
            }
        } else
        if (coinName === 'FAB' && tokenId) { // fab tokens
            const amountSent = new BigNumber(amount).shiftedBy(decimals);

            const funcTransfer = {
                'constant': false,
                'inputs': [
                    {
                        'name': 'to',
                        'type': 'address'
                    },
                    {
                        'name': 'value',
                        'type': 'uint256'
                    }
                ],
                'name': 'transfer',
                'outputs': [
                    {
                        'name': '',
                        'type': 'bool'
                    }
                ],
                'payable': false,
                'stateMutability': 'nonpayable',
                'type': 'function'
            };

            amountInTx = amountSent;

            let fxnCallHex = module.exports.getFuncABI(funcTransfer, 
                [module.exports.fabToExgAddress(toAddress), '0x' + amountSent.toString(16)]);
            fxnCallHex = module.exports.stripHexPrefix(fxnCallHex);

            const contractAddress = module.exports.stripHexPrefix(tokenId);
            const totalAmount = gasLimit * gasPrice / 1e8;

            let totalFee = totalAmount;
            const contract = Btc.script.compile([
                84,
                module.exports.number2Buffer(gasLimit),
                module.exports.number2Buffer(gasPrice),
                module.exports.hex2Buffer(fxnCallHex),
                module.exports.hex2Buffer(contractAddress),
                194
            ]);

            const contractSize = contract.toJSON.toString().length;
            totalFee += module.exports.convertLiuToFabcoin(contractSize * 10);

            options.extraFee = totalFee;
            return await module.exports.sendTransaction('FAB', null, 8, privateKey, fromAddress, contract, 0, options, doSubmit);
        }
        else if (coinName == 'TRX') {
            
            if (getTransFeeOnly) {
                return { txHex: '', txHash: '', errMsg: '', 
                            transFee: feeLimit, 
                            amountInTx: 0, txids: '' };
            }            

            amountInTx = new BigNumber(amount).shiftedBy(decimals);
            const amountNum = '0x' + amountInTx.toString(16);

            //const tradeobj = await tronWeb.transactionBuilder.sendTrx(toAddress, amountNum, fromAddress);
            let tradeobj;
            if(!tokenId) {
                tradeobj = await tron.sendTrx(toAddress, amountNum, fromAddress);
            } else {
                tradeobj = await tron.transfer(tokenId, decimals, toAddress, amount, fromAddress, feeLimit);
                tradeobj = tradeobj.transaction;
            }
            
            //const txHexObj1 = await tronWeb.trx.sign(tradeobj, privateKey.toString('hex'));
            const txHexObj = await tron.signTransaction(privateKey, tradeobj);

            if (txHexObj) {
                if (doSubmit) {
                    //const receipt = await tronWeb.trx.sendRawTransaction(txHexObj);
                    const receipt = await tron.sendRawTransaction(txHexObj);
                    txHex = txHexObj.raw_data_hex;
                    txHash = receipt.transaction.txID;
                    errMsg = '';
                } else {
                    txHex = txHexObj.raw_data_hex;
                    txHash = txHexObj.txID;
            
                    const raw_dat_hex = txHexObj.raw_data_hex;
                    txHash = txHexObj.txID;
                    txHex = '0a' + (raw_dat_hex.length / 2).toString(16) + '01' + raw_dat_hex + '1241' + txHexObj.signature;
                                  
                }
            }
        } 

        /*
        else 
        if (tokenId && (coinName == 'TRX')) {
            
            if (getTransFeeOnly) {
                return { 
                    txHex: '', txHash: '', errMsg: '', 
                    transFee: feeLimit, 
                    amountInTx: 0, txids: '' 
                };
            };   
          
            const privateKeyDisp = privateKey.toString('hex');
            const tronWeb = new TronWeb(
                fullNode,
                solidityNode,
                eventServer,
                privateKeyDisp
            );
            
            amountInTx = new BigNumber(amount).shiftedBy(decimals);
            const amountNum = '0x' + amountInTx.toString(16);  
            const tokenFeeLimit = '0x' + new BigNumber(feeLimit).shiftedBy(6).toString(16);             
            try {
                const theContract = tronWeb.contract();
                console.log('theContract is ', theContract);
                let contract = await theContract.at(tokenId);
                            //Use call to execute a pure or view smart contract method.
                            // These methods do not modify the blockchain, do not cost anything to execute and are also not broadcasted to the network.
                if (doSubmit) {
            
                    txHash = await contract.transfer(
                        toAddress, //address _to
                        amountNum   //amount
                    ).send({
                        feeLimit: tokenFeeLimit
                    });
                } else {

                    const functionSelector = 'transfer(address,uint256)';
                    const options= {
                        feeLimit: tokenFeeLimit,
                        callValue: 0,
                        userFeePercentage: 100,
                        shouldPollResponse: false,
                        from: tronWeb.address.toHex(fromAddress)
                    };
                        
                    const parameters = [
                        {
                            type: 'address',
                            value: tronWeb.address.toHex(toAddress).replace(ADDRESS_PREFIX_REGEX, '0x')
                        },
                        { type: 'uint256', value: amountNum }
                    ];

                    const transactionBd = tronWeb.transactionBuilder;
                    const transaction = await transactionBd.triggerSmartContract(
                        tronWeb.address.toHex(tokenId),
                        functionSelector,
                        options, 
                        parameters,
                        tronWeb.address.toHex(fromAddress)
                    );
                    const txHexObj = await tronWeb.trx.sign(transaction.transaction, privateKey.toString('hex'));
                    const raw_dat_hex = txHexObj.raw_data_hex;
                    txHash = txHexObj.txID;
                    txHex = '0a' + (raw_dat_hex.length / 2).toString(16) + '01' + raw_dat_hex + '1241' + txHexObj.signature;

                }
                            
                            
            } catch(error) {
                console.error("trigger smart contract error",error)
            }            
        }
        */    

        const ret = { txHex: txHex, txHash: txHash, errMsg: errMsg, 
            transFee: transFee, tranFeeUnit: tranFeeUnit,
            amountInTx: amountInTx, txids: txids };
        console.log('ret there eeee=', ret);
        return ret;
    },
    getParents: async (address) => {
        const url = 'https://' + (secret.production ? 'api' : 'test') + '.blockchaingate.com/v2/' + '7star-ref/parents/' + address;

        let resp = '';
        try {
            const response = await axios.get(url);
            resp = response.data;

        }catch (err) {
        }


        return resp;
     },
  
     getAgents: async (address) => {
        const url = 'https://' + (secret.production ? 'api' : 'test') + '.blockchaingate.com/v2/' + '7star-agent/smartContractAdd/' + address;
        let resp = '';
        try {
            const response = await axios.get(url);
            resp = response.data;

        }catch (err) {
        }

        return resp;
     },

     getStoreStatus: async (address) => {
        let status = -1; 
        const store = await module.exports.getStore(address);
        if(store) {
            status = store.status;
        }
        return status;
     },

     getStore: async (address) => {
        const url = 'https://' + (secret.production ? 'api' : 'test') + '.blockchaingate.com/v2/' + 'stores/ownedBy/' + address;
        let resp = '';
        let store;
        try {
            const response = await axios.get(url);
            resp = response.data;
            if(resp.ok && resp._body && resp._body.length > 0) {
                store = resp._body[resp._body.length - 1];
            }
        }catch (err) {
        }

        return store;
     },

     getStoreById: async (id) => {
        const url = 'https://' + (secret.production ? 'api' : 'test') + '.blockchaingate.com/v2/' + 'stores/' + id;
        let resp = '';
        let store;
        try {
            const response = await axios.get(url);
            resp = response.data;
            if(resp.ok && resp._body) {
                store = resp._body;
            }
        }catch (err) {
        }

        return store;
     },

     getOrder: async (orderId) => {
        const url = 'https://' + (secret.production ? 'api' : 'test') + '.blockchaingate.com/v2/' + 'orders/public/' + orderId;
        console.log('url===', url);
        let resp = '';
        let order;
        try {
            const response = await axios.get(url);
            resp = response.data;
            if(resp.ok && resp._body) {
                order = resp._body;
            }
        }catch (err) {
        }

        return order;
     },
     refund: async (privateKey, feeChargerSmartContractAddress, orderId) => {
         console.log('privateKey=', privateKey);
         console.log('feeChargerSmartContractAddress=', feeChargerSmartContractAddress);
         console.log('orderId=', orderId);
        const keyPair = Btc.ECPair.fromPrivateKey(privateKey);
        const network = secret.production ? Btc.networks.bitcoin : Btc.networks.testnet;
        const { address } = Btc.payments.p2pkh({ pubkey: keyPair.publicKey, network });
        const abi = {
            "constant": false,
            "inputs": [
              {
                "name": "_orderID",
                "type": "bytes32"
              }
            ],
            "name": "refund",
            "outputs": [
              {
                "name": "",
                "type": "bool"
              }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        };
        const args = [
            orderId
        ];
        const ret = await module.exports.execSmartContract(privateKey, address, feeChargerSmartContractAddress, abi, args);
        return ret;
     },

     cancelRefundRequest: async (privateKey, feeChargerSmartContractAddress, orderId) => {
        const keyPair = Btc.ECPair.fromPrivateKey(privateKey);
        const network = secret.production ? Btc.networks.bitcoin : Btc.networks.testnet;
        const { address } = Btc.payments.p2pkh({ pubkey: keyPair.publicKey, network });
        const abi = {
            "constant": false,
            "inputs": [
              {
                "name": "_orderID",
                "type": "bytes32"
              }
            ],
            "name": "cancelRefundRequest",
            "outputs": [
              {
                "name": "",
                "type": "bool"
              }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
          };
        const args = [
            orderId
        ];
        const ret = await module.exports.execSmartContract(privateKey, address, feeChargerSmartContractAddress, abi, args);
        return ret;
     },

     requestRefund: async (privateKey, feeChargerSmartContractAddress, orderId) => {
        const keyPair = Btc.ECPair.fromPrivateKey(privateKey);
        const network = secret.production ? Btc.networks.bitcoin : Btc.networks.testnet;
        const { address } = Btc.payments.p2pkh({ pubkey: keyPair.publicKey, network });
        const abi = {
            "constant": false,
            "inputs": [
              {
                "name": "_orderID",
                "type": "bytes32"
              }
            ],
            "name": "requestRefund",
            "outputs": [
              {
                "name": "",
                "type": "bool"
              }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
          };
        const args = [
            orderId
        ];
        const ret = await module.exports.execSmartContract(privateKey, address, feeChargerSmartContractAddress, abi, args);
        return ret;
     },
     
     chargeFund: async (privateKey, feeChargerSmartContractAddress, orderId, coin, totalAmount, taxAmount) => {
         console.log('privateKey=', privateKey);
         console.log('feeChargerSmartContractAddress=', feeChargerSmartContractAddress);
         console.log('orderId=', orderId);
         console.log('coin=', coin);
         console.log('totalAmount=', totalAmount);
         console.log('taxAmount=', taxAmount);
        const keyPair = Btc.ECPair.fromPrivateKey(privateKey);

        const network = secret.production ? Btc.networks.bitcoin : Btc.networks.testnet;
        const { address } = Btc.payments.p2pkh({ pubkey: keyPair.publicKey,network });
        const coinType = module.exports.getCoinTypeIdByName(coin);
        const abi = {
            "constant": false,
            "inputs": [
              {
                "name": "_orderID",
                "type": "bytes32"
              },
              {
                "name": "_coinType",
                "type": "uint32"
              },
              {
                "name": "_totalAmount",
                "type": "uint256"
              },
              {
                "name": "_tax",
                "type": "uint256"
              },
              {
                "name": "_regionalAgents",
                "type": "address[]"
              },
              {
                "name": "_rewardBeneficiary",
                "type": "address[]"
              }
            ],
            "name": "chargeFundsWithFee",
            "outputs": [
              {
                "name": "",
                "type": "bool"
              }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
          };
        const regionalAgents = [];
        const parents = await module.exports.getParents(address);
        console.log('parents===', parents);
        if(!parents || parents.length == 0) {
            console.log('parents not available');
            return '';
        }
        const args = [
            orderId,
            coinType,
            '0x' + new BigNumber(totalAmount).shiftedBy(18).toString(16),
            '0x' + new BigNumber(taxAmount).shiftedBy(18).toString(16),
            regionalAgents,
            parents.map(item => module.exports.fabToExgAddress(item)),
        ];
        console.log('args===', args);
        const ret = await module.exports.execSmartContract(privateKey, address, feeChargerSmartContractAddress, abi, args);
        return ret;
    },

    hashKanbanMessage(data) {
        const web3 = new Web3();
        var messageHex = web3.utils.isHexStrict(data) ? data : web3.utils.utf8ToHex(data);
        var messageBytes = web3.utils.hexToBytes(messageHex);
        var messageBuffer = Buffer.from(messageBytes);
        var preamble = '\x17Kanban Signed Message:\n' + messageBytes.length;
        var preambleBuffer = Buffer.from(preamble);
        var ethMessage = Buffer.concat([preambleBuffer, messageBuffer]);
        var hash = Hash.keccak256s(ethMessage);    
        console.log('hash1=', hash);
        return hash;
    },
    
    signKanbanMessageWithPrivateKey: (message, privateKey) => {
        var hash = module.exports.hashKanbanMessage(message);
        return module.exports.signKanbanMessageHashWithPrivateKey(hash, privateKey);
    },
    
    signKanbanMessageHashWithPrivateKey(hash, privateKey) {
    
        const privateKeyHex = `0x${privateKey.toString('hex')}`;
        // 64 hex characters + hex-prefix
        if (privateKeyHex.length !== 66) {
            throw new Error("Private key must be 32 bytes long");
        }    
        var signature = Account.sign(hash, privateKeyHex);
        var vrs = Account.decodeSignature(signature);
        return {
            messageHash: hash,
            v: vrs[0],
            r: vrs[1],
            s: vrs[2],
            signature: signature
        };
    },


    signJsonData: (privateKey, data) => {

        var queryString = Object.keys(data).filter((k) => (data[k] != null) && (data[k] != undefined))
        .map(key => key + '=' + (typeof data[key] === 'string' ? data[key] : JSON.stringify(data[key]))).sort().join('&');

        const signature = module.exports.signKanbanMessageWithPrivateKey(queryString, privateKey);
        return signature;  
    },
    deleteStore: async (privateKey, storeId) => {
        const data = {
            id: storeId
          };
          const sig = module.exports.signJsonData(privateKey, data);
          data['sig'] = sig.signature;  
      
          const url = 'https://' + (secret.production ? 'api' : 'test') + '.blockchaingate.com/v2/' + 'stores/Delete';

          let resp = '';
          try {
              const response = await axios.post(url, data);
              resp = response.data;
  
          }catch (err) {
          }
          return resp;
    },
    updateStore: async (
        privateKey,
        id,
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
    ) => {
        const data = { };
        if(name || nameChinese) {
            data.name = {};
            if(name) {
                data.name.en = name;
            } 
            if(nameChinese) {
                data.name.sc = nameChinese;
            }
        }
        if(addr || addrChinese) {
            data.address = {};
            if(addr) {
                data.address.en = addr;
            } 
            if(addrChinese) {
                data.address.sc = addrChinese;
            }
        }
        if(contactName || contactNameChinese) {
            data.contactName = {};
            if(contactName) {
                data.contactName.en = contactName;
            } 
            if(contactNameChinese) {
                data.contactName.sc = contactNameChinese;
            }
        }
        if(phone) {
            data.phone = phone;
        }
        if(fax) {
            data.fax = fax;
        }
        if(email) {
            data.email = email;
        }
        if(website) {
            data.website = website;
        }
        if(openTime) {
            data.openTime = openTime;
        }
        if(closeTime) {
            data.closeTime = closeTime;
        }
        if(businessContents || businessContentsChinese) {
            data.businessContents = {};
            if(businessContents) {
                data.businessContents.en = businessContents;
            } 
            if(businessContentsChinese) {
                data.businessContents.sc = businessContentsChinese;
            }
        }
        if(giveAwayRate) {
            data.giveAwayRate = giveAwayRate;
        }
        if(taxRate) {
            data.taxRate = taxRate;
        }
        if(image) {
            data.image = image;
        }
        if(hideOnStore) {
            data.hideOnStore = hideOnStore;
        }
        if(coin) {
            data.coin = coin;
        }
        const sig = module.exports.signJsonData(privateKey, data);
        data['sig'] = sig.signature;  

        const url = 'https://' + (secret.production ? 'api' : 'test') + '.blockchaingate.com/v2/' + 'stores/Update/' + id;
        let resp = '';
        try {
            const response = await axios.post(url, data);
            resp = response.data;

        }catch (err) {
        }
        return resp;
    },
    createStore: async (
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
    ) => {
        const keyPair = Btc.ECPair.fromPrivateKey(privateKey);
        const network = secret.production ? Btc.networks.bitcoin : Btc.networks.testnet;
        const { address } = Btc.payments.p2pkh({ pubkey: keyPair.publicKey, network });
        const data = {
            name: {
              en: name,
              sc: nameChinese
            },
            address: {
              en: addr,
              sc: addrChinese
            },
            contactName: {
              en: contactName,
              sc: contactNameChinese
            },
            phone: phone,
            fax: fax,
            email: email,
            website: website,
            openTime: openTime,
            closeTime: closeTime,
            businessContents: {
              en: businessContents,
              sc: businessContentsChinese
            },
            coin: coin,
            giveAwayRate: giveAwayRate,
            taxRate: taxRate ? taxRate : 0,
            refAddress: refAddress,
            image: image,
            hideOnStore: hideOnStore,
            txhex: '',
            notify_url: notify_url
        }; 
          

        let args = [
          config.sevenStarProxy,
          config.feeDistribution,
          module.exports.fabToExgAddress(address),
          module.exports.fabToExgAddress(refAddress),
          100-giveAwayRate,
          '0x1'
        ];


        const txhex = await module.exports.getDeploySmartContractHex(privateKey, feeCharger.ABI, feeCharger.Bytecode, args);

        data.txhex = txhex;
        const url = 'https://' + (secret.production ? 'api' : 'test') + '.blockchaingate.com/v2/' + 'stores/Create2';

        let resp = '';
        try {
            const response = await axios.post(url, data);
            resp = response.data;

        }catch (err) {
        }


        return resp;
        /*
        if(resp2 && resp2.ok && resp2._body && resp2._body.status == '0x1') {
            const body = resp2._body;
      
            const txid = body.transactionHash;
            const receipt = await odule.exports.getKanbanTransactionReceipt(txid);
            if(receipt && receipt.transactionReceipt) {
                if(receipt.transactionReceipt.contractAddress) {
                  const feeChargerSmartContractAddress = receipt.transactionReceipt.contractAddress;
                }
            }
        }
        */
    },
    getWalletIdentity: (mnemonic) => {
        const seed = BIP39.mnemonicToSeedSync(mnemonic);
        let path = 'm/44\'/' + 1150 + '\'/0\'/' + 0 + '/' + 0;
    
        const network = module.exports.getNetwork('BTC');
        let root = BIP32.fromSeed(seed, network);
    
        let childNode = root.derivePath(path);
        const privateKey = childNode.privateKey;
    
        //var alice = Btc.ECPair.fromPrivateKey(privateKey, { network: network });
        const { address } = Btc.payments.p2pkh({
            pubkey: childNode.publicKey,
            network: network
        });

        path = 'm/44\'/' + (secret.production ? 0 : 1) + '\'/0\'/' + 0 + '/' + 0;
        childNode = root.derivePath(path);
        const privateKeyBTC = childNode.privateKey;
        let address2 = Btc.payments.p2pkh({
            pubkey: childNode.publicKey,
            network: network
        });
        const addressBTC = address2.address;



        path = 'm/44\'/' + 60 + '\'/0\'/' + 0 + '/' + 0;
        const rootETH = hdkey.fromMasterSeed(seed);
        const childNodeETH = rootETH.derivePath(path);

        const walletETH = childNodeETH.getWallet();
        const addressETH = `0x${walletETH.getAddress().toString('hex')}`;
        privateKeyETH = walletETH.getPrivateKey();

        
        path = 'm/44\'/' + 195 + '\'/0\'/' + 0 + '/' + 0;
        childNode = root.derivePath(path);
        const privateKeyTRX = childNode.privateKey;
        const addressTRX = 
        tron.getBase58CheckAddress(tron.getAddressFromPriKey(privateKeyTRX));


        const ltcNetwork = module.exports.getNetwork('LTC');
        path = 'm/44\'/' + (secret.production ? 2 : 1) + '\'/0\'/' + 0 + '/' + 0;
        childNode = root.derivePath(path);
        const privateKeyLTC = childNode.privateKey;
        address2 = Btc.payments.p2pkh({
            pubkey: childNode.publicKey,
            network: ltcNetwork
        });
        const addressLTC = address2.address;

        const dogeNetwork = module.exports.getNetwork('DOGE');
        path = 'm/44\'/' + (secret.production ? 3 : 1) + '\'/0\'/' + 0 + '/' + 0;
        childNode = root.derivePath(path);
        const privateKeyDOGE = childNode.privateKey;
        address2 = Btc.payments.p2pkh({
            pubkey: childNode.publicKey,
            network: dogeNetwork
        });
        const addressDOGE = address2.address;

        const bchNetwork = module.exports.getNetwork('BCH');
        path = 'm/44\'/' + (secret.production ? 145 : 1) + '\'/0\'/' + 0 + '/' + 0;
        childNode = root.derivePath(path);
        const privateKeyBCH = childNode.privateKey;
        address2 = Btc.payments.p2pkh({
            pubkey: childNode.publicKey,
            network: bchNetwork
        });

        const addressBCH = bchaddr.toCashAddress(address2.address);

        return {
            privateKey, address, 
            privateKeyBTC, addressBTC, 
            privateKeyETH, addressETH, 
            privateKeyTRX, addressTRX, 
            privateKeyLTC, addressLTC, 
            privateKeyDOGE, addressDOGE,
            privateKeyBCH, addressBCH
        };
        
    },

    get7StarBalance: async (address) => {
        const hexAddress = module.exports.fabToExgAddress(address);

        let url = 'https://kanban' + (secret.production ? 'prod' : 'test') + '.fabcoinapi.com/' + 'exchangily/getBalances/' + hexAddress;
        const promiseAll = [];
        promiseAll.push(axios.get(url));

        url = 'https://' + (secret.production ? 'api' : 'test') + '.blockchaingate.com/v2/' + '7star-locker/ownedBy/' + address + '/valid';
        promiseAll.push(axios.get(url));

        url = 'https://kanbanprod.fabcoinapi.com/usdvalues';
        promiseAll.push(axios.get(url));

        balances = {};
        realBalances = [];
        try {
            const response = await Promise.all(promiseAll);
            let balanceData = [];
            let lockBalanceData = [];
            let usdValues = {};
            if(response[0] && response[0].data) {
                balanceData = response[0].data;
            }
            if(response[1] && response[1].data && response[1].data.ok) {
                lockBalanceData = response[1].data._body;
            }

            if(response[2] && response[2].data && response[2].data.success) {
                usdValues = response[2].data.data;
            }            
            
            
            //console.log('balanceData===', balanceData);
            console.log('lockBalanceData===', lockBalanceData[0]);
            //console.log('usdValues===', usdValues);
            
            /*
            balances = balanceData.map(item => {
                return {
                    coin: item.coinType,
                    balance: new BigNumber(item.unlockedAmount).shiftedBy(-18).toNumber(),
                    lockBalanace: 0
                }
            });
            */

            for(let i = 0; i < balanceData.length; i++) {
                const item = balanceData[i];
                const coin = item.coinType;
                balances[coin] = {
                    balance: item.unlockedAmount,
                    lockedBalance: 0
                };
            }
            for(let i = 0; i < lockBalanceData.length; i++) {
                const item = lockBalanceData[i];
                const coinTypes = item.coinType;
                const amounts = item.amount;
                for(let j = 0; j < coinTypes.length; j++) {
                    const amount = amounts[j];
                    const coinType = coinTypes[j];
                    if(amount > 0) {
                        if(balances[coinType]) {
                            balances[coinType].lockedBalance = new BigNumber(amount).plus(balances[coinType].lockedBalance);
                        } else {
                            balances[coinType] = {
                                balance: 0,
                                lockedBalance: new BigNumber(amount)
                            };                            
                        }
                    }
                }
            }
            for (const [key, value] of Object.entries(balances)) {
                const coin = module.exports.getCoinNameByTypeId(key);
                const item = {
                    coin: coin,
                    balance: new BigNumber(value.balance).shiftedBy(-18).toNumber(),
                    lockedBalance: new BigNumber(value.lockedBalance).shiftedBy(-18).toNumber(),
                    USD: usdValues[coin] ? usdValues[coin]['USD'] : 0
                };
                realBalances.push(item);
            }

        }catch (err) {
        } 
        return realBalances;       
    },

    get7StarTransactions: async (address, pageSize, pageNum, dateCreated=null) => {

        let url = 'https://' + (secret.production ? 'api' : 'test') + '.blockchaingate.com/v2/' + '7star-charge-fund/' + address + '/' + pageSize + '/' + pageNum;
        if(dateCreated) {
            url += ('/' + dateCreated);
        }
        let transactions = {};

        try {
            const response = await axios.get(url);

            resp = response.data;
            
            if(resp && resp.ok) {
                transactions = resp._body;
            }

        }catch (err) {
        }

        return transactions;
    },

    
    getLockerDetails: async (address, pageSize, pageNum, dateCreated = null) => {
        let url = 'https://' + (secret.production ? 'api' : 'test') + '.blockchaingate.com/v2/' + '7star-locker/ownedBy/' + address + '/' + pageSize + '/' + pageNum;
        if(dateCreated) {
            url += '/' + dateCreated;
        }
        console.log('url===', url);

        let details = [];
        try {
            const response = await axios.get(url);

            resp = response.data;
            
            if(resp && resp.ok) {
                details = resp._body;
            }

        }catch (err) {
        }

        return details;

    },
    getGas: async (address) => {
        const hexAddress = module.exports.fabToExgAddress(address);
        const url = 'https://kanban' + (secret.production ? 'prod' : 'test') + '.fabcoinapi.com/' + 'kanban/getBalance/' + hexAddress;
        // console.log('path2=' + path);
        let gas = 0;

        try {
            const response = await axios.get(url);

            resp = response.data;
            /*
            const fab = this.utilServ.stripHexPrefix(ret.balance.FAB);
            gas = this.utilServ.hexToDec(fab) / 1e18;
            */
           gas = new BigNumber(resp.balance.FAB).shiftedBy(-18).toNumber();

        }catch (err) {
        }

        return gas;
    },

    redeposit: async (coinType, amount, transactionID, privateKey, address, signature) => {
        amount = new BigNumber(amount);
        const addressInKanban = module.exports.fabToExgAddress(address);
        const originalMessage = module.exports.getOriginalMessage(coinType, module.exports.stripHexPrefix(transactionID)
            , amount, module.exports.stripHexPrefix(addressInKanban));
        let coinName = module.exports.getCoinNameByTypeId(coinType);

        if(coinName == 'USDTX') {
            coinName = 'TRX';
        }
        //const signedMessage = await module.exports.signedMessage(originalMessage, coinName, privateKey); 
        const abiData = module.exports.getDepositFuncABI(coinType, transactionID, amount, addressInKanban, signature);

        const coinPoolAddress = await module.exports.getCoinPoolAddress();
        const txKanbanHex = await module.exports.getExecSmartContractHexByData(privateKey, address, coinPoolAddress, abiData);
        const res = await module.exports.submitRedeposit(txKanbanHex);
        console.log('res===', res);
        
    },
    submitRedeposit: async (rawKanbanTransaction) => {
        let resp = '';
        const data = {
            'rawKanbanTransaction': rawKanbanTransaction
        };

        // console.log('data for resubmitDeposit=', data);       
        const url = 'https://kanban' + (secret.production ? 'prod' : 'test') + '.fabcoinapi.com' + '/resubmitDeposit';
        try {
            const response = await axios.post(url, data);
            resp = response.data;

        }catch (err) {
            console.log('err in submitRedeposit===', err);
        }


        return resp;   
    },
    getRedepositList: async(address) => {
        /*
        Used to resolve identify nonce conflicts or similar errors in cross-chain deposits (due to the 2-phase submission process) for a given kanban address. We say that these deposits need to be confirmed, meaning that a new kanban transaction must be made (likely the same as before, but with a new nonce) to complete the deposit
        */
       let resp = '';
        const kanbanAddress = module.exports.fabToExgAddress(address);
        const url = 'https://kanban' + (secret.production ? 'prod' : 'test') + '.fabcoinapi.com' + '/depositerr/' + kanbanAddress;

        try {
            const response = await axios.get(url);
            resp = response.data;

        }catch (err) {
        }


        return resp;        
    },
    getExecSmartContractHexByData: async(privateKey, address, smartContractAddress, kanbanData, nonce = -1) => {
        //const keyPairsKanban = module.exports.getKeyPairs('FAB', seed, 0, 0, 'b');
        var gasPrice = KANBAN.gasPrice;
        var gasLimit = KANBAN.gasLimit;

        if(globalNonce.address) {
            globalNonce.address ++;
            nonce = globalNonce.address;
        } else {
            nonce = await module.exports.getTransactionCount(module.exports.fabToExgAddress(address));
            globalNonce.address = nonce;
        }
        
        let kanbanValue = 0;
    
        const txObject = {
            nonce: nonce,
            to: smartContractAddress,
            gasPrice: gasPrice,
            gasLimit: gasLimit,
            value: kanbanValue,
            data: '0x' + module.exports.stripHexPrefix(kanbanData)          
        };
    
        let txhex = '';
    
    
        const customCommon = Common.forCustomChain(
            ETH.chain, {
                name: KANBAN.chain.name,
                networkId: KANBAN.chain.networkId,
                chainId: KANBAN.chain.chainId
            },
            ETH.hardfork,
        );
    
        const tx = new service_1.default(txObject, { common: customCommon });

        tx.sign(privateKey);
        const serializedTx = tx.serialize();
        txhex = '0x' + serializedTx.toString('hex');     
        return txhex; 
    },
    getExecSmartContractHex: async(privateKey, address, smartContractAddress, abi, args, nonce = -1) => {
        const kanbanData = module.exports.getGeneralFunctionABI(abi, args);
        console.log('kanbanData===', kanbanData);
        return module.exports.getExecSmartContractHexByData(privateKey, address, smartContractAddress, kanbanData, nonce);
    },
    formCreateSmartContractABI: (abiArray, bytecode, args) => {

        const web3 = new Web3();
        var MyContract = new web3.eth.Contract(abiArray);
    
        const abi = MyContract.deploy({
            data: bytecode,
            arguments: args
        })
        .encodeABI();   
    
        return abi;
      },
      getDeploySmartContractHex: async (privateKey, abi, bytecode, args) => {
        let gasPrice = 40;
        let gasLimit = 8000000;

        const keyPair = Btc.ECPair.fromPrivateKey(privateKey);
        const network = secret.production ? Btc.networks.bitcoin : Btc.networks.testnet;
        const { address } = Btc.payments.p2pkh({ pubkey: keyPair.publicKey, network });

        const nonce = await module.exports.getTransactionCount(module.exports.fabToExgAddress(address));
    
        let kanbanValue = 0;
    
        const kanbanData = module.exports.formCreateSmartContractABI(abi, bytecode, args);
        const txObject = {
            nonce: nonce,
            gasPrice: gasPrice,
            gasLimit: gasLimit,
            value: kanbanValue,
            data: kanbanData          
        };
    

        
        let txhex = '';
    
    
        const customCommon = Common.forCustomChain(
            config.KANBAN.chain.name,
          {
            name: config.KANBAN.chain.name,
            networkId: config.KANBAN.chain.networkId,
            chainId: config.KANBAN.chain.chainId
          },
          config.KANBAN.chain.hardfork,
        );
        const tx = new service_1.default(txObject, { common: customCommon });
    
        tx.sign(privateKey);
        const serializedTx = tx.serialize();
        txhex = '0x' + serializedTx.toString('hex');
        return txhex;
      },
      deploySmartContract: async (privateKey, abi, bytecode, args) => {

        const txhex = await module.exports.getDeploySmartContractHex(privateKey, abi, bytecode, args);
        const res = await module.exports.sendRawSignedTransactionPromise(txhex);
        return res;
        //console.log('res==', res);
    },        


    execSmartContract: async (privateKey, address, smartContractAddress, abi, args, nonce = -1) => {

        const txhex = await module.exports.getExecSmartContractHex(privateKey, address, smartContractAddress, abi, args, nonce);
        const res = await module.exports.sendRawSignedTransactionPromise(txhex);
        return res;
      },

    sendRawSignedTransactionPromise: async (txhex) => {
        const data = {
            signedTransactionData: txhex
        };
        let resp = {
            transactionHash: null
        };
        
        const url = 'https://' + (secret.production ? 'api' : 'test') + '.blockchaingate.com/v2/' + 'kanban/sendRawTransaction';
        
        try {
            const response = await axios.post(url, data);
            resp = response.data;

        }catch (err) {
        }


        return resp;
    },

    reviseOrderId: (orderId) => {
        if(isNaN(orderId)) {

            if(!module.exports.isHex(orderId)) {
                return null;
            }
        } else {
            orderId = orderId.toString(16);
        }
    
        if(orderId.indexOf('0x') !== 0) {
            orderId = '0x' + orderId;
        }
        
        if(orderId.length > 66) {
            return null;
        } else {
            orderId = '0x' + module.exports.zeros(66 - orderId.length) + orderId.substring(2);
        }
        return orderId;
    },
    getCoinTypeIdByName: (name) => {
        console.log('name ===', name);
        name = name.toUpperCase();
        for (let i = 0; i < coin_list.length; i++) {
            const coin = coin_list[i];
            if (coin.name === name) {
                return coin.id;
            }
        }
        return -1;
    },  

    generateQrcodeByOrder: (orderId) => {
        const qrCodeData = 'i=' + orderId;
        return qrCodeData;
    },

    generateQrcodeByOrderTemplate: (orderTemplateId) => {
        const qrCodeData = 't=' + orderTemplateId;
        return qrCodeData;
    },

    create7StarPayOrderFromTemplate: async(orderTemplateId) => {
        let url = 'https://' + (secret.production ? 'api' : 'test') + '.blockchaingate.com/v2/' + 'orders/7starpay/createFromTemplate';
        const data = {
            id: orderTemplateId
         };
        let order;
        try {
            const response = await axios.post(url, data);

            resp = response.data;
            
            if(resp && resp.ok) {
                order = resp._body;
            }

        }catch (err) {
        }
        return order;
    },

    get7StarPayOrder: async(id, address) => {

        let url = 'https://' + (secret.production ? 'api' : 'test') + '.blockchaingate.com/v2/' + 'orders/' + id + '/7starpay';
        const data = {
            address
         };
        let order;
        try {
            const response = await axios.post(url, data);

            resp = response.data;
            
            if(resp && resp.ok) {
                order = resp._body;
            }

        }catch (err) {
        }
        return order;
    },

    payOrderTemplate: async (privateKey, address, orderTemplateId) => {
        const newOrder = await module.exports.create7StarPayOrderFromTemplate(orderTemplateId);
        if(newOrder) {
            return await module.exports.payOrder(privateKey, address, newOrder._id);
        }
    },

    payOrder: async (privateKey, address, orderId) => {
        const order = await module.exports.get7StarPayOrder(orderId, address);

        const abi = {
            "inputs": [
              {
                "internalType": "bytes32",
                "name": "_orderID",
                "type": "bytes32"
              },
              {
                "internalType": "uint32",
                "name": "_paidCoin",
                "type": "uint32"
              },
              {
                "internalType": "uint256",
                "name": "_totalAmount",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "_totalTax",
                "type": "uint256"
              },
              {
                "internalType": "address[]",
                "name": "_regionalAgents",
                "type": "address[]"
              },
              {
                "internalType": "bytes32[]",
                "name": "_rewardBeneficiary",
                "type": "bytes32[]"
              },
              {
                "internalType": "bytes",
                "name": "_rewardInfo",
                "type": "bytes"
              }
            ],
            "name": "chargeFundsWithFee",
            "outputs": [
              {
                "internalType": "bool",
                "name": "",
                "type": "bool"
              }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
          };
          const args = [
            '0x' + orderId,
            module.exports.getCoinTypeIdByName(order.currency),
            '0x' + new BigNumber(order.totalAmount).shiftedBy(18).toString(16),
            '0x' + new BigNumber(order.totalTax).shiftedBy(18).toString(16),
            order.regionalAgents,
            order.rewardBeneficiary,
            order.rewardInfo
          ];
          const to = order.feeChargerSmartContractAddress;
          const ret = await module.exports.execSmartContract(privateKey, address, to, abi, args);
          return ret;
    },


    payStore: async (privateKey, address, storeId, currency, amount, memo) => {
        const store = await module.exports.getStoreById(storeId);
        if(!store || store.status != 1) {
            return {
                ok: false,
                _body: 'Store is not existed or not approved'
              }
        }
        const giveAwayRate = store.giveAwayRate;
        const lockedDays = store.lockedDays;

        const body = {
            currency: currency,
            items: [
                {
                    title: memo, 
                    giveAwayRate: giveAwayRate, 
                    taxRate: 0, 
                    lockedDays: lockedDays, 
                    price: amount, 
                    quantity: 1
                }
            ],
            store: storeId,
            totalSale: amount,
            totalTax: 0
        };  
        const order = await module.exports.createOrder(body);
        return module.exports.payOrder(privateKey, address, order._id);
    },

    generateQrcodeByStore: (storeId) => {
        const qrCodeData = 's=' + storeId;
        return qrCodeData;
    },

    generateQrcode:(feeChargerSmartContractAddress, orderId, coin, totalAmount, taxAmount) => {
        let func = {
            "constant": false,
            "inputs": [
              {
                "name": "_orderID",
                "type": "bytes32"
              },
              {
                "name": "_coinType",
                "type": "uint32"
              },
              {
                "name": "_totalAmount",
                "type": "uint256"
              },
              {
                "name": "_tax",
                "type": "uint256"
              },
              {
                "name": "_regionalAgents",
                "type": "address[]"
              },
              {
                "name": "_rewardBeneficiary",
                "type": "address[]"
              }
            ],
            "name": "chargeFundsWithFee",
            "outputs": [
              {
                "name": "",
                "type": "bool"
              }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
          };

          let args = [
            orderId, 
            module.exports.getCoinTypeIdByName(coin), 
            '0x' + new BigNumber(totalAmount).shiftedBy(18).toString(16),
            '0x' + new BigNumber(taxAmount).shiftedBy(18).toString(16),
            [],
            []
          ];
          

          const data = module.exports.getFuncABI(func, args);
          const tx = {
            to: feeChargerSmartContractAddress,
            data: data
          };
          const qrCodeData = JSON.stringify(tx);
          return qrCodeData;
    },

    chargeFundFromQrcode:async (privateKey, qrcodeString) => {
        const keyPair = Btc.ECPair.fromPrivateKey(privateKey);

        const network = secret.production ? Btc.networks.bitcoin : Btc.networks.testnet;
        const { address } = Btc.payments.p2pkh({ pubkey: keyPair.publicKey,network });

        const tx = JSON.parse(qrcodeString);
        const feeChargerSmartContractAddress = tx.to;
        const data = tx.data;
        const args = module.exports.decodeParameters(['bytes32', 'uint32', 'uint256','uint256', 'address[]', 'address[]'], data.substring(10));
        
        const abi = {
            "constant": false,
            "inputs": [
              {
                "name": "_orderID",
                "type": "bytes32"
              },
              {
                "name": "_coinType",
                "type": "uint32"
              },
              {
                "name": "_totalAmount",
                "type": "uint256"
              },
              {
                "name": "_tax",
                "type": "uint256"
              },
              {
                "name": "_regionalAgents",
                "type": "address[]"
              },
              {
                "name": "_rewardBeneficiary",
                "type": "address[]"
              }
            ],
            "name": "chargeFundsWithFee",
            "outputs": [
              {
                "name": "",
                "type": "bool"
              }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        };

        const parents = await module.exports.getParents(address);
        if(!parents || parents.length == 0) {
            console.log('parents not available');
            return '';
        }
        const newArgs = [
            args[0], 
            args[1],
            args[2],
            args[3],
            args[4],
            parents.map(item => module.exports.fabToExgAddress(item))
        ];
        console.log('newArgs====', newArgs);
        const ret = await module.exports.execSmartContract(privateKey, address, feeChargerSmartContractAddress, abi, newArgs);
        return ret;
    },

    getMerchantBySmartContractAddress: async (feeChargerSmartContractAddress) => {
        const url = 'https://' + (secret.production ? 'api' : 'test') + '.blockchaingate.com/v2/' + 'stores/feeChargerSmartContractAddress/' + feeChargerSmartContractAddress;
        console.log('url===', url);
        let resp = '';
        try {
            const response = await axios.get(url);
            resp = response.data;
        }catch (err) {
        }
        return resp;

    },
    getCoinNameByTypeId: (typeId) => {
        for (let i = 0; i < coin_list.length; i++) {
            const coin = coin_list[i];
            if (coin.id == typeId) {
                return coin.name;
            }
        }
        return '';
    },

    getSevenStarKeyNodeSmartContractAddress: () => {
        return secret.production ? '0x99013cf2e650ab80c0852288445cdf4d18f5f2d4' : '0x294b2befc6f725d941917aee5b4022e8165eb540';
    },
    getSevenStarCustomerReferralSmartContractAddress: () => {
        return secret.production ? '' : '0x6864ac918b94976e175001468aa45733b142fa49';
    },
    isHex: (hex) => {
        if(hex.indexOf('0x') !== 0) {
            hex = '0x' + hex;
        }
        return typeof hex === 'string'
            && !isNaN(Number(hex))
    },
    isValidInKeyNode: async (address) => {
        const to = module.exports.getSevenStarKeyNodeSmartContractAddress();
        const abihex = module.exports.getGeneralFunctionABI(
            {
                "constant": true,
                "inputs": [
                  {
                    "name": "_walletAddr",
                    "type": "address"
                  }
                ],
                "name": "checkValidity",
                "outputs": [
                  {
                    "name": "",
                    "type": "bool"
                  }
                ],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            },
            [address]
        );
        const resp = await module.exports.kanbanCall(to, abihex);
        const data = resp.data;
        const isValid = (parseInt(data, 16) == 1);
        return isValid;
    },
 
    isValidInCustomerReferral: async (address) => {
        const to = module.exports.getSevenStarCustomerReferralSmartContractAddress();
        const abihex = module.exports.getGeneralFunctionABI(
            {
                "constant": true,
                "inputs": [
                  {
                    "name": "_walletAddr",
                    "type": "address"
                  }
                ],
                "name": "getCustomerReferral",
                "outputs": [
                  {
                    "name": "",
                    "type": "address"
                  }
                ],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
              },
            [address]
        );
        const resp = await module.exports.kanbanCall(to, abihex);
        const data = resp.data;
        console.log('data ===', data);
        const isValid = (data != null) && (data != undefined) && (data != '0x0000000000000000000000000000000000000000000000000000000000000000');
        return isValid;
    },    

    createOrder: async (body) => {
        let order;
        const url = 'https://' + (secret.production ? 'api' : 'test') + '.blockchaingate.com/v2/' + 'orders/7starpay/create';
        console.log('url====', url);
        try {
            const response = await axios.post(url, body);

            resp = response.data;
            if(resp && resp.ok) {
                order = resp._body;
            }
        }catch (err) {
        }
        return order; 
    },

    createOrderTemplate: async (body) => {
        let order;
        const url = 'https://' + (secret.production ? 'api' : 'test') + '.blockchaingate.com/v2/' + 'order-templates/7starpay/create';
        console.log('url====', url);
        try {
            const response = await axios.post(url, body);

            resp = response.data;
            if(resp && resp.ok) {
                order = resp._body;
            }
        }catch (err) {
        }
        return order; 
    },

    isValidMember: async(address) => {
        const url = 'https://' + (secret.production ? 'api' : 'test') + '.blockchaingate.com/v2/' + '7star-ref/isValidMember/' + address;
        console.log('url====', url);
        try {
            const response = await axios.get(url);

            resp = response.data;

        }catch (err) {
        }
        return resp;
    },
    get7StarInfo:  async(address) => {
        const url = 'https://' + (secret.production ? 'api' : 'test') + '.blockchaingate.com/v2/' + '7star-ref/' + address;
        try {
            const response = await axios.get(url);

            resp = response.data;

        }catch (err) {
        }
        return resp;
    },

    kanbanCall: async (to, abihex) => {
        const data = {
            transactionOptions: {
                to,
                data: abihex
            }
        };

        let resp = {
            data: null
        };
        
        const url = 'https://kanban' + (secret.production ? 'prod' : 'test') + '.fabcoinapi.com/' + 'kanban/call';

        try {
            const response = await axios.post(url, data);

            resp = response.data;

        }catch (err) {
        }


        return resp;
    }, 

    decodeParameter: (type, hexString) => {
        const web3 = new Web3();
        return web3.eth.abi.decodeParameter(type, hexString);
    },

    decodeParameters: (typeArray, hexString) => {

        const web3 = new Web3();
        const data = web3.eth.abi.decodeParameters(typeArray, hexString);
        return data;
    },

    sha3: (func) => {
        const web3 = new Web3();
        const sha3Hash = web3.utils.sha3(func);
        return sha3Hash;
    },

    getGeneralFunctionABI: (func, paramsArray) => {
        let web3 = new Web3();
        const abiHex = web3.eth.abi.encodeFunctionCall(func, paramsArray);
        return abiHex;
    },

    stripHexPrefix: (str) => {
        if (str && (str.length > 2) && (str[0] === '0') && (str[1] === 'x')) {
            return str.slice(2);
        }
        return str;
    },

    convertLiuToFabcoin: (amount) => {

        return Number(Number(amount * 1e-8).toFixed(8));
    },

    number2Buffer: (num) => {
        const buffer = [];
        const neg = (num < 0);
        num = Math.abs(num);
        while (num) {
            buffer[buffer.length] = num & 0xff;
            num = num >> 8;
        }

        var top = buffer[buffer.length - 1];
        if (top & 0x80) {
            buffer[buffer.length] = neg ? 0x80 : 0x00;
        } else if (neg) {
            buffer[buffer.length - 1] = top | 0x80;
        }
        return Buffer.from(buffer);
    },

    hex2Buffer: (hexString) => {
        var buffer = [];
        for (var i = 0; i < hexString.length; i += 2) {
            buffer[buffer.length] = (parseInt(hexString[i], 16) << 4) | parseInt(hexString[i + 1], 16);
        }
        return Buffer.from(buffer);
    },

    toBigNumber: (amount, decimal) => {
        if (amount == 0 || amount == '0') {
            return '0';
        }
        if (amount.toString().indexOf('e') >= 0) {
            const num = new BigNumber(amount).multipliedBy(new BigNumber(Math.pow(10, decimal))).toFixed();
            return num.split('.')[0];
        }
        const amountStr = amount.toString();
        const amountArr = amountStr.split('.');
        const amountPart1 = amountArr[0];
        const numPart1 = Number(amountPart1);
        let amountPart2 = '';
        if (amountArr[1]) {
            amountPart2 = amountArr[1].substring(0, decimal);
        }

        const amountPart2Length = amountPart2.length;
        if (decimal > amountPart2Length) {
            for (let i = 0; i < decimal - amountPart2Length; i++) {
                amountPart2 += '0';
            }
        }

        let amountStrFull = (numPart1 ? amountPart1 : '') + amountPart2;
        amountStrFull = amountStrFull.replace(/^0+/, '');
        return amountStrFull;
    },

    zeros: (length) => {
        let str = '';
        for(let i = 0; i < length; i++) {
          str += '0';
        }
        return str;
    },
    
    getCoinPoolAddress: async() => {
        let path = 'exchangily/getCoinPoolAddress';
        const url = 'https://kanban' + (secret.production ? 'prod' : 'test') + '.fabcoinapi.com/' + path;

        let addr = '';
        try {
            const response = await axios.get(url);
            addr = response.data;

            console.log('addr==', addr);
        } catch (e) {}

        return addr;
    },
    hexToAscii: (hex) => {
        let web3 = new Web3();
        return web3.utils.hexToAscii(hex);
    },

    fromAscii: (str) => {
        let web3 = new Web3();
        return web3.utils.fromAscii(str);
    },
    toUtf8Bytes: (str) => {
        //let web3 = new Web3();
        const bytes = Buffer.from(str, 'hex');
        return bytes;
    },
    getExchangePrice: async(coinName) => {
        let path = 'exchangily/price/' + coinName + 'USDT';
        const url = 'https://kanbanprod.fabcoinapi.com/' + path;

        let price = '';
        try {
            const response = await axios.get(url);
            price = response.data;

            console.log('price==', price);
        } catch (e) {}

        return price;
    },

    getCoinPrice: async(coin) => {
        const url = 'https://kanbanprod.fabcoinapi.com/exchangily/price/' + coin + 'USDT';
        console.log('url=', url);
        let price = 0;
        try {
            const response = await axios.get(url);
            price = response.data;

        } catch (e) {}

        console.log('price=', price);
        return price;        
    },
    getLightningRemitAddress: (address) => {
        return exaddr.toKbpayAddress(address);
    },
    getLightningRemitTransactions: async (address, pageSize, pageNum, dateCreated) => {
        const data = { 
            fabAddress: address,
            pageSize, 
            pageNum,
            timestamp: 0,
            dateCreated: null
        };

        if(dateCreated) {
            data.dateCreated = dateCreated;
        }
        let transactions = [];
        let url = 'https://kanban' + (secret.production ? 'prod' : 'test') + '.fabcoinapi.com/' + 'getTransferHistoryEvents';
        try {
            const response = await axios.post(url, data);
            const json = response.data;

            if (json && json.success && json.data) {
                transactions = json.data;
            }
            
        }catch (err) {
        }

        return transactions;

    },
    lightningRemit: async (privateKey, address, toLightningRemitAddress, tokenName, amount) => {
        const kanbanAddress = module.exports.fabToExgAddress(exaddr.toLegacyAddress(toLightningRemitAddress));
        const coinTypeId = module.exports.getCoinTypeIdByName(tokenName);
        
        const params = [kanbanAddress, coinTypeId, '0x' + new BigNumber(amount).shiftedBy(18).toString(16), '0x0'];

        const func = {
          'constant': false,
          'inputs': [
            {
              'name': '_to',
              'type': 'address'
            },
            {
              'name': '_coinType',
              'type': 'uint32'
            },
            {
              'name': '_value',
              'type': 'uint256'
            },
            {
              "name": "_comment",
              "type": "bytes32"
            }
          ],
          'name': 'transfer',
          'outputs': [
            {
              'name': 'success',
              'type': 'bool'
            }
          ],
          'payable': false,
          'stateMutability': 'nonpayable',
          'type': 'function'
        };
        const smartContractAddress = await module.exports.getCoinPoolAddress();
        return await module.exports.execSmartContract(privateKey, address, smartContractAddress, func, params);
    },
    getKanbanLatestBlock: async() => {
        const url = 'https://kanban' + (secret.production ? 'prod' : 'test') + '.fabcoinapi.com/' + 'kanban/explorer/getlatestblocks/1';
        let blockNumber = 0;
        try {
            const response = await axios.get(url);
            const data = response.data;

            if (data && data.length > 0) {
                blockNumber = data[0].number;
            }
        } catch (err) {
            return blockNumber;
        }
        return blockNumber;
    },

    getTradesbypair: async(pair, startBlock, endBlock) => {
        const url = 'https://kanban' + (secret.production ? 'prod' : 'test') + '.fabcoinapi.com/' + 'tradesbypairbetweenblocks/' +
            pair + '/' + startBlock + '/' + endBlock;
        let trades = [];
        try {
            const response = await axios.get(url);
            trades = response.data;

        } catch (err) {
            return trades;
        }
        return trades;
    },

    
    getFabUtxos: async(address) => {
            const url = 'https://fab' + (secret.production ? 'prod' : 'test') + '.fabcoinapi.com/' + 'getutxos/' + address;
            try {
                const response = await axios.get(url);
                const data = response.data;
                if (data != 'null') {
                    return data;
                }
                return [];
            } catch (err) {
                console.log('err in getFabUtxos');
                return [];
            }
    },
    

    getExgPrice: async() => {
        const url = 'https://kanban' + (secret.production ? 'prod' : 'test') + '.fabcoinapi.com/' + 'getexgprice';
        // console.log('url==', url);
        try {
            const response = await axios.get(url);
            const res = response.data;
            // console.log('res==', res);
            if (res && res.success) {

                return res.data.USD;
            }
            return 0;
        } catch (err) {
            console.log('err in getFabUtxos');
            return 0;
        }
    },

    getFabTransationStatus: async (txid) => {
        txid = module.exports.stripHexPrefix(txid);
        const url = 'https://fab' + (secret.production ? 'prod' : 'test') + '.fabcoinapi.com/' + 'gettransactionjson/' + txid;
        try {
            const response = await axios.get(url);
            const data = response.data;
            if (data && (data.confirmations)) {
                if (data.confirmations > 0) {
                    return true;
                }
                return false;
            }
            return false;
        } catch (err) {
            console.log(err);
            return false;
        }
    },

    getKanbanTransactionStatus: async(txid) => {
        let status = '';
        try {
            const url = 'https://kanban' + (secret.production ? 'prod' : 'test') + '.fabcoinapi.com/' + 'kanban/gettransactionreceipt/' + txid;
            try {
                const response = await axios.get(url);
                const data = response.data;
                if (data && (data.transactionReceipt)) {
                    status = data.transactionReceipt.status;
                    
                    /*
                    if (data.transactionReceipt.status == '0x0') {
                        return false;
                    }
                    return true;
                    */
                }
            } catch (err) {
                //console.log(err);
                //return true;
            }
        } catch(e) {

        }
        return status;

    },
    getKanbanTransactionReceipt: async(txid) => {
        try {
            const url = 'https://kanban' + (secret.production ? 'prod' : 'test') + '.fabcoinapi.com/' + 'kanban/gettransactionreceipt/' + txid;
            try {
                const response = await axios.get(url);
                const data = response.data;
                if (data && (data.transactionReceipt)) {
                    return data.transactionReceipt;
                }
                return null;
            } catch (err) {
                console.log('err in getKanbanTransactionReceipt');
                console.log(err);
                return null;
            }
        } catch(e) {

        }
        return null;
    },
    getTransactionCount: async(address) => {
        //return this.getNonce(address);
        /*
        if(globalNonce.address) {
            globalNonce.address ++;
            return globalNonce.address;
        }
        */
        const url = 'https://kanban' + (secret.production ? 'prod' : 'test') + '.fabcoinapi.com/' + 'kanban/getTransactionCount/' + address;
        // console.log('url=', url);
        try {
            const response = await axios.get(url);
            const nonce = response.data.transactionCount;
            //globalNonce.address = nonce;
            return nonce;
        } catch (err) {
            //console.log('err in getTransactionCount');
            return 0;
        }

    },

    hasOutboundEXGTransaction: async(address) => {
        let hasOutbound = false;
        const url = 'https://kanban' + (secret.production ? 'prod' : 'test') + '.fabcoinapi.com/' + 'getExgBalanceHistory/' + address;
        try {
            const response = await axios.get(url);
            const res = response.data;
            if (res.success) {
                const data = res.data;
                for (let i = 0; i < data.length; i++) {
                    const item = data[i];
                    if (item.from == address && item.amount) {
                        hasOutbound = true;
                        break;
                    }
                }
            }
            return hasOutbound;
        } catch (err) {
            console.log('err in hasOutboundEXGTransaction');
            return false;
        }
    },

    getFabTransactionHexMultiTos: async (privateKey, fromAddress, tos, extraTransactionFee, 
        satoshisPerBytes, bytesPerInput) => {
        let index = 0;
        let balance = 0;
        let finished = false;
        let address = '';
        let totalInput = 0;
        let transFee = 0;
        let amountInTx = new BigNumber(0);
        const feePerInput = bytesPerInput * satoshisPerBytes;
        const receiveAddsIndexArr = [];
        const changeAddsIndexArr = [];
        // console.log('amount111111111111=', amount);
        // console.log('extraTransactionFee=', extraTransactionFee);
        let amount = 0;
        tos.forEach(to => {
            amount += Number(to.amount);
        });
        const totalAmount = Number(amount) + Number(extraTransactionFee);
        console.log('totalAmount=', totalAmount);
        //let amountNum = new BigNumber(this.utilServ.toBigNumber(totalAmount, 8)).toNumber();
    
        let amountNum = totalAmount * 1e8;
        // console.log('amountNum=', amountNum);
        amountNum += ((tos.length + 1) * 34) * satoshisPerBytes;
        // console.log('amountNum=', amountNum);
        // const TestNet = Btc.networks.testnet;
        const network = secret.production ? Btc.networks.bitcoin : Btc.networks.testnet;
    
        const txb = new Btc.TransactionBuilder(network);
        // console.log('amountNum=', amountNum);
        let txHex = '';
    
        const fabUtxos = await module.exports.getFabUtxos(fromAddress);
    
        console.log('fabUtxos==', fabUtxos);
        if (fabUtxos && fabUtxos.length) {
            // console.log('fabUtxos=', fabUtxos);
            // console.log('fabUtxos.length=', fabUtxos.length);
            for (let i = 0; i < fabUtxos.length; i++) {

                console.log('i=', i);
                const utxo = fabUtxos[i];
                const idx = utxo.idx;
    
                const txidItem = {
                    txid: utxo.txid,
                    idx: idx
                };
    
    
                let existed = false;
                for(let iii = 0; iii < txids.length; iii++) {
                    const ttt = txids[iii];
                    if((ttt.txid == txidItem.txid) && (ttt.idx == txidItem.idx)) {
                        existed = true;
                        console.log('existed');
                        break;
                    }
                }
    
                if(existed) {
                    continue;
                }
    
                console.log('push one');
                txids.push(txidItem);
    
                txb.addInput(utxo.txid, idx);
                // console.log('input is');
                // console.log(utxo.txid, utxo.idx, utxo.value);
                receiveAddsIndexArr.push(index);
                totalInput += utxo.value;
                // console.log('totalInput here=', totalInput);
                amountNum -= utxo.value;
                amountNum += feePerInput;
                console.log('amountNum=', amountNum);
                if (amountNum <= 0) {
                    console.log('finished');
                    finished = true;
                    break;
                }                 
            }    
        }
       
        // console.log('totalInput here 2=', totalInput);
        if (!finished) {
            // console.log('not enough fab coin to make the transaction.');
            return {txHex: '', errMsg: 'not enough fab coin to make the transaction.', transFee: 0, txids: txids};
        }
    
    
        const changeAddress = fromAddress;
    
        let outputNum = (tos.length + 1);
    
        transFee = ((receiveAddsIndexArr.length + changeAddsIndexArr.length) * bytesPerInput + outputNum * 34) * satoshisPerBytes;
    
        const output1 = Math.round(totalInput
        - (amount + extraTransactionFee) * 1e8
        - transFee);
           
        //const output2 = Math.round(amount * 1e8);    

        if (output1 < 0) {
            // console.log('output1 or output2 should be greater than 0.');
            return {txHex: '', 
            errMsg: 'output1 should be greater than 0.' + totalInput + ',' + amount + ',' + transFee + ',' + output1, 
            transFee: 0, amountInTx: amountInTx, txids: txids};
        }
    
    
        txb.addOutput(changeAddress, output1);
        tos.forEach(to => {
            const output2 = to.amount * 1e8;
            amountInTx = output2;
            txb.addOutput(to.address, output2);
        });

        for (index = 0; index < receiveAddsIndexArr.length; index ++) {
            const alice = Btc.ECPair.fromPrivateKey(privateKey, { network: network });
            txb.sign(index, alice);                
        }
           
        txHex = txb.build().toHex();
        return {txHex: txHex, errMsg: '', transFee: transFee, amountInTx: amountInTx, txids: txids};
    },

    getFabTransactionHex: async (privateKey, fromAddress, to, amount, extraTransactionFee, 
        satoshisPerBytes, bytesPerInput) => {
        let index = 0;
        let balance = 0;
        let finished = false;
        let address = '';
        let totalInput = 0;
        let transFee = 0;
        let amountInTx = new BigNumber(0);
        const feePerInput = bytesPerInput * satoshisPerBytes;
        const receiveAddsIndexArr = [];
        const changeAddsIndexArr = [];
        // console.log('amount111111111111=', amount);
        // console.log('extraTransactionFee=', extraTransactionFee);
        const totalAmount = Number(amount) + Number(extraTransactionFee);
        // console.log('totalAmount=', totalAmount);
        //let amountNum = new BigNumber(this.utilServ.toBigNumber(totalAmount, 8)).toNumber();
    
        let amountNum = totalAmount * 1e8;
        // console.log('amountNum=', amountNum);
        amountNum += (2 * 34) * satoshisPerBytes;
        // console.log('amountNum=', amountNum);
        // const TestNet = Btc.networks.testnet;
        const network = secret.production ? Btc.networks.bitcoin : Btc.networks.testnet;
    
        const txb = new Btc.TransactionBuilder(network);
        // console.log('amountNum=', amountNum);
        let txHex = '';
    
        const fabUtxos = await module.exports.getFabUtxos(fromAddress);
    
        if (fabUtxos && fabUtxos.length) {
            // console.log('fabUtxos=', fabUtxos);
            // console.log('fabUtxos.length=', fabUtxos.length);
            for (let i = 0; i < fabUtxos.length; i++) {
                const utxo = fabUtxos[i];
                const idx = utxo.idx;
    
                const txidItem = {
                    txid: utxo.txid,
                    idx: idx
                };
    
    
                let existed = false;
                for(let iii = 0; iii < txids.length; iii++) {
                    const ttt = txids[iii];
                    if((ttt.txid == txidItem.txid) && (ttt.idx == txidItem.idx)) {
                        existed = true;
                        break;
                    }
                }
    
                if(existed) {
                    continue;
                }
    
                txids.push(txidItem);
    
                txb.addInput(utxo.txid, idx);
                // console.log('input is');
                // console.log(utxo.txid, utxo.idx, utxo.value);
                receiveAddsIndexArr.push(index);
                totalInput += utxo.value;
                // console.log('totalInput here=', totalInput);
                amountNum -= utxo.value;
                amountNum += feePerInput;
                if (amountNum <= 0) {
                    console.log('finished');
                    finished = true;
                    break;
                }                 
            }    
        }
       
        // console.log('totalInput here 2=', totalInput);
        if (!finished) {
            // console.log('not enough fab coin to make the transaction.');
            return {txHex: '', errMsg: 'not enough fab coin to make the transaction.', transFee: 0, txids: txids};
        }
    
    
        const changeAddress = fromAddress;
    
        let outputNum = 2;
    
        transFee = ((receiveAddsIndexArr.length + changeAddsIndexArr.length) * bytesPerInput + outputNum * 34) * satoshisPerBytes;
    
        const output1 = Math.round(totalInput
        - (amount + extraTransactionFee) * 1e8
        - transFee);
           
        //const output2 = Math.round(amount * 1e8);    
        const output2 = amount * 1e8;
        amountInTx = output2;
        if (output1 < 0) {
            // console.log('output1 or output2 should be greater than 0.');
            return {txHex: '', 
            errMsg: 'output1 should be greater than 0.' + totalInput + ',' + amount + ',' + transFee + ',' + output1, 
            transFee: 0, amountInTx: amountInTx, txids: txids};
        }
    
    
        txb.addOutput(changeAddress, output1);
        txb.addOutput(to, output2);
    
    
    
        for (index = 0; index < receiveAddsIndexArr.length; index ++) {
            const alice = Btc.ECPair.fromPrivateKey(privateKey, { network: network });
            txb.sign(index, alice);                
        }
           
        txHex = txb.build().toHex();
        return {txHex: txHex, errMsg: '', transFee: transFee, amountInTx: amountInTx, txids: txids};
    },

    generateFabContract: (contractAddress, toAddress, amount) => {
        const gasPrice = 40;
        const gasLimit = 800000;
        const amountSent = module.exports.toBigNumber(amount, 18);
        // const abiHex = this.web3Serv.getFabTransferABI([toAddress, amountSent.toString()]);

        const funcTransfer = {
            'constant': false,
            'inputs': [
                {
                    'name': 'to',
                    'type': 'address'
                },
                {
                    'name': 'value',
                    'type': 'uint256'
                }
            ],
            'name': 'transfer',
            'outputs': [
                {
                    'name': '',
                    'type': 'bool'
                }
            ],
            'payable': false,
            'stateMutability': 'nonpayable',
            'type': 'function'
        };
        // console.log('foreeeee');
        amountInTx = new BigNumber(amountSent);
        toAddress = module.exports.fabToExgAddress(toAddress);
        let fxnCallHex = module.exports.getGeneralFunctionABI(funcTransfer, [toAddress, amountSent]);
        // console.log('enddddd');
        fxnCallHex = module.exports.stripHexPrefix(fxnCallHex);

        // const keyPair = this.getKeyPairs(mycoin, seed, 0, 0);

        // contractAddress = '0x28a6efffaf9f721a1e95667e3de54c622edc5ffa';
        contractAddress =  module.exports.stripHexPrefix(contractAddress);
        // console.log('contractAddress=' + contractAddress);

        const totalAmount = gasLimit * gasPrice / 1e8;
        console.log('totalAmount==', totalAmount);
        // let cFee = 3000 / 1e8 // fee for the transaction

        // console.log('fxnCallHex=' + fxnCallHex);
        let totalFee = totalAmount;
        const contract = Btc.script.compile([
            84,
            module.exports.number2Buffer(gasLimit),
            module.exports.number2Buffer(gasPrice),
            module.exports.hex2Buffer(fxnCallHex),
            module.exports.hex2Buffer(contractAddress),
            194
        ]);

        const contractSize = contract.toJSON.toString().length;

        // console.log('contractSize=' + contractSize);
        totalFee += module.exports.convertLiuToFabcoin(contractSize * 10);        

        return { contract, totalFee };
    },
    fabToExgAddress: (address) => {
        try {
            const bytes = bs58.decode(address);
            const addressInWallet = bytes.toString('hex');

            if(addressInWallet.length != 50) {
                return '';
            }
            return '0x' + addressInWallet.substring(2, 42);
        } catch (e) {
            return '';
        }
    },

    validate: (data) => {
        const pubKey = module.exports.getPublicKeyBufferFromSig(data);
        const address = module.exports.getAddressFromPublicKeyBuffer(pubKey);
        return address;
    },

    getPublicKeyBufferFromSig: (data) => {
        var sig = data.sig.replace('0x', '');
        if(!sig) {
            return '';
        }
        delete data.sig;
        var msg = Object.keys(data).filter((k) => (data[k] != null) && (data[k] != undefined))
        .map(key => key + '=' + (typeof data[key] === 'string' ? data[key] : JSON.stringify(data[key]))).sort().join('&');

        var hash = module.exports.hashKanbanMessage(msg);   

        
        const rHex = sig.slice(0,64);
        const sHex = sig.slice(64,128);
        const vHex = sig.slice(128,130);


        const r = Buffer.from(rHex, "hex");
        const s = Buffer.from(sHex, "hex");
        const v = parseInt(vHex, 16);

        const pubKey  = util.ecrecover(util.toBuffer(hash), v, r, s);
        return pubKey;
    },

    getAddressFromPublicKeyBuffer: (pubKey) => {
        const pubkeyBuf = Buffer.concat([Buffer.from('04', 'hex'), pubKey]);
        const pubkey = Btc.ECPair.fromPublicKey(pubkeyBuf);
        const network = secret.production ? Btc.networks.bitcoin : Btc.networks.testnet;
        const { address } = Btc.payments.p2pkh({ 
          pubkey: pubkey.publicKey,
          network
         });
         return address;   
    },
    recoverPublicKey: (hash, rHex, sHex, vHex) => {
        const r = Buffer.from(rHex, "hex");
        const s = Buffer.from(sHex, "hex");
        const v = parseInt(vHex, 16);

        const pubKey  = util.ecrecover(util.toBuffer(hash), v, r, s);
        return '04' + pubKey.toString();
    },
    encrypt: (publicKey, data) => {

        const userPublicKey = Buffer.from(publicKey, 'hex');
        let bufferData = Buffer.from(data);
        //bufferData = Buffer.from(`{foo:"bar",baz:42}`);
        const encryptedData = ecies.encrypt(userPublicKey, bufferData);

        return encryptedData.toString('base64')
    },

    
    // The aesEncrypt method is use for encrypt the message, encrypted is bytes, you can use encrypted.toString() convert to string.
    aesEncrypt(messageToEnc, pwd) {
        const encrypted = CryptoJS.AES.encrypt(auth_code + messageToEnc, pwd).toString();
        return encrypted;
        // return encrypted.toString();
    },

    aesDecrypt(encryted, pwd) {

        try {
            const encryptedRawData = CryptoJS.AES.decrypt(encryted, pwd).toString(CryptoJS.enc.Utf8);
            if (!encryptedRawData.startsWith(auth_code)) {
                // return '';
                return encryptedRawData;
            }
            return encryptedRawData.slice(auth_code.length);
        } catch (e) { }
        return '';
    },    
    hashKanbanMessage: (data) => {
        let web3 = new Web3();
        var messageHex = web3.utils.isHexStrict(data) ? data : web3.utils.utf8ToHex(data);
        var messageBytes = web3.utils.hexToBytes(messageHex);
        var messageBuffer = Buffer.from(messageBytes);
        var preamble = '\x17Kanban Signed Message:\n' + messageBytes.length;
        var preambleBuffer = Buffer.from(preamble);
        var ethMessage = Buffer.concat([preambleBuffer, messageBuffer]);
        return Hash.keccak256s(ethMessage);    
    },  

    exgToFabAddress: (address) => {
        try {
            let prefix = '6f';
            if (secret.production) {
                prefix = '00';
            }
            address = prefix + module.exports.stripHexPrefix(address);
            let buf = Buffer.from(address, 'hex');

            const hash1 = createHash('sha256').update(buf).digest().toString('hex');
            const hash2 = createHash('sha256').update(Buffer.from(hash1, 'hex')).digest().toString('hex');
            buf = Buffer.from(address + hash2.substring(0, 8), 'hex');
            address = bs58.encode(buf);
            return address;
        } catch (e) { }


        return '';
    },

    sequenceId2ObjectId: (sequenceId) => {
        if(sequenceId.indexOf('0x') == 0) {
            sequenceId = sequenceId.substring(2);
        }
        const buf = Buffer.from(sequenceId, 'hex');
        return bs58.encode(buf);
    },

    ObjectId2SequenceId: (objectId) => {
        const bytes = bs58.decode(objectId);
        return bytes.toString('hex');
    },

    getSingleCoinBalance: async (tikerName, address) => {
        const url = 'https://kanban' + (secret.production ? 'prod' : 'test') + '.fabcoinapi.com/' + 'singleCoinWalletBalance';
        const data = {
            tickerName: tikerName,
            fabAddress: address,
            thirdPartyChainAddress: address
        };
        let balance = -1;
        try {
            const response = await axios.post(url, data);
            const json = response.data;

            console.log('json===', json);
            if (json && json.success && json.data) {
                balance = json.data.balance;
            }
            
        }catch (err) {
        }

        return balance;
    },
    sendFabSignedTransaction: async(txHex) => {
        const url = 'https://fab' + (secret.production ? 'prod' : 'test') + '.fabcoinapi.com/' + 'postrawtransaction';

        console.log('url here we go:', url);
        let txHash = '';
        let errMsg = '';
        const data = {
            rawtx: txHex
        };
        if (txHex) {
            try {
                const response = await axios.post(url, data);
                const json = response.data;
                console.log('json there we go=', json);
                if (json) {
                    if (json.txid) {
                        txHash = json.txid;
                    } else
                    if (json.Error) {
                        errMsg = json.Error;
                    }
                }
            } catch (err) {
                if (err.error && err.error.Error) {
                    errMsg = err.error.Error;
                    console.log('err there we go', err.error.Error);
                }

            }

        }

        return { txHash, errMsg };
    },

    sendKanbanSignedTransaction: async(txHex) => {
        const data = {
            signedTransactionData: txHex
        };
        let txHash = '';
        let errMsg = '';

        const url = 'https://kanban' + (secret.production ? 'prod' : 'test') + '.fabcoinapi.com/' + 'kanban/sendRawTransaction';
        if (txHex) {
            for(let i = 0; i < 20; i++) {
                console.log('i===', i);
                try {

                    //const res = await fetch(url,{method:'POST',body:JSON.stringify(data),headers: { 'Content-Type': 'application/json' }});
                    //console.log('res===', res);
                    //const text = await res.text();
                    //console.log('text===', text);
                    //const json = await res.json();
                    const response = await axios.post(url, data);
                    //console.log('response==', response);
                    const json = response.data;
                    //const response = await axios.post(url, data);
                    //console.log('json==', json);
                    //const json = response.data;
                    
                    if (json) {
                        if (json.transactionHash) {
                            txHash = json.transactionHash;
                            return { txHash, errMsg };
                        } else {
                            errMsg = JSON.stringify(json);
                        }
                    }
                } catch (err) {
                    console.log('error=', err);
                    errMsg = JSON.stringify(err);
                    /*
                    if (err.error && err.error.Error) {
                        errMsg = err.error.Error;
                    }

                    if (err.data && err.data.Error) {
                        errMsg = err.data.Error;
                    }
                    */
                }

                await new Promise(resolve => setTimeout(resolve, 1000));                
            }

        }

        return { txHash, errMsg };

    },



    postFabTx: async(txHex) => {
        console.log('in postFabTx');
        console.log('txHex====', txHex);
        const url = 'https://fab' + (secret.production ? 'prod' : 'test') + '.fabcoinapi.com/' + 'postrawtransaction';

        // console.log('url here we go:', url);
        let txHash = '';
        let errMsg = '';
        const data = {
            rawtx: txHex
        };
        if (txHex) {
            try {
                const response = await axios.post(url, data);
                //console.log('response==', response);
                const json = response.data;
                //console.log('json==', json);
                if (json) {
                    if (json.transactionHash) {
                        txHash = json.transactionHash;
                    } else
                    if(json.txid) {
                        txHash = json.txid;
                    } else
                    if (json.Error) {
                        errMsg = json.Error;
                    }
                }
            } catch (err) {
                console.log('err=', err);
                errMsg = 'Error';
                if (err.error && err.error.Error) {
                    errMsg = err.error.Error;
                }

                if (err.data && err.data.Error) {
                    errMsg = err.data.Error;
                }
            }

        }

        return { txHash, errMsg };
    }

}