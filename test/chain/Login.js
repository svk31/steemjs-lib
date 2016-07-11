var assert = require("assert");

var Login = require("../../lib/chain/src/AccountLogin");

var login = new Login();
var login2 = new Login();

var auths = {
    active: [
        ["STM5Abm5dCdy3hJ1C5ckXkqUH2Me7dXqi9Y7yjn9ACaiSJ9h8r8mL", 1]
    ]
}

var {accountName, keys, auths: keyAuths} = require("./config.js").withKey;
// console.log("accountName:", accountName, "keys:", keys);

describe("AccountLogin", () => {

    afterEach(function() {
        login.setRoles(["active", "owner", "memo"]);
    });

    describe("Instance", function() {
        it ("Instantiates with default roles", function() {
            let roles = login.getRoles();

            assert(roles.length );
            assert(roles[0] === "active");
            assert(roles[1] === "owner");
            assert(roles[2] === "posting");
            assert(roles[3] === "memo");
        });

        it ("Is not singleton", function() {
            login.setRoles(["singleton"]);

            let roles = login2.getRoles();
            assert(roles.length === 4  );
            assert(roles[0] !== "singleton");
        });
    });

    describe("Methods", function() {

        it ("Set roles", function() {
            login.setRoles(["active"]);
            let roles = login.getRoles();

            assert(roles.length === 1 );
            assert(roles[0] === "active" );
        });

        it ("Requires 12 char password", function() {
            assert.throws(login.generateKeys, Error);
        });

        it ("Generate keys with no role input", function() {
            let {privKeys, pubKeys} = login.generateKeys("someaccountname", "somereallylongpassword");

            assert(Object.keys(privKeys).length === 3);
            assert(Object.keys(pubKeys).length === 3);
        });

        it ("Generate keys with role input", function() {
            let {privKeys, pubKeys} = login.generateKeys("someaccountname", "somereallylongpassword", ["active"]);

            assert(privKeys.active);
            assert(Object.keys(privKeys).length === 1);
            assert(Object.keys(pubKeys).length === 1);
        });

        it ("Generate keys from key", function() {
            let keyLogin = new Login();
            let {privKeys, pubKeys} = keyLogin.fromPrivKey(accountName, keys.posting, ["posting"]);

            assert(privKeys.posting);
            assert.equal(Object.keys(privKeys).length, 1);
            assert.equal(Object.keys(pubKeys).length, 1);
            assert.equal(pubKeys.posting, keyAuths.posting[0][0]);
        });

        it ("Check keys from password", function() {
            let success = login.checkKeys({
                accountName: "someaccountname",
                password: "somereallylongpassword",
                auths: auths
            });

            assert(true, success);
        });

        it ("Check keys from privKey", function() {
            let loginKey = new Login();
            let success = loginKey.checkKeys({
                accountName: accountName,
                password: null,
                privateKey: keys.posting,
                auths: keyAuths
            });

            assert(true, success);
        });
    })

});
