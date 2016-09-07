const options = {
    // user: "username",
    // pass: "password",
    // url: "ws://127.0.0.1:8090",
    apis: ["database_api", "network_broadcast_api"],
    url: "wss://node.steem.ws"
};

var {Client} = require('steem-rpc');
var Api = Client.get(options, true);
var { TransactionBuilder, Login } = require("../../lib/chain");

var {accountName : passAccount, password} = require("./config.js").withPassword;
var {accountName : keyAccount, keys, auths : keyAuths} = require("./config.js").withKey;

let account;

var postingLogin = new Login();
var activeLogin = new Login();

describe("TransactionBuilder", function() {

    before(function() {
        return Api.initPromise.then(function(res) {
            return Api.database_api().exec("get_accounts", [[ passAccount]]).then(function(res) {
                account = res[0];
                postingLogin.setRoles(["posting"]);
                postingLogin.checkKeys({
                    accountName: passAccount,
                    password: password,
                    auths: {
                        posting: account.posting.key_auths
                    }}
                );

                activeLogin.setRoles(["active"]);
                console.log("active roles:", activeLogin.getRoles());
                activeLogin.checkKeys({
                    accountName: passAccount,
                    password: password,
                    auths: {
                        active: account.active.key_auths
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

        tr.process_transaction(postingLogin, null, false);
    });

    it("Add transfer operation", function(done) {
        let tr = new TransactionBuilder();
        tr.add_type_operation("transfer", {
            from: passAccount,
            to: "svk",
            amount: "0.001 SBD",
            memo: new Buffer("Test transfer operation", "utf8")
        });

        tr.process_transaction(activeLogin, null, true).then(res => {
            done();
        })
    });

    it("Add signer and sign with password postingLogin", function(done) {
        let tr = new TransactionBuilder();
        tr.add_type_operation("vote", {
            voter: passAccount,
            author: "seshadga",
            permlink: "bitcoin-price-sustainability-looks-on-track",
            weight: 10000
        });

        postingLogin.signTransaction(tr);
        return tr.finalize().then(() => {
            tr.sign();
            done();
        }).catch(done)
    });

    it("Process transaction propagate error", function(done) {
        let tr = new TransactionBuilder();

        // The voter account should be an account for which you do not have the keys, this will cause the broadcast to fail
        tr.add_type_operation("vote", {
            voter: "svk",
            author: "seshadga",
            permlink: "bitcoin-price-sustainability-looks-on-track",
            weight: 10000
        });

        postingLogin.signTransaction(tr);
        return tr.process_transaction(postingLogin, null, true)
        .catch((err) => {
            done();
        })
    });

    it("Add signer with key postingLogin", function() {
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

    it("Sign with key postingLogin", function(done) {
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

        tr.process_transaction(postingLogin, null, false);
    });

    it("Update account posting key", function(done) {
        let updateLogin = new Login();
        updateLogin.setRoles(["active"]);
        let success = updateLogin.checkKeys({
            accountName: passAccount,
            password: password,
            auths: {
                active: account.active.key_auths
            }}
        );
        let tr = new TransactionBuilder();

        let postingAuth = account.posting;
        let index, hasStreemian;

        postingAuth.account_auths.forEach((auth, i) => {
            if (auth[0] === "streemian") {
                index = i;
                hasStreemian = true;
            }
        });
        if (!hasStreemian) {
            postingAuth.account_auths.push(["streemian", 1]);
        } else {
            postingAuth.account_auths.splice(index, 1);
        }
        tr.add_type_operation("account_update", {
            account: passAccount,
            posting: postingAuth,
            memo_key: account.memo_key,
            json_metadata: account.json_metadata
        });

        tr.process_transaction(updateLogin, null, true).then(function(res) {
            done()
        })
    });

    // it("Broadcast transaction with key postingLogin", function(done) {
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
    // return tr.process_transaction(postingLogin, null, true)
    // .then(res => {
    //     console.log("res:", res);
    //     done();
    // })
    // .catch(done);
    // })


});
