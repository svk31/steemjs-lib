# SteemJS (steemjs-lib)

Pure JavaScript Steem crypto library for node.js and browsers. Can be used to construct, sign and broadcast transactions in JavaScript.

[![npm version](https://img.shields.io/npm/v/steemjs-lib.svg?style=flat-square)](https://www.npmjs.com/package/steemjs-lib)
[![npm downloads](https://img.shields.io/npm/dm/steemjs-lib.svg?style=flat-square)](https://www.npmjs.com/package/steemjs-lib)

## Setup

This library can be obtained through npm:
```
npm install steemjs-lib
```

DISCLAIMER: This is a work in progress and most likely there will be bugs. Please file issues if you encounter any problems.

The source code uses ES6 syntax but the npm library is transpiled to regular ES5 and can be used without Babel.

## Tests
There's a quite extensive suite of tests that can be run using `npm run test`. These tests cover many different use cases and can be used as a reference point.

## Usage

Three sub-libraries are included: `ECC`, `Chain` and `Serializer`. Generally only the `ECC` and `Chain` libraries need to be used directly.

### API setup
When constructing a Steem transaction and also when verifying the password/private key of an account, some data from the blockchain is required. Because of this, `steemjs-lib` includes a dependency on [steem-rpc](https://github.com/svk31/steem-rpc), which is a websocket API library for connecting to Steem API servers. Before attempting to broadcast a transaction you will need to initialise this library. By default it will connect to a public API server provided by [xeroc and jesta](https://steemit.com/steemws/@jesta/steem-ws-the-public-steem-api-cluster), but you can change this in the options if you prefer to use your own server.

To initialise the API library, use the following code:

```
var options = {};
var {Client} = require('steem-rpc');
var Api = Client.get(options, true);
Api.initPromise.then(response => {
    console.log("Api ready:", response);
})
```

In a browser the syntax is slightly different:

```
var options = {};
var Client = window.steemJS.steemRPC.Client;
var Api = Client.get(options, true);
Api.initPromise.then(response => {
    console.log("Api ready:", response);
})
```

More details on the possible options can be found in the README of `steem-rpc`.

Once the init promise has been resolved, the API connection is ready and you can start using the transaction builder.

### Chain
The Chain library contains utility functions related to the chain state, as well as a transaction builder and a login class.

#### Transaction builder
The transaction builder can be used to construct any transaction, sign it, and broadcast it. To broadcast a transaction you need to be connected to a `steemd` node with the `network_broadcast_api` enabled.

For an example of how to create transaction, see below:

```
// First generate the private key using the Login class
var { TransactionBuilder, Login } = require("steemjs-lib");
var login = new Login();
login.setRoles(["posting"]);
var loginSuccess = login.checkKeys({
    accountName: "myacccount",
    password: "mypassword",
    auths: {
        posting: [["STMpostingAuthKey", 1]]
    }}
);

if (!loginSuccess) {
    throw new Error("The password or account name was incorrect");
}    
// Then create the transaction and sign it without broadcasting
var tr = new TransactionBuilder();
tr.add_type_operation("vote", {
    voter: "myaccount,
    author: "seshadga",
    permlink: "bitcoin-price-sustainability-looks-on-track",
    weight: 100
});

tr.process_transaction(login, null, false);
```

The third argument of `process_transaction` is `broadcast`. Setting it to false will simply construct the transaction and serialize it, without broadcasting it. If you want it to broadcast immediately, set it to `true`.

#### Operation types
For a list of possible operation types with their required and optional inputs, see this file: [operations.js](https://github.com/svk31/steemjs-lib/blob/master/lib/serializer/src/operations.js).

#### Login
The Chain library includes the Login class that can be used to "log in" using an account name and a corresponding password or private key. Logging in here simply means verifying that the private key or password provided can be used to generate the private key for that account. The verification checks the public keys of the given account.

The password used on [https://steemit.com](https://steemit.com) is compatible with this library. To run the Login tests, copy config.example.js and create a config.js. In this file you must provide two accounts, one with a password and one with a private key. The corresponding public keys can be found on [https://steemd.com](https://steemd.com).

The Login class uses the following format to generate private keys from account names and passwords:

```
keySeed = accountName + role + password
```
Where `role` can be one of `active, owner, posting, memo`.

Using this seed, private keys are generated for either the default roles `active, owner, posting, memo`, or as specified. A minimum password length of 12 characters is enforced, but an even longer password is recommended. Three methods are provided:

```
generateKeys(account, password, [roles])
fromPrivKey(accountName, privateKey, [roles])
checkKeys({accountName, password, privateKey, auths})
signTransaction(tr)
getRoles()
setRoles([roles])
```

The auths object should contain the auth arrays from the account object. An example is this:

```
{
    active: [
        ["GPH5Abm5dCdy3hJ1C5ckXkqUH2Me7dXqi9Y7yjn9ACaiSJ9h8r8mL", 1]
    ]
}
```

If checkKeys is successful, you can use signTransaction to sign a TransactionBuilder transaction using the private keys for that account.

### ECC
The ECC library contains all the crypto functions for private and public keys as well as transaction creation/signing.

#### Private keys
As a quick example, here's how to generate a new private key from a seed (a brainkey for example):

```
var {PrivateKey, key} = require("steemjs-lib");

let seed = "THIS IS A TERRIBLE BRAINKEY SEED WORD SEQUENCE";
let pkey = PrivateKey.fromSeed( key.normalize_brainKey(seed) );

console.log("\nPrivate key:", pkey.toWif());
console.log("Public key :", pkey.toPublicKey().toString(), "\n");
```
