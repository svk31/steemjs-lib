module.exports = {
    withPassword: {
        accountName: "someaccount",
        password: "somepassword",
        auths: {
            active: [
                ["STMpublickeyforsomeaccount", 1]
            ]
        }
    },
    withKey: {
        accountName: "anotheraccount",
        keys: {
            posting: "5K8privatekeyforanotheraccount"
        },
        auths: {
            posting: [
                ["STMpublickeyforanotheraccount", 1]
            ]
        }
    }
};
