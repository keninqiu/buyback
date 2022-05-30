const bs58 = require('bs58');
const Web3EthAbi = require('web3-eth-abi');
module.exports = {
    delay: (time) => {
        return new Promise(resolve => setTimeout(resolve, time * 1000));
    },
    getFuncABI: (func, args) => {
        const encoded = Web3EthAbi.encodeFunctionCall(func, args);
        return encoded;
    },
    stripHexPrefix: (str) => {
        if (str && (str.length > 2) && (str[0] === '0') && (str[1] === 'x')) {
            return str.slice(2);
        }
        return str;
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

}