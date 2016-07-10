const options = {
    // user: "username",
    // pass: "password",
    // url: "ws://127.0.0.1:8090"
    url: "wss://this.piston.rocks"
};

var Api = require("steem-rpc")(options);
console.log("api:", Api);
Api.get().initPromise.then(function(res) {
    console.log("*** Connected to", res, "***");
}).catch(err => {
    console.log("Connection error:", err);
})
