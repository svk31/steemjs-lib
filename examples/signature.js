const options = {
    // user: "username",
    // pass: "password",
    // url: "ws://127.0.0.1:8090"
    url: "wss://this.piston.rocks"
};

var {Client} = require("steem-rpc");
var Api = Client(options);
console.log("api:", Api);
Api.initPromise.then(function(res) {
    console.log("*** Connected to", res, "***");
}).catch(err => {
    console.log("Connection error:", err);
})
