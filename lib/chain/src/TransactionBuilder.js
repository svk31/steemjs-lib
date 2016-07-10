var assert = require("assert");
var { Signature, PublicKey, hash } = require("../../ecc");
var { ops } = require("../../serializer");
var Api = require('steem-rpc');
var ChainConfig = require("../../chain/src/ChainConfig");

var api = Api();
var {Long} = require('bytebuffer');

var ChainTypes = require('./ChainTypes');

var head_block_time_string;

class TransactionBuilder {

    constructor() {
        this.ref_block_num = 0
        this.ref_block_prefix = 0
        this.expiration = 0
        this.operations = []
        this.signatures = []
        this.signer_private_keys = []

        // semi-private method bindings
        this._broadcast = _broadcast.bind(this)
    }

    /**
        @arg {string} name - like "transfer"
        @arg {object} operation - JSON matchching the operation's format
    */
    add_type_operation(name, operation) {
        this.add_operation(this.get_type_operation(name, operation));
        return;
    }

    /**
        This does it all: set fees, finalize, sign, and broadcast (if wanted).

        @arg {ConfidentialWallet} cwallet - must be unlocked, used to gather signing keys

        @arg {array<string>} [signer_pubkeys = null] - Optional ["GPHAbc9Def0...", ...].  These are additional signing keys.  Some balance claims require propritary address formats, the witness node can't tell us which ones are needed so they must be passed in.  If the witness node can figure out a signing key (mostly all other transactions), it should not be passed in here.

        @arg {boolean} [broadcast = false]
    */
    process_transaction(accountLogin, signer_pubkeys = null, broadcast = false) {

        // let wallet_object = cwallet.wallet.wallet_object
        // if(api.get().chain_id !== wallet_object.get("chain_id"))
        //     return Promise.reject("Mismatched chain_id; expecting " +
        //         wallet_object.get("chain_id") + ", but got " +
        //         api.get().chain_id)

        var signer_pubkeys_added = {}
        // if(signer_pubkeys) {
        //
        //     // Balance claims are by address, only the private
        //     // key holder can know about these additional
        //     // potential keys.
        //     var pubkeys = accountLogin.getPubKeys()
        //     if( ! pubkeys.length)
        //         throw new Error("Missing signing key")
        //
        //     for(let pubkey_string of pubkeys) {
        //         var private_key = cwallet.getPrivateKey(pubkey_string)
        //         this.add_signer(private_key, pubkey_string)
        //         signer_pubkeys_added[pubkey_string] = true
        //     }
        // }

    // return this.get_potential_signatures().then( (pubkeys)=> {
        var my_pubkeys = accountLogin.getPubKeys()

        //{//Testing only, don't send All public keys!
        //    var pubkeys_all = PrivateKeyStore.getPubkeys() // All public keys
        //    this.get_required_signatures(pubkeys_all).then( required_pubkey_strings =>
        //        console.log('get_required_signatures all\t',required_pubkey_strings.sort(), pubkeys_all))
        //    this.get_required_signatures(my_pubkeys).then( required_pubkey_strings =>
        //        console.log('get_required_signatures normal\t',required_pubkey_strings.sort(), pubkeys))
        //}

        return this.get_required_signatures(my_pubkeys).then( required_pubkeys => {
            console.log("required_pubkeys", required_pubkeys);
            for(let pubkey_string of my_pubkeys) {
                // console.log("pubkey_string", pubkey_string);

                if(signer_pubkeys_added[pubkey_string]) continue

                accountLogin.signTransaction(this, signer_pubkeys_added);
                // var private_key = cwallet.getPrivateKey(pubkey_string)
                // if( ! private_key)
                //     // This should not happen, get_required_signatures will only
                //     // returned keys from my_pubkeys
                //     throw new Error("Missing signing key for " + pubkey_string)
                // this.add_signer(private_key, pubkey_string)
            }

            // console.log("signer_pubkeys_added", signer_pubkeys_added);
        })
        .then(()=> broadcast ? this.broadcast() : this.serialize())
    }

    /** Typically this is called automatically just prior to signing.  Once finalized this transaction can not be changed. */
    finalize(){
        // console.log("Try to finalize", "expiration:", this.expiration);
        return new Promise((resolve, reject)=> {

            if (this.tr_buffer) { throw new Error("already finalized"); }

            resolve(api.get().database_api().exec("get_dynamic_global_properties", []).then((r) => {
                head_block_time_string = r.time;
                if( this.expiration === 0 )
                    this.expiration = base_expiration_sec() + ChainConfig.expire_in_secs
                // console.log("new expiration:", this.expiration);
                this.ref_block_num = r.head_block_number & 0xFFFF;
                this.ref_block_prefix =  new Buffer(r.head_block_id, 'hex').readUInt32LE(4);
                //DEBUG console.log("ref_block",@ref_block_num,@ref_block_prefix,r)

                var iterable = this.operations;
                for (var i = 0, op; i < iterable.length; i++) {
                    op = iterable[i];
                    if (op[1]["finalize"]) {
                        op[1].finalize();
                    }
                }
                this.tr_buffer = ops.transaction.toBuffer(this);

            }).catch(err => {
                    console.log("get_dynamic_global_properties err:", err);
            }));

        });
    }

    /** @return {string} hex transaction ID */
    id() {
        if (!this.tr_buffer) { throw new Error("not finalized"); }
        return hash.sha256(this.tr_buffer).toString( 'hex' ).substring(0,40);
    }

    /**
        Typically one will use {@link this.add_type_operation} instead.
        @arg {array} operation - [operation_id, operation]
    */
    add_operation(operation) {
        if (this.tr_buffer) { throw new Error("already finalized"); }
        assert(operation, "operation");
        if (!Array.isArray(operation)) {
            throw new Error("Expecting array [operation_id, operation]");
        }
        this.operations.push(operation);
        return;
    }

    get_type_operation(name, operation) {
        if (this.tr_buffer) { throw new Error("already finalized"); }
        assert(name, "name");
        assert(operation, "operation");
        var _type = ops[name];
        assert(_type, `Unknown operation ${name}`);
        var operation_id = ChainTypes.operations[_type.operation_name];
        if (operation_id === undefined) {
            throw new Error(`unknown operation: ${_type.operation_name}`);
        }
        if (!operation.fee) {
            operation.fee = {amount: 0, asset_id: 0};
        }
        if (name === 'proposal_create') {
            operation.expiration_time || (operation.expiration_time = (base_expiration_sec() + ChainConfig.expire_in_secs_proposal));
        }
        var operation_instance = _type.fromObject(operation);
        return [operation_id, operation_instance];
    }

    /** optional: there is a deafult expiration */
    set_expire_seconds(sec){
        if (this.tr_buffer) { throw new Error("already finalized"); }
        return this.expiration = base_expiration_sec() + sec;
    }

    /* Wraps this transaction in a proposal_create transaction */
    propose(proposal_create_options) {
        if (this.tr_buffer) {
            throw new Error("already finalized");
        }
        if (!this.operations.length) {
            throw new Error("add operation first");
        }

        assert(proposal_create_options, "proposal_create_options");
        assert(proposal_create_options.fee_paying_account, "proposal_create_options.fee_paying_account");

        let proposed_ops = this.operations.map(op => {
            return {op: op};
        })

        this.operations = []
        this.signatures = []
        this.signer_private_keys = []
        proposal_create_options.proposed_ops = proposed_ops;
        this.add_type_operation("proposal_create", proposal_create_options);
        return this;
    }

    has_proposed_operation() {
        let hasProposed = false;
        for (var i = 0; i < this.operations.length; i++) {
            if ("proposed_ops" in this.operations[i][1]) {
                hasProposed = true;
                break;
            }
        }

        return hasProposed;
    }

    get_potential_signatures(){
        var tr_object = ops.signed_transaction.toObject(this);
        return api.get().database_api().exec( "get_potential_signatures", [tr_object] )
        .then( function(pubkeys){
            return {pubkeys};
        });
    }

    get_required_signatures(available_keys) {

        if (!available_keys.length) { return Promise.resolve([]); }
        var tr_object = ops.signed_transaction.toObject(this);
        // console.log('... tr_object',tr_object)
        //DEBUG console.log('... tr_object',tr_object)
        return api.get().database_api().exec( "get_required_signatures", [tr_object, available_keys]).then(function(required_public_keys){
            // DEBUG console.log('... get_required_signatures',required_public_keys)
            return required_public_keys;
        });
    }

    add_signer(private_key, public_key = private_key.toPublicKey()){

        assert(private_key.d, "required PrivateKey object")

        if (this.signed) { throw new Error("already signed"); }
        if (!public_key.Q) {
            public_key = PublicKey.fromPublicKeyString(public_key);
        }
        // prevent duplicates
        let spHex = private_key.toHex()
        for(let sp of this.signer_private_keys) {
            if(sp[0].toHex() === spHex)
                return
        }
        this.signer_private_keys.push([private_key, public_key]);
    }

    sign(chain_id = ChainConfig.networks.Steem.chain_id){
        if (!this.tr_buffer) { throw new Error("not finalized"); }
        if (this.signed) { throw new Error("already signed"); }
        if (!this.signer_private_keys.length) {
            throw new Error("Transaction was not signed. Do you have a private key? [no_signers]");
        }
        var end = this.signer_private_keys.length;
        for (var i = 0; 0 < end ? i < end : i > end; 0 < end ? i++ : i++) {
            var [private_key, public_key] = this.signer_private_keys[i];
            var sig = Signature.signBuffer(
                Buffer.concat([new Buffer(chain_id, 'hex'), this.tr_buffer]),
                private_key,
                public_key
            );
            this.signatures.push(sig.toBuffer());
        }
        this.signer_private_keys = [];
        this.signed = true;
        return;
    }

    serialize(){
        return ops.signed_transaction.toObject(this);
    }

    toObject(){
        return ops.signed_transaction.toObject(this);
    }

    broadcast(was_broadcast_callback){
    console.log("Try to broadcast", this.tr_buffer, was_broadcast_callback);
        if (this.tr_buffer) {
            return this._broadcast(was_broadcast_callback);
        } else {
            return this.finalize().then(() => {
                return this._broadcast(was_broadcast_callback);
            });
        }
    }
}

var base_expiration_sec = () => {
    var head_block_sec = Math.ceil(getHeadBlockDate().getTime() / 1000);

    console.log("head_block_sec:", head_block_sec);
    var now_sec = Math.ceil(Date.now() / 1000);
    // The head block time should be updated every 3 seconds.  If it isn't
    // then help the transaction to expire (use head_block_sec)
    if (now_sec - head_block_sec > 30) { return head_block_sec; }
    // If the user's clock is very far behind, use the head block time.
    return Math.max(now_sec, head_block_sec);
};

function _broadcast(was_broadcast_callback){
    return new Promise((resolve, reject)=> {
        console.log("_broadcast"," !signed:", !this.signed);
        if (!this.signed) { this.sign(); }
        if (!this.tr_buffer) { throw new Error("not finalized"); }
        if (!this.signatures.length) { throw new Error("not signed"); }
        if (!this.operations.length) { throw new Error("no operations"); }

        var tr_object = ops.signed_transaction.toObject(this);
        console.log('... broadcast_transaction_with_callback !!!', tr_object)

        api.get().network_broadcast_api().exec( "broadcast_transaction_with_callback", [ function(res) { return resolve(res); } ,tr_object]).then(function(){
            console.log('... broadcast success, waiting for callback')
            if(was_broadcast_callback) was_broadcast_callback();
            return;
        }
        ).catch( (error)=> {
            // console.log may be redundant for network errors, other errors could occur
            console.log(error);
            var message = error.message;
            if (!message) { message = ""; }
            reject( new Error((
                message + "\n" +
                'graphene-crypto ' +
                ' digest ' + hash.sha256(this.tr_buffer).toString('hex') +
                ' transaction ' + this.tr_buffer.toString('hex') +
                ' ' + JSON.stringify(tr_object) ))
            );
            return;
        }
        );
        return;
    });
}

function getHeadBlockDate() {
    return timeStringToDate( head_block_time_string )
}

function timeStringToDate(time_string) {
    if( ! time_string) return new Date("1970-01-01T00:00:00.000Z")
    if( ! /Z$/.test(time_string)) //does not end in Z
        // https://github.com/cryptonomex/graphene/issues/368
        time_string = time_string + "Z"
    return new Date(time_string)
}

module.exports = TransactionBuilder;
