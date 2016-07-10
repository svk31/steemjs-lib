const options = {
    // user: "username",
    // pass: "password",
    url: "ws://127.0.0.1:8090",
    apis: ["database_api", "network_broadcast_api"]
    // url: "wss://this.piston.rocks"
};

var {Client} = require('steem-rpc');
var Api = Client.get(options);
var { TransactionBuilder, Login } = require("../../lib/chain");

var {accountName, password} = require("./config.js").withPassword;
var {accountName : keyAccount, keys, auths : keyAuths} = require("./config.js").withKey;

console.log("accountName:", accountName, password, keyAuths);
let account;

var login = new Login();

describe("TransactionBuilder", function() {

    before(function() {
        return Api.initPromise.then(function(res) {
            return Api.database_api().exec("get_accounts", [[ accountName]]).then(function(res) {
                account = res[0];
                login.setRoles(["posting"]);
                login.checkKeys({
                    accountName: accountName,
                    password: password,
                    auths: {
                        owner: account.owner.key_auths,
                        active: account.active.key_auths,
                        posting: account.posting.key_auths
                    }}
                );
            });
        })
    })

    it("Instantiates", function() {
        let tr = new TransactionBuilder();
    });
    //
    it("Add vote operation", function() {
        let tr = new TransactionBuilder();
        tr.add_type_operation("vote", {
            voter: accountName,
            author: "seshadga",
            permlink: "bitcoin-price-sustainability-looks-on-track",
            weight: 10000
        });
    });

    it("Add signer with password login", function() {
        let tr = new TransactionBuilder();
        tr.add_type_operation("vote", {
            voter: accountName,
            author: "seshadga",
            permlink: "bitcoin-price-sustainability-looks-on-track",
            weight: 10000
        });

        login.signTransaction(tr);
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

    it("Process transaction", function() {

        let tr = new TransactionBuilder();
        tr.add_type_operation("vote", {
            voter: accountName,
            author: "seshadga",
            permlink: "bitcoin-price-sustainability-looks-on-track",
            weight: 10000
        });

        tr.process_transaction(login, null, false);
    });



    // it("Broadcast transaction", function() {
    //
    //     let tr = new TransactionBuilder();
    //     tr.add_type_operation("vote", {
    //         voter: accountName,
    //         author: "seshadga",
    //         permlink: "bitcoin-price-sustainability-looks-on-track",
    //         weight: 100
    //     });
    //
    //     tr.process_transaction(Login, null, true);
    // })


});
