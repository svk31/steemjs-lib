var PrivateKey = require("../../ecc/src/PrivateKey");
var key = require("../../ecc/src/KeyUtils");

var _keyCachePriv = {};
var _keyCachePub = {};
var _myKeys = {};

class AccountLogin {

    constructor() {
        this.reset();

    }

    reset() {
        this.state = {loggedIn: false, roles: ["active", "owner", "posting", "memo"]};

        this.subs = {};
    }

    addSubscription(cb) {
        this.subs[cb] = cb;
    }

    setRoles(roles) {
        this.state.roles = roles;
    }

    getRoles() {
        return this.state.roles;
    }

    generateKeys(accountName, password, roles, prefix) {
        if (!accountName || !password) {
            throw new Error("Account name or password required");
        }
        if (password.length < 12) {
            throw new Error("Password must have at least 12 characters");
        }

        let privKeys = {};
        let pubKeys = {};

        (roles || this.state.roles).forEach(role => {
            let seed = accountName + role + password;
            let pkey = _keyCachePriv[role] ? _keyCachePriv[role] :  PrivateKey.fromSeed( key.normalize_brainKey(seed) );
            _keyCachePriv[role] = pkey;

            privKeys[role] = pkey;
            pubKeys[role] = _keyCachePub[role] ? _keyCachePub[role] : pkey.toPublicKey().toString(prefix);

            _keyCachePub[role] = pubKeys[role];
        });

        return {privKeys, pubKeys};
    }

    fromPrivKey(accountName, privateKey, roles, prefix) {
        if (!privateKey) {
            return null;
        }
        let privKeys = {};
        let pubKeys = {};

        (roles || this.state.roles).forEach(role => {
            let pkey = _keyCachePriv[role] ? _keyCachePriv[role] :  PrivateKey.fromWif( privateKey );
            _keyCachePriv[role] = pkey;

            privKeys[role] = pkey;
            pubKeys[role] = _keyCachePub[role] ? _keyCachePub[role] : pkey.toPublicKey().toString(prefix);

            _keyCachePub[role] = pubKeys[role];
        });

        return {privKeys, pubKeys};
    }

    getPubKeys() {
        return this.state.roles.map(role => {
            return _keyCachePub[role];
        });
    }

    checkKeys({accountName, password, auths, privateKey = null}) {
        if (!accountName || (!password && !privateKey) || !auths) {
            throw new Error("checkKeys: Missing inputs");
        }
        let hasKey = false;
        for (let role in auths) {
            let keys;
            if (password) {
                keys = this.generateKeys(accountName, password, [role]);
            } else if (privateKey) {
                keys = this.fromPrivKey(accountName, privateKey[role], [role]);
            }

            if (keys && Object.keys(keys).length) {
                let {privKeys, pubKeys} = keys;
                    auths[role].forEach(key => {
                        if (key[0] === pubKeys[role]) {
                            hasKey = true;
                            _myKeys[role] = {priv: privKeys[role], pub: pubKeys[role]};
                        }
                    });
                }
            };

        if (hasKey) {
            this.name = accountName;
        }

        this.state.loggedIn = hasKey;

        return hasKey;
    }

    signTransaction(tr, signerPubkeys = {}) {

        let myKeys = {};
        let hasKey = false;

        this.state.roles.forEach(role => {
            let myKey = _myKeys[role];
            if (myKey) {
                if (signerPubkeys[myKey.pub]) {
                    hasKey = true;
                    return;
                }
                hasKey = true;
                signerPubkeys[myKey.pub] = true;
                tr.add_signer(myKey.priv, myKey.pub);
            }
        });

        if (!hasKey) {
            console.error("You do not have any private keys to sign this transaction");
            throw new Error("You do not have any private keys to sign this transaction");
        }
    }
}

module.exports = AccountLogin;
