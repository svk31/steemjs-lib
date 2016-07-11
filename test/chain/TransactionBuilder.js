const options = {
    // user: "username",
    // pass: "password",
    // url: "ws://127.0.0.1:8090",
    apis: ["database_api", "network_broadcast_api"],
    url: "wss://this.piston.rocks"
};

var {Client} = require('steem-rpc');
var Api = Client.get(options, true);
var { TransactionBuilder, Login } = require("../../lib/chain");

var {accountName : passAccount, password} = require("./config.js").withPassword;
var {accountName : keyAccount, keys, auths : keyAuths} = require("./config.js").withKey;

let account;

var login = new Login();

describe("TransactionBuilder", function() {

    before(function() {
        return Api.initPromise.then(function(res) {
            return Api.database_api().exec("get_accounts", [[ passAccount]]).then(function(res) {
                account = res[0];
                login.setRoles(["posting"]);
                login.checkKeys({
                    accountName: passAccount,
                    password: password,
                    auths: {
                        owner: account.owner.key_auths,
                        active: account.active.key_auths,
                        posting: account.posting.key_auths
                    }}
                );
            });
        });
    });

    it("Instantiates", function() {
        let tr = new TransactionBuilder();
    });
    //
    it("Add vote operation", function() {
        let tr = new TransactionBuilder();
        tr.add_type_operation("vote", {
            voter: passAccount,
            author: "seshadga",
            permlink: "bitcoin-price-sustainability-looks-on-track",
            weight: 10000
        });
    });

    it("Add signer and sign with password login", function(done) {
        let tr = new TransactionBuilder();
        tr.add_type_operation("vote", {
            voter: passAccount,
            author: "seshadga",
            permlink: "bitcoin-price-sustainability-looks-on-track",
            weight: 10000
        });

        login.signTransaction(tr);
        return tr.finalize().then(() => {
            tr.sign();
            done();
        }).catch(done)
    });

    it("Add signer with key login", function() {
        let loginKey = new Login();
        loginKey.checkKeys({
            accountName: keyAccount,
            password: null,
            privateKey: keys.posting,
            auths: keyAuths
        });

        let tr = new TransactionBuilder();
        tr.add_type_operation("vote", {
            voter: keyAccount,
            author: "seshadga",
            permlink: "bitcoin-price-sustainability-looks-on-track",
            weight: 10000
        });

        loginKey.signTransaction(tr);
    });

    it("Sign with key login", function(done) {
        let loginKey = new Login();
        loginKey.checkKeys({
            accountName: keyAccount,
            password: null,
            privateKey: keys.posting,
            auths: keyAuths
        });

        let tr = new TransactionBuilder();
        tr.add_type_operation("vote", {
            voter: keyAccount,
            author: "seshadga",
            permlink: "bitcoin-price-sustainability-looks-on-track",
            weight: 10000
        });

        loginKey.signTransaction(tr);
        return tr.finalize().then(() => {
            tr.sign();
            done();
        }).catch(done)

    });

    it("Process transaction", function() {

        let tr = new TransactionBuilder();
        tr.add_type_operation("vote", {
            voter: passAccount,
            author: "seshadga",
            permlink: "bitcoin-price-sustainability-looks-on-track",
            weight: 10000
        });

        tr.process_transaction(login, null, false);
    });

    // it("Broadcast transaction with key login", function(done) {
    //     this.timeout = 6000;
    //     let loginKey = new Login();
    //     loginKey.checkKeys({
    //         accountName: keyAccount,
    //         password: null,
    //         privateKey: keys.posting,
    //         auths: keyAuths
    //     });
    //
    //     let tr = new TransactionBuilder();
    //     tr.add_type_operation("vote", {
    //         voter: keyAccount,
    //         author: "seshadga",
    //         permlink: "bitcoin-price-sustainability-looks-on-track",
    //         weight: 100
    //     });
    //
    //     return tr.process_transaction(loginKey, null, true)
    //     .then(res => {
    //         console.log("res:", res);
    //         done();
    //     })
    //     .catch(done);
    // })



    // it("Broadcast transaction", function(done) {
    //
    //     let tr = new TransactionBuilder();
    //     tr.add_type_operation("vote", {
    //         voter: passAccount,
    //         author: "seshadga",
    //         permlink: "bitcoin-price-sustainability-looks-on-track",
    //         weight: 100
    //     });
    //
    // return tr.process_transaction(login, null, true)
    // .then(res => {
    //     console.log("res:", res);
    //     done();
    // })
    // .catch(done);
    // })


});
