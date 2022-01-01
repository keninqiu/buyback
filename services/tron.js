const axios = require('axios');
const { utils } = require("ethers");
const {ec:EC} = require('elliptic');
const { default: BigNumber } = require('bignumber.js');

const keccak256 = utils.keccak256;
const sha256 = utils.sha256;
const toUtf8Bytes = utils.toUtf8Bytes;
const toUtf8String = utils.toUtf8String;
const recoverAddress = utils.recoverAddress;
const SigningKey = utils.SigningKey;
const AbiCoder = utils.AbiCoder;

const ADDRESS_SIZE = 34;
const ADDRESS_PREFIX = "41";
const ADDRESS_PREFIX_BYTE = 0x41;
const ADDRESS_PREFIX_REGEX = /^(41)/;

const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const ALPHABET_MAP = {};

for (let i = 0; i < ALPHABET.length; i++)
    ALPHABET_MAP[ALPHABET.charAt(i)] = i;

const BASE = 58;

function encode58(buffer) {
    if (buffer.length === 0)
        return '';

    let i;
    let j;

    const digits = [0];

    for (i = 0; i < buffer.length; i++) {
        for (j = 0; j < digits.length; j++)
            digits[j] <<= 8;

        digits[0] += buffer[i];
        let carry = 0;

        for (j = 0; j < digits.length; ++j) {
            digits[j] += carry;
            carry = (digits[j] / BASE) | 0;
            digits[j] %= BASE
        }

        while (carry) {
            digits.push(carry % BASE);
            carry = (carry / BASE) | 0
        }
    }

    for (i = 0; buffer[i] === 0 && i < buffer.length - 1; i++)
        digits.push(0);

    return digits.reverse().map(digit => ALPHABET[digit]).join('');
}

function isHexChar(c) {
    if ((c >= 'A' && c <= 'F') ||
        (c >= 'a' && c <= 'f') ||
        (c >= '0' && c <= '9')) {
        return 1;
    }

    return 0;
}

function decode58(string) {
    if (string.length === 0)
        return [];

    let i;
    let j;

    const bytes = [0];

    for (i = 0; i < string.length; i++) {
        const c = string[i];

        if (!(c in ALPHABET_MAP))
            throw new Error('Non-base58 character');

        for (j = 0; j < bytes.length; j++)
            bytes[j] *= BASE;

        bytes[0] += ALPHABET_MAP[c];
        let carry = 0;

        for (j = 0; j < bytes.length; ++j) {
            bytes[j] += carry;
            carry = bytes[j] >> 8;
            bytes[j] &= 0xff;
        }

        while (carry) {
            bytes.push(carry & 0xff);
            carry >>= 8;
        }
    }

    for (i = 0; string[i] === '1' && i < string.length - 1; i++)
        bytes.push(0);

    return bytes.reverse();
}

function byte2hexStr(byte) {
    if (typeof byte !== 'number')
        throw new Error('Input must be a number');

    if (byte < 0 || byte > 255)
        throw new Error('Input must be a byte');

    const hexByteMap = '0123456789ABCDEF';

    let str = '';
    str += hexByteMap.charAt(byte >> 4);
    str += hexByteMap.charAt(byte & 0x0f);

    return str;
}

function hexChar2byte(c) {
    let d;

    if (c >= 'A' && c <= 'F')
        d = c.charCodeAt(0) - 'A'.charCodeAt(0) + 10;
    else if (c >= 'a' && c <= 'f')
        d = c.charCodeAt(0) - 'a'.charCodeAt(0) + 10;
    else if (c >= '0' && c <= '9')
        d = c.charCodeAt(0) - '0'.charCodeAt(0);

    if (typeof d === 'number')
        return d;
    else
        throw new Error('The passed hex char is not a valid hex char');
}

// set strict as true: if the length of str is odd, add 0 before the str to make its length as even
function hexStr2byteArray(str, strict = false) {
    if (typeof str !== 'string')
        throw new Error('The passed string is not a string')

    let len = str.length;

    if (strict) {
        if (len % 2) {
            str = `0${str}`;
            len++;
        }
    }
    const byteArray = Array();
    let d = 0;
    let j = 0;
    let k = 0;

    for (let i = 0; i < len; i++) {
        const c = str.charAt(i);

        if (isHexChar(c)) {
            d <<= 4;
            d += hexChar2byte(c);
            j++;

            if (0 === (j % 2)) {
                byteArray[k++] = d;
                d = 0;
            }
        } else
            throw new Error('The passed hex char is not a valid hex string')
    }

    return byteArray;
}

function SHA256(msgBytes) {
    const msgHex = byteArray2hexStr(msgBytes);
    const hashHex = sha256('0x' + msgHex).replace(/^0x/, '')
    return hexStr2byteArray(hashHex);
}

function decodeBase58Address(base58Sting) {
    if (typeof (base58Sting) != 'string')
        return false;

    if (base58Sting.length <= 4)
        return false;

    let address = decode58(base58Sting);

    if (base58Sting.length <= 4)
        return false;

    const len = address.length;
    const offset = len - 4;
    const checkSum = address.slice(offset);

    address = address.slice(0, offset);

    const hash0 = SHA256(address);
    const hash1 = SHA256(hash0);
    const checkSum1 = hash1.slice(0, 4);

    if (checkSum[0] == checkSum1[0] && checkSum[1] == checkSum1[1] && checkSum[2] ==
        checkSum1[2] && checkSum[3] == checkSum1[3]
    ) {
        return address;
    }

    throw new Error('Invalid address provided');
}

function byteArray2hexStr(byteArray) {
    let str = '';

    for (let i = 0; i < (byteArray.length); i++)
        str += byte2hexStr(byteArray[i]);

    return str;
}

function isHex(string) {
    return (typeof string === 'string'
        && !isNaN(parseInt(string, 16))
        && /^(0x|)[a-fA-F0-9]+$/.test(string));
}

function toHex(address) {
    if (isHex(address))
        return address.toLowerCase().replace(/^0x/, ADDRESS_PREFIX);

    return byteArray2hexStr(
        decodeBase58Address(address)
    ).toLowerCase();
}

async function sendTrx(to, amount, from) {
    amount = parseInt(amount)
    const data = {
        to_address: toHex(to),
        owner_address: toHex(from),
        amount: amount,
    };

    const url = 'https://api.trongrid.io/wallet/createtransaction';
    let resp;
    try {
        const response = await axios.post(url, data);
        resp = response.data;

    }catch (err) {
    }   
    return resp; 
    //this.tronWeb.fullNode.request('wallet/createtransaction', data, 'post').then(transaction => resultManager(transaction, callback)).catch(err => callback(err));
}

function signString(message, privateKey) {
    message = message.replace(/^0x/, '');
    const value = {
        toHexString: function() {
            return '0x' + privateKey;
        },
        value: privateKey
    };
    const messagePrefix = '\x15TRON Signed Message:\n';
    const signingKey = new SigningKey(value);
    const length = message.length;
    const messageBytes = [
        ...toUtf8Bytes(messagePrefix),
        // length,
        ...toUtf8Bytes(message)
    ];

    const messageDigest = keccak256(messageBytes);
    const signature = signingKey.signDigest(messageDigest);

    signature.v = '0x' + Number(signature.v).toString(16);
    return signature;
}

function getPubKeyFromPriKey(priKeyBytes) {
    const ec = new EC('secp256k1');
    const key = ec.keyFromPrivate(priKeyBytes, 'bytes');
    const pubkey = key.getPublic();
    const x = pubkey.x;
    const y = pubkey.y;

    let xHex = x.toString('hex');

    while (xHex.length < 64) {
        xHex = `0${xHex}`;
    }

    let yHex = y.toString('hex');

    while (yHex.length < 64) {
        yHex = `0${yHex}`;
    }

    const pubkeyHex = `04${xHex}${yHex}`;
    const pubkeyBytes = hexStr2byteArray(pubkeyHex);

    return pubkeyBytes;
}

function getBase58CheckAddress(addressBytes) {
    const hash0 = SHA256(addressBytes);
    const hash1 = SHA256(hash0);

    let checkSum = hash1.slice(0, 4);
    checkSum = addressBytes.concat(checkSum);

    return encode58(checkSum);
}

function computeAddress(pubBytes) {
    if (pubBytes.length === 65)
        pubBytes = pubBytes.slice(1);

    const hash = keccak256(pubBytes).toString().substring(2);
    const addressHex = ADDRESS_PREFIX + hash.substring(24);

    return hexStr2byteArray(addressHex);
}

function getAddressFromPriKey(priKeyBytes) {
    let pubBytes = getPubKeyFromPriKey(priKeyBytes);
    return computeAddress(pubBytes);
}

function signTransaction(priKeyBytes, transaction) {
    if (typeof priKeyBytes === 'string') {
        priKeyBytes = hexStr2byteArray(priKeyBytes);
    }
    const txID = transaction.txID;
    const signature = ECKeySign(hexStr2byteArray(txID), priKeyBytes);

    if (Array.isArray(transaction.signature)) {
        if (!transaction.signature.includes(signature))
            transaction.signature.push(signature);
    } else
        transaction.signature = [signature];
    return transaction;
}

function ECKeySign(hashBytes, priKeyBytes) {
    const ec = new EC('secp256k1');
    const key = ec.keyFromPrivate(priKeyBytes, 'bytes');
    const signature = key.sign(hashBytes);
    const r = signature.r;
    const s = signature.s;
    const id = signature.recoveryParam;

    let rHex = r.toString('hex');

    while (rHex.length < 64) {
        rHex = `0${rHex}`;
    }

    let sHex = s.toString('hex');

    while (sHex.length < 64) {
        sHex = `0${sHex}`;
    }

    const idHex = byte2hexStr(id);
    const signHex = rHex + sHex + idHex;

    return signHex;
}

function isString(string) {
    return typeof string === 'string' || (string && string.constructor && string.constructor.name === 'String');
}

async function sendRawTransaction(signedTransaction) {

    const url = 'https://api.trongrid.io/wallet/broadcasttransaction';
    let result;
    try {
        const response = await axios.post(url, signedTransaction);
        result = response.data;
        if (result.result)
            result.transaction = signedTransaction;        

    }catch (err) {
    }   
    return result; 
}

async function transfer(tokenId, decimals, toAddress, amount, fromAddress, feeLimit) {
    const tokenFeeLimit = '0x' + new BigNumber(feeLimit).shiftedBy(6).toString(16); 
    const functionSelector = 'transfer(address,uint256)';
    const options= {
        feeLimit: tokenFeeLimit,
        callValue: 0,
        userFeePercentage: 100,
        shouldPollResponse: false,
        from: toHex(fromAddress)
    };

    amountInTx = new BigNumber(amount).shiftedBy(decimals);
    const amountNum = '0x' + amountInTx.toString(16);  

    const parameters = [
        {
            type: 'address',
            value: toHex(toAddress).replace(ADDRESS_PREFIX_REGEX, '0x')
        },
        { type: 'uint256', value: amountNum }
    ];

    return await triggerSmartContract(
        toHex(tokenId),
        functionSelector,
        options, 
        parameters,
        toHex(fromAddress)
    );
}

function isNotNullOrUndefined(val) {
    return val !== null && typeof val !== 'undefined';
}

async function triggerSmartContract(
    contractAddress,
    functionSelector,
    options = {},
    parameters = [],
    issuerAddress = null,
    callback = false
) {
    const args = {
        contract_address: toHex(contractAddress),
        owner_address: toHex(issuerAddress)
    };
   
    let {
        tokenValue,
        tokenId,
        callValue,
        feeLimit,
    } = Object.assign({
        callValue: 0,
        feeLimit: options && options.feeLimit ? options.feeLimit : 5000000
    }, options)

    if (functionSelector && isString(functionSelector)) {
        functionSelector = functionSelector.replace('/\s*/g', '');
        if (parameters.length) {
            const abiCoder = new AbiCoder();
            let types = [];
            const values = [];

            for (let i = 0; i < parameters.length; i++) {
                let {type, value} = parameters[i];

                if (!type || !isString(type) || !type.length)
                    return callback('Invalid parameter type provided: ' + type);

                if (type === 'address')
                    value = toHex(value).replace(ADDRESS_PREFIX_REGEX, '0x');
                else if (type.match(/^([^\x5b]*)(\x5b|$)/)[0] === 'address[')
                    value = value.map(v => toHex(v).replace(ADDRESS_PREFIX_REGEX, '0x'));

                types.push(type);
                values.push(value);
            }

            try {
                // workaround for unsupported trcToken type
                types = types.map(type => {
                    if (/trcToken/.test(type)) {
                        type = type.replace(/trcToken/, 'uint256')
                    }
                    return type
                })

                parameters = abiCoder.encode(types, values).replace(/^(0x)/, '');
            } catch (ex) {
                return callback(ex);
            }
        } else parameters = '';

        if (options.shieldedParameter && isString(options.shieldedParameter)) {
            parameters = options.shieldedParameter.replace(/^(0x)/, '');
        }

        if (options.rawParameter && isString(options.rawParameter)) {
            parameters = options.rawParameter.replace(/^(0x)/, '');
        }

        args.function_selector = functionSelector;
        args.parameter = parameters;
    }


    if (!options._isConstant) {
        args.call_value = parseInt(callValue)
        args.fee_limit = parseInt(feeLimit)
        if (isNotNullOrUndefined(tokenValue))
            args.call_token_value = parseInt(tokenValue)
        if (isNotNullOrUndefined(tokenId))
            args.token_id = parseInt(tokenId)
    }    

    const url = 'https://api.trongrid.io/' + `wallet${options.confirmed ? 'solidity' : ''}/trigger${options._isConstant ? 'constant' : 'smart'}contract`;
    let resp;
    try {
        const response = await axios.post(url, args);
        resp = response.data;

    }catch (err) {
    }   
    return resp; 
}

module.exports = {
    sendTrx,
    signTransaction,
    sendRawTransaction,
    transfer,
    signString,
    getAddressFromPriKey,
    getBase58CheckAddress
}