var secret = require('./secret.json');
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

const randombytes = require('randombytes');
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

    getBuyBackItem: async () => {

        const url = 'https://' + (secret.production ? 'api' : 'test') + '.blockchaingate.com/v2/' + '7star-buyback/new';

        let item;
        try {
            const response = await axios.get(url);
            const resp = response.data;
            if(resp.ok) {
                item = resp._body;
            }

        }catch (err) {
        }


        return item;

    },
    submitBuyBackTransaction: async (id, buyBackTxHex) => {
        const url = 'https://' + (secret.production ? 'api' : 'test') + '.blockchaingate.com/v2/' + '7star-buyback/submit';
        console.log('url===', url);
        const data = {
            id,
            txhex: buyBackTxHex
        };
        console.log('data=', data);
        let item;
        try {
            const response = await axios.post(url, data);
            const resp = response.data;
            if(resp.ok) {
                item = resp._body;
            }

        }catch (err) {
        }
        return item;        
    },
    getSellOrders: async (marketPair) => {
        const url = 'https://kanban' + (secret.production ? 'prod' : 'test') +'.fabcoinapi.com/' + 'publicapi/orderbook/' + marketPair;

        console.log('url====', url);
        let items;
        try {
            const response = await axios.get(url);
            const resp = response.data;
            if(resp.success) {
                items = resp.data.asks;
            }

        }catch (err) {
        }


        return items;
    },

    buyTxHex: async (
        privateKey, 
        address,
        targetCoinType, 
        baseCoinType, 
        priceBigHex,
        amountBigHex
    ) => {
        const abi = {
            'constant': false,
            'inputs': [
              {
                'name': '_fromContract',
                'type': 'bool'
              },        
              {
                'name': '_bid',
                'type': 'bool'
              },
              {
                'name': '_baseCoin',
                'type': 'uint32'
              },
              {
                'name': '_targetCoin',
                'type': 'uint32'
              },
              {
                'name': '_amount',
                'type': 'uint256'
              },
              {
                'name': '_price',
                'type': 'uint256'
              },
              {
                'name': '_orderHash',
                'type': 'bytes32'
              }
            ],
            'name': 'createOrder',
            'outputs': [
              {
                'name': '',
                'type': 'bytes32'
              }
            ],
            'payable': false,
            'stateMutability': 'nonpayable',
            'type': 'function'
        };
        const bidOrAsk = true;
        const orderType = 1;
        const timeBeforeExpiration = new Date().getTime();
        const orderHash = module.exports.generateOrderHash(bidOrAsk, orderType, baseCoinType
            , targetCoinType, amountBigHex, priceBigHex, timeBeforeExpiration);
        const args = [false, bidOrAsk,
            baseCoinType, targetCoinType, amountBigHex, priceBigHex, orderHash];

        const abiData = module.exports.getGeneralFunctionABI(abi, args);
        const exchangeAddress = await module.exports.getExchangeAddress();
        const txhex = await module.exports.getExecSmartContractHexByData(privateKey, address, exchangeAddress, abiData);
        //console.log('txhex==', txhex);
        //const res = await module.exports.sendRawSignedTransactionPromise(txhex);     
        return txhex;  
    },
    
    getGeneralFunctionABI: (func, paramsArray) => {
        let web3 = new Web3();
        const abiHex = web3.eth.abi.encodeFunctionCall(func, paramsArray);
        return abiHex;
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
    stripHexPrefix: (str) => {
        if (str && (str.length > 2) && (str[0] === '0') && (str[1] === 'x')) {
            return str.slice(2);
        }
        return str;
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
    
    getExchangeAddress: async() => {
        /*
        const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
        let path = 'exchangily/getExchangeAddress';
        path = this.endpoint + path;
        const addr = await this.http.get(path, { headers, responseType: 'text' }).toPromise() as string;
        return addr;
        */
        const url = 'https://kanban' + (secret.production ? 'prod' : 'test') +'.fabcoinapi.com/' + 'exchangily/getExchangeAddress';

        console.log('url====', url);
        let address;
        try {
            const response = await axios.get(url);
            address = response.data;

        }catch (err) {
        }


        return address;
    },

    generateOrderHash(bidOrAsk, orderType, baseCoin, targetCoin, amount, price, timeBeforeExpiration) {
        const web3 = new Web3();
        const randomString = randombytes(32).map(String).join('');
        const concatString = [bidOrAsk, orderType, baseCoin, targetCoin, amount, price, timeBeforeExpiration, randomString].join('');
        return web3.utils.sha3(concatString);
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



}