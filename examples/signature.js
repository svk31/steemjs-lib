const options = {
    // user: "username",
    // pass: "password",
    // url: "ws://127.0.0.1:8090"
    url: "wss://node.steem.ws"
};

var {Client} = require("steem-rpc");
var Api = Client(options);
console.log("api:", Api);
Api.initPromise.then(function(res) {
    console.log("*** Connected to", res, "***");
}).catch(err => {
    console.log("Connection error:", err);
})
