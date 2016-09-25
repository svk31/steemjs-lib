var ChainTypes = {};

ChainTypes.operations= {
    vote: 0,
    comment: 1,
    transfer: 2,
    transfer_to_vesting: 3,
    withdraw_vesting: 4,
    limit_order_create: 5,
    limit_order_cancel: 6,
    feed_publish: 7,
    convert: 8,
    account_create: 9,
    account_update: 10,
    witness_update: 11,
    account_witness_vote: 12,
    account_witness_proxy: 13,
    pow: 14,
    custom: 15,
    report_over_production: 16,
    delete_comment: 17,
    custom_json: 18,
    comment_options: 19,
    set_withdraw_vesting_route: 20,
    fill_convert_request: 21,
    author_reward: 22,
    curation_reward: 23,
    liquidity_reward: 24,
    interest: 25,
    fill_vesting_withdraw: 26,
    fill_order: 27,
    comment_payout: 28,
    escrow_transfer: 29,
    escrow_approve: 30,
    escrow_dispute: 31,
    escrow_release: 32
};

module.exports = ChainTypes;
