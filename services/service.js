"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var ethereumjs_util_1 = require("ethereumjs-util");
var ethereumjs_common_1 = __importDefault(require("ethereumjs-common"));
var buffer_1 = require("buffer");
// secp256k1n/2
var N_DIV_2 = new ethereumjs_util_1.BN('7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a0', 16);
var KanbanTxService = /** @class */ (function () {
    function KanbanTxService(data, opts) {
        if (data === void 0) { data = {}; }
        if (opts === void 0) { opts = {}; }
        if (opts.common) {
            if (opts.chain || opts.hardfork) {
                throw new Error('Instantiation with both opts.common, and opts.chain and opts.hardfork parameter not allowed!');
            }
            this._common = opts.common;
        }
        else {
            var chain = opts.chain ? opts.chain : 'mainnet';
            var hardfork = opts.hardfork ? opts.hardfork : 'petersburg';
            this._common = new ethereumjs_common_1.default(chain, hardfork);
        }
        // Define Properties
        var fields = [
            {
                name: 'nonce',
                length: 32,
                allowLess: true,
                default: buffer_1.Buffer.from([]),
            },
            {
                name: 'gasPrice',
                length: 32,
                allowLess: true,
                default: buffer_1.Buffer.from([]),
            },
            {
                name: 'gasLimit',
                alias: 'gas',
                length: 32,
                allowLess: true,
                default: buffer_1.Buffer.from([]),
            },
            {
                name: 'to',
                allowZero: true,
                length: 20,
                default: buffer_1.Buffer.from([]),
            },
            {
                name: 'value',
                length: 32,
                allowLess: true,
                default: buffer_1.Buffer.from([]),
            },
            {
                name: 'coin',
                allowLess: true,
                default: buffer_1.Buffer.from([]),
            },
            {
                name: 'data',
                alias: 'input',
                allowZero: true,
                default: buffer_1.Buffer.from([]),
            },
            {
                name: 'v',
                allowZero: true,
                default: buffer_1.Buffer.from([]),
            },
            {
                name: 'r',
                length: 32,
                allowZero: true,
                allowLess: true,
                default: buffer_1.Buffer.from([]),
            },
            {
                name: 's',
                length: 32,
                allowZero: true,
                allowLess: true,
                default: buffer_1.Buffer.from([]),
            },
        ];
        // attached serialize
        ethereumjs_util_1.defineProperties(this, fields, data);
        /**
         * @property {Buffer} from (read only) sender address of this transaction, mathematically derived from other parameters.
         * @name from
         * @memberof Transaction
         */
        Object.defineProperty(this, 'from', {
            enumerable: true,
            configurable: true,
            get: this.getSenderAddress.bind(this),
        });
        this._validateV(this.v);
        this._overrideVSetterWithValidation();
    }
    KanbanTxService.prototype._validateV = function (v) {
        if (v === undefined || v.length === 0) {
            return;
        }
        if (!this._common.gteHardfork('spuriousDragon')) {
            return;
        }
        var vInt = ethereumjs_util_1.bufferToInt(v);
        if (vInt === 27 || vInt === 28) {
            return;
        }
        var isValidEIP155V = vInt === this.getChainId() * 2 + 35 || vInt === this.getChainId() * 2 + 36;
        if (!isValidEIP155V) {
            throw new Error("Incompatible EIP155-based V " + vInt + " and chain id " + this.getChainId() + ". See the second parameter of the Transaction constructor to set the chain id.");
        }
    };
    KanbanTxService.prototype._overrideVSetterWithValidation = function () {
        var _this = this;
        var vDescriptor = Object.getOwnPropertyDescriptor(this, 'v');
        Object.defineProperty(this, 'v', __assign(__assign({}, vDescriptor), { set: function (v) {
                if (v !== undefined) {
                    _this._validateV(ethereumjs_util_1.toBuffer(v));
                }
                vDescriptor.set(v);
            } }));
    };
    /**
     * returns the sender's address
     */
    KanbanTxService.prototype.getSenderAddress = function () {
        if (this._from) {
            return this._from;
        }
        var pubkey = this.getSenderPublicKey();
        this._from = ethereumjs_util_1.publicToAddress(pubkey);
        return this._from;
    };
    /**
     * returns the public key of the sender
     */
    KanbanTxService.prototype.getSenderPublicKey = function () {
        if (!this.verifySignature()) {
            throw new Error('Invalid Signature');
        }
        // If the signature was verified successfully the _senderPubKey field is defined
        return this._senderPubKey;
    };
    /**
     * Returns the rlp encoding of the transaction
     */
    KanbanTxService.prototype.serialize = function () {
        // Note: This never gets executed, defineProperties overwrites it.
        return ethereumjs_util_1.rlp.encode(this.raw);
    };
    /**
     * sign a transaction with a given private key
     * @param privateKey - Must be 32 bytes in length
     */
    KanbanTxService.prototype.sign = function (privateKey) {
        // We clear any previous signature before signing it. Otherwise, _implementsEIP155's can give
        // different results if this tx was already signed.
        this.v = buffer_1.Buffer.from([]);
        this.s = buffer_1.Buffer.from([]);
        this.r = buffer_1.Buffer.from([]);
        var msgHash = this.hash(false);
        var sig = ethereumjs_util_1.ecsign(msgHash, privateKey);

        // console.log('msgHash=', msgHash);
        // console.log('sig=', sig);
        if (this._implementsEIP155()) {
            sig.v += this.getChainId() * 2 + 8;
        }

        Object.assign(this, sig);
    };
    /**
     * Determines if the signature is valid
     */
    KanbanTxService.prototype.verifySignature = function () {
        var msgHash = this.hash(false);
        // All transaction signatures whose s-value is greater than secp256k1n/2 are considered invalid.
        if (this._common.gteHardfork('homestead') && new ethereumjs_util_1.BN(this.s).cmp(N_DIV_2) === 1) {
            return false;
        }
        try {
            var v = ethereumjs_util_1.bufferToInt(this.v);
            var useChainIdWhileRecoveringPubKey = v >= this.getChainId() * 2 + 35 && this._common.gteHardfork('spuriousDragon');
            this._senderPubKey = ethereumjs_util_1.ecrecover(msgHash, v, this.r, this.s, useChainIdWhileRecoveringPubKey ? this.getChainId() : undefined);
        }
        catch (e) {
            return false;
        }
        return !!this._senderPubKey;
    };
    /**
     * Computes a sha3-256 hash of the serialized tx
     * @param includeSignature - Whether or not to include the signature
     */
    KanbanTxService.prototype.hash = function (includeSignature) {
        if (includeSignature === void 0) { includeSignature = true; }
        var items;
        if (includeSignature) {
            items = this.raw;
        }
        else {
            if (this._implementsEIP155()) {
                /*
                  items = [
                  ...this.raw.slice(0, 7),
                  toBuffer(this.getChainId()),
                  // TODO: stripping zeros should probably be a responsibility of the rlp module
                  stripZeros(toBuffer(0)),
                  stripZeros(toBuffer(0)),
                  ]
                */
                // items = this.raw.slice(0, 5).concat(this.raw.slice(6, 7), [
                items = this.raw.slice(0, 7).concat([
                    ethereumjs_util_1.toBuffer(this.getChainId()),
                    // TODO: stripping zeros should probably be a responsibility of the rlp module
                    ethereumjs_util_1.stripZeros(ethereumjs_util_1.toBuffer(0)),
                    ethereumjs_util_1.stripZeros(ethereumjs_util_1.toBuffer(0)),
                ]);
            }
            else {
                items = this.raw.slice(0, 7);
            }
        }

        return ethereumjs_util_1.rlphash(items);
    };
    KanbanTxService.prototype._isSigned = function () {
        return this.v.length > 0 && this.r.length > 0 && this.s.length > 0;
    };
    KanbanTxService.prototype._implementsEIP155 = function () {
        var onEIP155BlockOrLater = this._common.gteHardfork('spuriousDragon');
        if (!this._isSigned()) {
            // We sign with EIP155 all unsigned transactions after spuriousDragon
            return onEIP155BlockOrLater;
        }
        // EIP155 spec:
        // If block.number >= 2,675,000 and v = CHAIN_ID * 2 + 35 or v = CHAIN_ID * 2 + 36, then when computing
        // the hash of a transaction for purposes of signing or recovering, instead of hashing only the first six
        // elements (i.e. nonce, gasprice, startgas, to, value, data), hash nine elements, with v replaced by
        // CHAIN_ID, r = 0 and s = 0.
        var v = ethereumjs_util_1.bufferToInt(this.v);
        var vAndChainIdMeetEIP155Conditions = v === this.getChainId() * 2 + 35 || v === this.getChainId() * 2 + 36;
        return vAndChainIdMeetEIP155Conditions && onEIP155BlockOrLater;
    };
    /**
     * returns chain ID
     */
    KanbanTxService.prototype.getChainId = function () {
        return this._common.chainId();
    };
    /**
     * the minimum amount of gas the tx must have (DataFee + TxFee + Creation Fee)
     */
    KanbanTxService.prototype.getBaseFee = function () {
        var fee = this.getDataFee().iaddn(this._common.param('gasPrices', 'tx'));
        if (this._common.gteHardfork('homestead') && this.toCreationAddress()) {
            fee.iaddn(this._common.param('gasPrices', 'txCreation'));
        }
        return fee;
    };
    /**
     * The amount of gas paid for the data in this tx
     */
    KanbanTxService.prototype.getDataFee = function () {
        var data = this.raw[5];
        var cost = new ethereumjs_util_1.BN(0);
        for (var i = 0; i < data.length; i++) {
            data[i] === 0
                ? cost.iaddn(this._common.param('gasPrices', 'txDataZero'))
                : cost.iaddn(this._common.param('gasPrices', 'txDataNonZero'));
        }
        return cost;
    };
    /**
     * If the tx's `to` is to the creation address
     */
    KanbanTxService.prototype.toCreationAddress = function () {
        return this.to.toString('hex') === '';
    };
    KanbanTxService.prototype.validate = function (stringError) {
        if (stringError === void 0) { stringError = false; }
        var errors = [];
        if (!this.verifySignature()) {
            errors.push('Invalid Signature');
        }
        if (this.getBaseFee().cmp(new ethereumjs_util_1.BN(this.gasLimit)) > 0) {
            errors.push(["gas limit is too low. Need at least " + this.getBaseFee()]);
        }
        if (stringError === false) {
            return errors.length === 0;
        }
        else {
            return errors.join(' ');
        }
    };
    return KanbanTxService;
}());
exports.default = KanbanTxService;
