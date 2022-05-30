const { default: BigNumber } = require('bignumber.js');
const secret = require('./secret.json');
const Btc = require('bitcoinjs-lib');
const BIP39 = require('bip39');
const  BIP32 = require('bip32');
const util = require('./util');
const axios = require('axios');

module.exports = {
    getNetwork: (coinName) => {
        let network = secret.production ? Btc.networks.bitcoin : Btc.networks.testnet;
        return network;
    },

    postTx: async(coin, txHex) => {
        let txHash = '';
        let errMsg = '';
        const url = 'https://' + coin.toLowerCase(coin) + (secret.production ? 'prod' : 'test') + '.fabcoinapi.com/' + 'postrawtransaction';
        let resp = null;
 
        const data = {
         rawtx: txHex
        };

        try {
             if (txHex) {
                const response = await axios.post(url, data);
                resp = response.data;
             }
             if (resp && resp.txid) {
                txHash = resp.txid;
             }
        } catch (err) {
             if (err.error && err.error.Error) {
                errMsg = err.error.Error;
            }
        }
 
        //return ret;
        return {txHash, errMsg};
    },
    getUtxos: async(coin, address) => {
        const url = 'https://' + coin.toLowerCase(coin) + (secret.production ? 'prod' : 'test') + '.fabcoinapi.com/' + 'getutxos/' + address;

        let resp = null;

        try {
            const response = await axios.get(url);
            resp = response.data;

        }catch (err) {
        }

        return resp;
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


        return {
            privateKey, address
        };
        
    },
    sendTransaction: async (privateKey, fromAddress, toAddress, decimals, coinName, tokenId, planId,  amount,
        options, doSubmit) => {

        let index = 0;
        let finished = false;
        let totalInput = 0;

        let gasPrice = 90;
        let gasLimit = 21000;
        if(tokenId) {
            gasLimit = 700000;
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
        const receiveAddsIndexArr = [];
        const changeAddsIndexArr = [];


        let amountNum = new BigNumber(amount).shiftedBy(decimals);
        if(options && options.extraFee) {
            amountNum = amountNum.plus(new BigNumber(options.extraFee).shiftedBy(decimals));
        }
        // it's for all coins.
        amountNum = amountNum.plus((2 * 34) * satoshisPerBytes);

        if (!tokenId && ( ['FAB'].indexOf(coinName) >= 0)) { // btc address format


            const BtcNetwork = module.exports.getNetwork(coinName);
            const txb = new Btc.TransactionBuilder(BtcNetwork);


            const address = fromAddress;
            const balanceFull = await module.exports.getUtxos(coinName, address);
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


            for (index = 0; index < receiveAddsIndexArr.length; index++) {
                //const alice = Btc.ECPair.fromWIF(keyPair.privateKey, BtcNetwork);
                const alice = Btc.ECPair.fromPrivateKey(privateKey, { network: BtcNetwork })
                txb.sign(index, alice);
            }

            txHex = txb.build().toHex();
            if (doSubmit) {
                const res = await module.exports.postTx(coinName, txHex);
                txHash = res.txHash;
                errMsg = res.errMsg;

            } else {
                const tx = Btc.Transaction.fromHex(txHex);
                txHash = tx.getId();
            }
        } else
        if (coinName === 'FAB' && tokenId) { // fab tokens
            const amountSent = new BigNumber(amount).shiftedBy(decimals);
            let fxnCallHex;

            if((planId === null) || (planId === undefined)) {
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
    
                fxnCallHex = util.getFuncABI(funcTransfer, 
                    [util.fabToExgAddress(toAddress), '0x' + amountSent.toString(16)]);
            } else {
                const transferToJoinPlan = {
                    "constant": false,
                    "inputs": [
                        {
                            "name": "_account",
                            "type": "address"
                        },
                        {
                            "name": "_planType",
                            "type": "uint16"
                        },
                        {
                            "name": "_amount",
                            "type": "uint256"
                        },
                        {
                            "name": "_reserved",
                            "type": "bytes32"
                        }
                    ],
                    "name": "transferToJoinPlan",
                    "outputs": [
                        {
                            "name": "",
                            "type": "bytes32"
                        }
                    ],
                    "payable": false,
                    "stateMutability": "nonpayable",
                    "type": "function"
                };

                amountInTx = amountSent;
                const args = [util.fabToExgAddress(toAddress), planId, '0x' + amountSent.toString(16), '0x0'];
                fxnCallHex = util.getFuncABI(transferToJoinPlan, args);
            }

            
            fxnCallHex = util.stripHexPrefix(fxnCallHex);

            const contractAddress = util.stripHexPrefix(tokenId);
            const totalAmount = gasLimit * gasPrice / 1e8;

            let totalFee = totalAmount;
            const contract = Btc.script.compile([
                84,
                util.number2Buffer(gasLimit),
                util.number2Buffer(gasPrice),
                util.hex2Buffer(fxnCallHex),
                util.hex2Buffer(contractAddress),
                194
            ]);

            const contractSize = contract.toJSON.toString().length;
            totalFee += util.convertLiuToFabcoin(contractSize * 10);

            options.extraFee = totalFee;
            return await module.exports.sendTransaction(privateKey, fromAddress, contract, 8, 'FAB', null, null, 0, options, doSubmit);
        }

        const ret = { txHex: txHex, txHash: txHash, errMsg: errMsg, 
            transFee: transFee, tranFeeUnit: tranFeeUnit,
            amountInTx: amountInTx, txids: txids };
        return ret;
    },
}