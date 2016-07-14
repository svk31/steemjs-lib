var types = require("./types");
var SerializerImpl = require("./serializer");

var {
    //id_type,
    //varint32,
    int16, uint16, uint32, int64, uint64,
    string, bytes, bool, array, fixed_array,
    object_id_type, vote_id,
    future_extensions,
    static_variant, map, set,
    public_key, address,
    time_point_sec,
    optional
} = types;

future_extensions = types.void;

/*
When updating generated code
Replace:  operation = static_variant [
with:     operation.st_operations = [

at the end of this file.

Then, delete this part:
public_key = new Serializer(
    "public_key"
    key_data: bytes 33
)

*/
// Place-holder, their are dependencies on "operation" .. The final list of
// operations is not avialble until the very end of the generated code.
// See: operation.st_operations = ...
var operation = static_variant();
module.exports["operation"] = operation;

// For module.exports
var Serializer=function(operation_name, serilization_types_object){
    var s = new SerializerImpl(operation_name, serilization_types_object);
    return module.exports[operation_name] = s;
}

// Custom-types follow Generated code:

// ##  Generated code follows
// # npm i -g decaffeinate
// # programs/js_operation_serializer > ops.coffee && decaffeinate ops.coffee
// # open ops.txt, copy to Chain/ChainTypes and operations.js
// ## -------------------------------
let signed_transaction = new Serializer(
    "signed_transaction",{
    ref_block_num: uint16,
    ref_block_prefix: uint32,
    expiration: time_point_sec,
    operations: array(operation),
    extensions: set(future_extensions),
    signatures: array(bytes(65))
}
);

let signed_block = new Serializer(
    "signed_block",{
    previous: bytes(20),
    timestamp: time_point_sec,
    witness: string,
    transaction_merkle_root: bytes(20),
    extensions: set(future_extensions),
    witness_signature: bytes(65),
    transactions: array(signed_transaction)
}
);

let block_header = new Serializer(
    "block_header",{
    previous: bytes(20),
    timestamp: time_point_sec,
    witness: string,
    transaction_merkle_root: bytes(20),
    extensions: set(future_extensions)
}
);

let signed_block_header = new Serializer(
    "signed_block_header",{
    previous: bytes(20),
    timestamp: time_point_sec,
    witness: string,
    transaction_merkle_root: bytes(20),
    extensions: set(future_extensions),
    witness_signature: bytes(65)
}
);

let vote = new Serializer(
    "vote",{
    voter: string,
    author: string,
    permlink: string,
    weight: uint16
}
);

let comment = new Serializer(
    "comment",{
    parent_author: string,
    parent_permlink: string,
    author: string,
    permlink: string,
    title: string,
    body: string,
    json_metadata: string
}
);

let asset = new Serializer(
    "asset",{
    amount: int64,
    symbol: string
}
);

let transfer = new Serializer(
    "transfer",{
    from: string,
    to: string,
    amount: asset,
    memo: string
}
);

let transfer_to_vesting = new Serializer(
    "transfer_to_vesting",{
    from: string,
    to: string,
    amount: asset
}
);

let withdraw_vesting = new Serializer(
    "withdraw_vesting",{
    account: string,
    vesting_shares: asset
}
);

let limit_order_create = new Serializer(
    "limit_order_create",{
    owner: string,
    orderid: uint32,
    amount_to_sell: asset,
    min_to_receive: asset,
    fill_or_kill: bool,
    expiration: time_point_sec
}
);

let limit_order_cancel = new Serializer(
    "limit_order_cancel",{
    owner: string,
    orderid: uint32
}
);

let price = new Serializer(
    "price",{
    base: asset,
    quote: asset
}
);

let feed_publish = new Serializer(
    "feed_publish",{
    publisher: string,
    exchange_rate: price
}
);

let convert = new Serializer(
    "convert",{
    owner: string,
    requestid: uint32,
    amount: asset
}
);

let authority = new Serializer(
    "authority",{
    weight_threshold: uint32,
    account_auths: map((string), (uint16)),
    key_auths: map((public_key), (uint16))
}
);

let account_create = new Serializer(
    "account_create",{
    fee: asset,
    creator: string,
    new_account_name: string,
    owner: authority,
    active: authority,
    posting: authority,
    memo_key: public_key,
    json_metadata: string
}
);

let account_update = new Serializer(
    "account_update",{
    account: string,
    owner: optional(authority),
    active: optional(authority),
    posting: optional(authority),
    memo_key: public_key,
    json_metadata: string
}
);

let chain_properties = new Serializer(
    "chain_properties",{
    account_creation_fee: asset,
    maximum_block_size: uint32,
    sbd_interest_rate: uint16
}
);

let witness_update = new Serializer(
    "witness_update",{
    owner: string,
    url: string,
    block_signing_key: public_key,
    props: chain_properties,
    fee: asset
}
);

let account_witness_vote = new Serializer(
    "account_witness_vote",{
    account: string,
    witness: string,
    approve: bool
}
);

let account_witness_proxy = new Serializer(
    "account_witness_proxy",{
    account: string,
    proxy: string
}
);

let pow = new Serializer(
    "pow",{
    worker: public_key,
    input: bytes(32),
    signature: bytes(65),
    work: bytes(32)
}
);

let custom = new Serializer(
    "custom",{
    required_auths: set(string),
    id: uint16,
    data: bytes()
}
);

let report_over_production = new Serializer(
    "report_over_production",{
    reporter: string,
    first_block: signed_block_header,
    second_block: signed_block_header
}
);

let delete_comment = new Serializer(
    "delete_comment",{
    author: string,
    permlink: string
}
);

let custom_json = new Serializer(
    "custom_json",{
    required_auths: set(string),
    required_posting_auths: set(string),
    id: string,
    json: string
}
);

let comment_options = new Serializer(
    "comment_options",{
    author: string,
    permlink: string,
    max_accepted_payout: asset,
    percent_steem_dollars: uint16,
    allow_votes: bool,
    allow_curation_rewards: bool,
    extensions: set(static_variant([
        future_extensions
    ]))
}
);

let set_withdraw_vesting_route = new Serializer(
    "set_withdraw_vesting_route",{
    from_account: string,
    to_account: string,
    percent: uint16,
    auto_vest: bool
}
);

let fill_convert_request = new Serializer(
    "fill_convert_request",{
    owner: string,
    requestid: uint32,
    amount_in: asset,
    amount_out: asset
}
);

let comment_reward = new Serializer(
    "comment_reward",{
    author: string,
    permlink: string,
    sbd_payout: asset,
    vesting_payout: asset
}
);

let curate_reward = new Serializer(
    "curate_reward",{
    curator: string,
    reward: asset,
    comment_author: string,
    comment_permlink: string
}
);

let liquidity_reward = new Serializer(
    "liquidity_reward",{
    owner: string,
    payout: asset
}
);

let interest = new Serializer(
    "interest",{
    owner: string,
    interest: asset
}
);

let fill_vesting_withdraw = new Serializer(
    "fill_vesting_withdraw",{
    from_account: string,
    to_account: string,
    withdrawn: asset,
    deposited: asset
}
);

let fill_order = new Serializer(
    "fill_order",{
    current_owner: string,
    current_orderid: uint32,
    current_pays: asset,
    open_owner: string,
    open_orderid: uint32,
    open_pays: asset
}
);

let comment_payout = new Serializer(
    "comment_payout",{
    author: string,
    permlink: string,
    payout: asset
}
);

operation.st_operations =[
    vote,
    comment,
    transfer,
    transfer_to_vesting,
    withdraw_vesting,
    limit_order_create,
    limit_order_cancel,
    feed_publish,
    convert,
    account_create,
    account_update,
    witness_update,
    account_witness_vote,
    account_witness_proxy,
    pow,
    custom,
    report_over_production,
    delete_comment,
    custom_json,
    comment_options,
    set_withdraw_vesting_route,
    fill_convert_request,
    comment_reward,
    curate_reward,
    liquidity_reward,
    interest,
    fill_vesting_withdraw,
    fill_order,
    comment_payout
];

let transaction = new Serializer(
    "transaction",
    {
        ref_block_num: uint16,
        ref_block_prefix: uint32,
        expiration: time_point_sec,
        operations: array(operation),
        extensions: set(future_extensions)
})

//# -------------------------------
//#  Generated code end
//# -------------------------------
