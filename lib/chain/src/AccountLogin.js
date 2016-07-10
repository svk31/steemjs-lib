var PrivateKey = require("../../ecc/src/PrivateKey");
var key = require("../../ecc/src/KeyUtils");

var {get, set} =  require("./state");

var _keyCachePriv = {};
var _keyCachePub = {};

class AccountLogin {

    constructor() {
        this.reset();
    }

    reset() {
        let state = {loggedIn: false, roles: ["active", "owner", "posting", "memo"]};
        this.get = get(state);
        this.set = set(state);

        this.subs = {};
    }

    addSubscription(cb) {
        this.subs[cb] = cb;
    }

    setRoles(roles) {
        this.set("roles", roles);
    }

    generateKeys(accountName, password, roles, prefix) {
        var start = new Date().getTime();
        if (!accountName || !password) {
            throw new Error("Account name or password required");
        }
        if (password.length < 12) {
            throw new Error("Password must have at least 12 characters");
        }

        let privKeys = {};
        let pubKeys = {};

        (roles || this.get("roles")).forEach(role => {
            let seed = accountName + role + password;
            let pkey = _keyCachePriv[seed] ? _keyCachePriv[seed] :  PrivateKey.fromSeed( key.normalize_brainKey(seed) );
            _keyCachePriv[seed] = pkey;

            privKeys[role] = pkey;
            pubKeys[role] = _keyCachePub[role] ? _keyCachePub[role] : pkey.toPublicKey().toString(prefix);

            _keyCachePub[role] = pubKeys[role];
        });

        return {privKeys, pubKeys};
    }

    getPubKeys() {
        return this.get("roles").map(role => {
            return _keyCachePub[role];
        });
    }

    checkKeys({accountName, password, auths}) {
        if (!accountName || !password || !auths) {
            throw new Error("checkKeys: Missing inputs");
        }
        let hasKey = false;
        for (let role in auths) {
            let {privKeys, pubKeys} = this.generateKeys(accountName, password, [role]);
            auths[role].forEach(key => {
                if (key[0] === pubKeys[role]) {
                    hasKey = true;
                    this.set(role, {priv: privKeys[role], pub: pubKeys[role]});
                }
            });
        };

        if (hasKey) {
            this.set("name", accountName);
        }

        this.set("loggedIn", hasKey);

        return hasKey;
    }

    signTransaction(tr, signerPubkeys = {}) {

        let myKeys = {};
        let hasKey = false;

        this.get("roles").forEach(role => {
            let myKey = this.get(role);
            if (myKey) {
                if (signerPubkeys[myKey.pub]) {
                    hasKey = true;
                    return;
                }
                hasKey = true;
                signerPubkeys[myKey.pub] = true;
                console.log("adding signer:", myKey.pub);
                tr.add_signer(myKey.priv, myKey.pub);
            }
        });

        if (!hasKey) {
            console.error("You do not have any private keys to sign this transaction");
            throw new Error("You do not have any private keys to sign this transaction");
        }
    }

    clear() {

    }
}

module.exports = AccountLogin;
