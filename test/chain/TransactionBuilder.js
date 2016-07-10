const options = {
    // user: "username",
    // pass: "password",
    // url: "ws://127.0.0.1:8090"
    apis: ["database_api", "network_broadcast_api"],
    url: "wss://this.piston.rocks"
};

var SteemRPC = require('steem-rpc')(options);
SteemRPC.close();
var Api = SteemRPC.get();
var { TransactionBuilder, Login } = require("../../lib/chain");

var {accountName, password} = require("./config.js");

console.log(accountName, password);
let account;

describe("TransactionBuilder", function() {

    before(function() {
        return Api.initPromise.then(function(res) {
            console.log("*** Connected to", res, "***");
            return Api.database_api().exec("get_accounts", [[ accountName]]).then(function(res) {

                account = res[0];
                Login.setRoles(["posting"]);
                Login.checkKeys({
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

    it("Add signer", function() {
        let tr = new TransactionBuilder();
        tr.add_type_operation("vote", {
            voter: accountName,
            author: "seshadga",
            permlink: "bitcoin-price-sustainability-looks-on-track",
            weight: 10000
        });

        Login.signTransaction(tr);
    })

    it("Process transaction", function() {

        let tr = new TransactionBuilder();
        tr.add_type_operation("vote", {
            voter: accountName,
            author: "seshadga",
            permlink: "bitcoin-price-sustainability-looks-on-track",
            weight: 10000
        });

        tr.process_transaction(Login, null, false);
    })

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
