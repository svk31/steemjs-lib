var _this;

var ecc_config = {
    address_prefix: "STM"
};

module.exports = _this = {
    core_asset: "STEEM",
    vest_asset: "VESTS",
    dollar_asset: "SBD",
    address_prefix: "STM",
    expire_in_secs: 15,
    expire_in_secs_proposal: 24 * 60 * 60,
    networks: {
        Steem: {
            core_asset: "STEEM",
            address_prefix: "STM",
            chain_id: "0000000000000000000000000000000000000000000000000000000000000000"
        }
    },
    /** Set a few properties for known chain IDs. */
    setChainId: function(chain_id) {

        var i, len, network, network_name, ref;
        ref = Object.keys(_this.networks);

        for (i = 0, len = ref.length; i < len; i++) {

            network_name = ref[i];
            network = _this.networks[network_name];

            if (network.chain_id === chain_id) {

                _this.network_name = network_name;

                if (network.address_prefix) {
                    _this.address_prefix = network.address_prefix;
                    ecc_config.address_prefix = network.address_prefix;
                }

                // console.log("INFO    Configured for", network_name, ":", network.core_asset, "\n");

                return {
                    network_name: network_name,
                    network: network
                }
            }
        }

        if (!_this.network_name) {
            console.log("Unknown chain id (this may be a testnet)", chain_id);
        }

    },

    reset: function() {
        _this.core_asset = "STEEM";
        _this.address_prefix = "STM";
        ecc_config.address_prefix = "STM";
        _this.expire_in_secs = 15;
        _this.expire_in_secs_proposal = 24 * 60 * 60;

        console.log("Chain config reset");
    },

    setPrefix: function(prefix = "STM") {
        _this.address_prefix = prefix;
        ecc_config.address_prefix = prefix;
    }
}
