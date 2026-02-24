/**
 * Data Table — Column configs, search fields, endpoint metadata.
 * Columns match backend model fields exactly.
 */

const LOTTERY_OPTIONS = [
  { value: '', text: '--' },
  { value: '67', text: 'Sicbo 30s' }, { value: '66', text: 'Sicbo 20s' },
  { value: '68', text: 'Sicbo 40s' }, { value: '69', text: 'Sicbo 50s' },
  { value: '70', text: 'Sicbo 1m' }, { value: '71', text: 'Sicbo 1.5m' },
  { value: '73', text: 'Win go 45s' }, { value: '74', text: 'Win go 1m' },
  { value: '75', text: 'Win go 3m' }, { value: '76', text: 'Win go 5m' }, { value: '77', text: 'Win go 30s' },
  { value: '51', text: 'Keno VIP 20s' }, { value: '52', text: 'Keno VIP 30s' },
  { value: '53', text: 'Keno VIP 40s' }, { value: '54', text: 'Keno VIP 50s' },
  { value: '55', text: 'Keno VIP 1m' }, { value: '56', text: 'Keno VIP 5m' },
  { value: '32', text: 'Miền Bắc' }, { value: '63', text: 'XS Miền Bắc' },
  { value: '46', text: 'M.Bắc nhanh 3m' }, { value: '45', text: 'M.Bắc nhanh 5m' },
  { value: '47', text: 'M.Bắc VIP 45s' }, { value: '48', text: 'M.Bắc VIP 75s' }, { value: '49', text: 'M.Bắc VIP 2m' },
  { value: '44', text: 'M.Nam VIP 5m' }, { value: '57', text: 'M.Nam VIP 45s' },
  { value: '58', text: 'M.Nam VIP 1m' }, { value: '59', text: 'M.Nam VIP 90s' }, { value: '60', text: 'M.Nam VIP 2m' }
]

/** Column configs — field names match backend SQLAlchemy models */
export const ENDPOINT_COLS = {
  // Model: Member (sync/member/model.py) — 35 columns
  members: [
    { field: 'username', title: 'Username', minWidth: 150, fixed: 'left' },
    { field: 'id', title: 'ID', minWidth: 90 },
    { field: 'agent_id', title: 'Agent ID', minWidth: 90 },
    { field: 'user_parent', title: 'Parent ID', minWidth: 100 },
    { field: 'user_tree', title: 'User Tree', minWidth: 200 },
    { field: 'type', title: 'Type', minWidth: 80 },
    { field: 'agent_type', title: 'Agent Type', minWidth: 90 },
    { field: 'level', title: 'Level', minWidth: 80 },
    { field: 'group_id', title: 'Group', minWidth: 80 },
    { field: 'status', title: 'Status', minWidth: 80 },
    { field: 'is_tester', title: 'Tester', minWidth: 80 },
    { field: 'truename', title: 'Real Name', minWidth: 150 },
    { field: 'phone', title: 'Phone', minWidth: 120 },
    { field: 'phone_verified', title: 'Phone Verified', minWidth: 110 },
    { field: 'phone_verified_time', title: 'Phone Verify Time', minWidth: 160 },
    { field: 'email', title: 'Email', minWidth: 200 },
    { field: 'email_verified', title: 'Email Verified', minWidth: 110 },
    { field: 'invite_code', title: 'Invite Code', minWidth: 120 },
    { field: 'money', title: 'Balance', minWidth: 130, sort: true },
    { field: 'deposit_times', title: 'Dep#', minWidth: 80 },
    { field: 'deposit_money', title: 'Total Dep', minWidth: 130, sort: true },
    { field: 'withdrawal_times', title: 'Wd#', minWidth: 80 },
    { field: 'withdrawal_money', title: 'Total Wd', minWidth: 130, sort: true },
    { field: 'first_deposit_time', title: 'First Dep Time', minWidth: 160 },
    { field: 'device', title: 'Device', minWidth: 100 },
    { field: 'useragent', title: 'User Agent', minWidth: 250 },
    { field: 'login_ip', title: 'Login IP', minWidth: 140 },
    { field: 'register_ip', title: 'Register IP', minWidth: 140 },
    { field: 'login_time', title: 'Last Login', minWidth: 160, sort: true },
    { field: 'register_time', title: 'Register Time', minWidth: 160, sort: true },
    { field: 'create_time', title: 'Created', minWidth: 160 },
    { field: 'update_time', title: 'Updated', minWidth: 160 },
    { field: 'remark', title: 'Remark', minWidth: 180 },
    { field: 'note', title: 'Note', minWidth: 180 }
  ],
  // Model: InviteList (sync/config/model.py) — 15 columns
  invites: [
    { field: 'invite_code', title: 'Invite Code', minWidth: 150, fixed: 'left' },
    { field: 'id', title: 'ID', minWidth: 90 },
    { field: 'uid', title: 'UID', minWidth: 90 },
    { field: 'agent_id', title: 'Agent ID', minWidth: 90 },
    { field: 'user_type', title: 'User Type', minWidth: 100 },
    { field: 'group_id', title: 'Group', minWidth: 80 },
    { field: 'reg_count', title: 'Reg Count', minWidth: 100, sort: true },
    { field: 'scope_reg_count', title: 'Scope Reg', minWidth: 100 },
    { field: 'recharge_count', title: 'Recharge#', minWidth: 100, sort: true },
    { field: 'first_recharge_count', title: 'First Recharge#', minWidth: 130 },
    { field: 'register_recharge_count', title: 'Reg Recharge#', minWidth: 130 },
    { field: 'rebate_arr', title: 'Rebate Array', minWidth: 200 },
    { field: 'remark', title: 'Remark', minWidth: 150 },
    { field: 'create_time', title: 'Created', minWidth: 160, sort: true },
    { field: 'update_time', title: 'Updated', minWidth: 160 }
  ],
  // Model: BetLottery (sync/bet/model.py) — 35 columns
  bets: [
    { field: 'serial_no', title: 'Serial No', minWidth: 200, fixed: 'left' },
    { field: 'id', title: 'ID', minWidth: 90 },
    { field: 'uid', title: 'UID', minWidth: 90 },
    { field: 'username', title: 'Username', minWidth: 140 },
    { field: 'agent_id', title: 'Agent ID', minWidth: 90 },
    { field: 'user_parent', title: 'Parent ID', minWidth: 100 },
    { field: 'user_tree', title: 'User Tree', minWidth: 200 },
    { field: 'lottery_name', title: 'Lottery', minWidth: 140 },
    { field: 'lottery_id', title: 'Lottery ID', minWidth: 90 },
    { field: 'issue', title: 'Issue', minWidth: 130 },
    { field: 'issue_id', title: 'Issue ID', minWidth: 90 },
    { field: 'play_id', title: 'Play ID', minWidth: 90 },
    { field: 'play_type_id', title: 'Play Type ID', minWidth: 100 },
    { field: 'odds_id', title: 'Odds ID', minWidth: 90 },
    { field: 'odds', title: 'Odds', minWidth: 90 },
    { field: 'content', title: 'Bet Content', minWidth: 150 },
    { field: 'count', title: 'Count', minWidth: 80 },
    { field: 'real_count', title: 'Real Count', minWidth: 90 },
    { field: 'price', title: 'Price', minWidth: 120, sort: true },
    { field: 'money', title: 'Bet Money', minWidth: 120, sort: true },
    { field: 'rebate', title: 'Rebate', minWidth: 100 },
    { field: 'rebate_amount', title: 'Rebate Amt', minWidth: 120, sort: true },
    { field: 'result', title: 'Result', minWidth: 120, sort: true },
    { field: 'prize', title: 'Prize', minWidth: 120, sort: true },
    { field: 'win_count', title: 'Win#', minWidth: 80 },
    { field: 'real_win_count', title: 'Real Win#', minWidth: 90 },
    { field: 'status', title: 'Status', minWidth: 80 },
    { field: 'commission_status', title: 'Commission', minWidth: 100 },
    { field: 'source', title: 'Source', minWidth: 80 },
    { field: 'is_tester', title: 'Tester', minWidth: 80 },
    { field: 'bet_data_set', title: 'Bet Data', minWidth: 200 },
    { field: 'ip', title: 'IP', minWidth: 140 },
    { field: 'create_time', title: 'Created', minWidth: 160, sort: true },
    { field: 'update_time', title: 'Updated', minWidth: 160 },
    { field: 'prize_time', title: 'Prize Time', minWidth: 160 }
  ],
  // Model: BetOrder (sync/bet/model.py) — 22 columns
  'bet-orders': [
    { field: 'serial_no', title: 'Serial No', minWidth: 200, fixed: 'left' },
    { field: 'id', title: 'ID', minWidth: 90 },
    { field: 'uid', title: 'UID', minWidth: 90 },
    { field: 'agent_id', title: 'Agent ID', minWidth: 90 },
    { field: 'platform_username', title: 'Username', minWidth: 140 },
    { field: 'platform_id', title: 'Platform ID', minWidth: 100 },
    { field: 'platform_id_name', title: 'Provider', minWidth: 120 },
    { field: 'cid', title: 'CID', minWidth: 80 },
    { field: 'c_name', title: 'Game Category', minWidth: 120 },
    { field: 'game_name', title: 'Game', minWidth: 160 },
    { field: 'game_code', title: 'Game Code', minWidth: 100 },
    { field: 'bet_amount', title: 'Bet', minWidth: 120, sort: true },
    { field: 'turnover', title: 'Turnover', minWidth: 120, sort: true },
    { field: 'prize', title: 'Prize', minWidth: 120, sort: true },
    { field: 'win_lose', title: 'Win/Lose', minWidth: 120, sort: true },
    { field: 'extra', title: 'Extra', minWidth: 120 },
    { field: 'origin', title: 'Origin', minWidth: 100 },
    { field: 'delete_time', title: 'Delete Time', minWidth: 100 },
    { field: 'bet_time', title: 'Bet Time', minWidth: 160, sort: true },
    { field: 'prizetime', title: 'Prize Time', minWidth: 160 },
    { field: 'create_time', title: 'Created', minWidth: 160 },
    { field: 'update_time', title: 'Updated', minWidth: 160 }
  ],
  // Model: ReportLottery (sync/report/model.py) — 14 columns
  'report-lottery': [
    { field: 'username', title: 'Username', minWidth: 140, fixed: 'left' },
    { field: 'uid', title: 'UID', minWidth: 90 },
    { field: 'agent_id', title: 'Agent ID', minWidth: 90 },
    { field: 'lottery_name', title: 'Lottery', minWidth: 140 },
    { field: 'lottery_id', title: 'Lottery ID', minWidth: 90 },
    { field: 'report_date', title: 'Date', minWidth: 110, sort: true },
    { field: 'bet_count', title: 'Bets', minWidth: 80, sort: true },
    { field: 'bet_amount', title: 'Bet Amount', minWidth: 120, sort: true },
    { field: 'valid_amount', title: 'Valid Amount', minWidth: 120, sort: true },
    { field: 'rebate_amount', title: 'Rebate', minWidth: 120, sort: true },
    { field: 'result', title: 'Result', minWidth: 120, sort: true },
    { field: 'win_lose', title: 'Win/Lose', minWidth: 120, sort: true },
    { field: 'prize', title: 'Prize', minWidth: 120, sort: true },
    { field: 'synced_at', title: 'Synced At', minWidth: 160 }
  ],
  // Model: ReportFunds (sync/report/model.py) — 16 columns
  'report-funds': [
    { field: 'username', title: 'Username', minWidth: 140, fixed: 'left' },
    { field: 'id', title: 'ID', minWidth: 90 },
    { field: 'uid', title: 'UID', minWidth: 90 },
    { field: 'agent_id', title: 'Agent ID', minWidth: 90 },
    { field: 'user_parent', title: 'Parent ID', minWidth: 100 },
    { field: 'report_date', title: 'Date', minWidth: 110, sort: true },
    { field: 'deposit_count', title: 'Dep#', minWidth: 80, sort: true },
    { field: 'deposit_amount', title: 'Deposit', minWidth: 120, sort: true },
    { field: 'withdrawal_count', title: 'Wd#', minWidth: 80, sort: true },
    { field: 'withdrawal_amount', title: 'Withdrawal', minWidth: 120, sort: true },
    { field: 'charge_fee', title: 'Charge Fee', minWidth: 110, sort: true },
    { field: 'agent_commission', title: 'Commission', minWidth: 120, sort: true },
    { field: 'promotion', title: 'Promotion', minWidth: 110, sort: true },
    { field: 'third_rebate', title: '3rd Rebate', minWidth: 110, sort: true },
    { field: 'third_activity_amount', title: '3rd Activity', minWidth: 120, sort: true },
    { field: 'synced_at', title: 'Synced At', minWidth: 160 }
  ],
  // Model: ReportThirdGame (sync/report/model.py) — 12 columns
  'report-third': [
    { field: 'username', title: 'Username', minWidth: 140, fixed: 'left' },
    { field: 'uid', title: 'UID', minWidth: 90 },
    { field: 'agent_id', title: 'Agent ID', minWidth: 90 },
    { field: 'platform_id', title: 'Platform ID', minWidth: 100 },
    { field: 'platform_id_name', title: 'Platform', minWidth: 140 },
    { field: 'report_date', title: 'Date', minWidth: 110, sort: true },
    { field: 't_bet_times', title: 'Bet Times', minWidth: 90, sort: true },
    { field: 't_bet_amount', title: 'Bet Amount', minWidth: 120, sort: true },
    { field: 't_turnover', title: 'Valid Bet', minWidth: 120, sort: true },
    { field: 't_prize', title: 'Prize', minWidth: 120, sort: true },
    { field: 't_win_lose', title: 'Win/Lose', minWidth: 120, sort: true },
    { field: 'synced_at', title: 'Synced At', minWidth: 160 }
  ],
  // Model: DepositWithdrawal (sync/finance/model.py) — 37 columns — type filter for deposits
  deposits: [
    { field: 'serial_no', title: 'Serial No', minWidth: 200, fixed: 'left' },
    { field: 'id', title: 'ID', minWidth: 90 },
    { field: 'uid', title: 'UID', minWidth: 90 },
    { field: 'username', title: 'Username', minWidth: 140 },
    { field: 'agent_id', title: 'Agent ID', minWidth: 90 },
    { field: 'user_parent', title: 'Parent ID', minWidth: 100 },
    { field: 'user_tree', title: 'User Tree', minWidth: 200 },
    { field: 'group_id', title: 'Group', minWidth: 80 },
    { field: 'type', title: 'Type', minWidth: 100 },
    { field: 'category_id', title: 'Category', minWidth: 90 },
    { field: 'amount', title: 'Amount', minWidth: 120, sort: true },
    { field: 'true_amount', title: 'True Amount', minWidth: 120, sort: true },
    { field: 'status', title: 'Status', minWidth: 100 },
    { field: 'prostatus', title: 'Pro Status', minWidth: 90 },
    { field: 'pay_type', title: 'Pay Type', minWidth: 90 },
    { field: 'name', title: 'Account Holder', minWidth: 130 },
    { field: 'bank_id', title: 'Bank ID', minWidth: 80 },
    { field: 'branch', title: 'Branch', minWidth: 150 },
    { field: 'account', title: 'Account No', minWidth: 160 },
    { field: 'trade_id', title: 'Trade ID', minWidth: 160 },
    { field: 'merchant_id', title: 'Merchant', minWidth: 90 },
    { field: 'firm_fee', title: 'Firm Fee', minWidth: 110, sort: true },
    { field: 'user_fee', title: 'User Fee', minWidth: 110, sort: true },
    { field: 'rebate', title: 'Rebate', minWidth: 110, sort: true },
    { field: 'prize_amount', title: 'Prize Amount', minWidth: 120, sort: true },
    { field: 'activity_id', title: 'Activity', minWidth: 90 },
    { field: 'operator', title: 'Operator', minWidth: 90 },
    { field: 'is_tester', title: 'Tester', minWidth: 80 },
    { field: 'currency', title: 'Currency', minWidth: 80 },
    { field: 'extra', title: 'Extra', minWidth: 200 },
    { field: 'remark', title: 'Remark', minWidth: 150 },
    { field: 'user_remark', title: 'User Remark', minWidth: 150 },
    { field: 'transfer_record', title: 'Transfer Record', minWidth: 200 },
    { field: 'create_time', title: 'Created', minWidth: 160, sort: true },
    { field: 'update_time', title: 'Updated', minWidth: 160 },
    { field: 'success_time', title: 'Success Time', minWidth: 160 },
    { field: 'transfer_time', title: 'Transfer Time', minWidth: 160 },
    { field: 'review_time', title: 'Review Time', minWidth: 160 }
  ],
  // Model: DepositWithdrawal — 37 columns — type filter for withdrawals
  withdrawals: [
    { field: 'serial_no', title: 'Serial No', minWidth: 200, fixed: 'left' },
    { field: 'id', title: 'ID', minWidth: 90 },
    { field: 'uid', title: 'UID', minWidth: 90 },
    { field: 'username', title: 'Username', minWidth: 140 },
    { field: 'agent_id', title: 'Agent ID', minWidth: 90 },
    { field: 'user_parent', title: 'Parent ID', minWidth: 100 },
    { field: 'user_tree', title: 'User Tree', minWidth: 200 },
    { field: 'group_id', title: 'Group', minWidth: 80 },
    { field: 'type', title: 'Type', minWidth: 100 },
    { field: 'category_id', title: 'Category', minWidth: 90 },
    { field: 'amount', title: 'Amount', minWidth: 120, sort: true },
    { field: 'true_amount', title: 'True Amount', minWidth: 120, sort: true },
    { field: 'status', title: 'Status', minWidth: 100 },
    { field: 'prostatus', title: 'Pro Status', minWidth: 90 },
    { field: 'pay_type', title: 'Pay Type', minWidth: 90 },
    { field: 'name', title: 'Account Holder', minWidth: 130 },
    { field: 'bank_id', title: 'Bank ID', minWidth: 80 },
    { field: 'branch', title: 'Branch', minWidth: 150 },
    { field: 'account', title: 'Account No', minWidth: 160 },
    { field: 'trade_id', title: 'Trade ID', minWidth: 160 },
    { field: 'merchant_id', title: 'Merchant', minWidth: 90 },
    { field: 'firm_fee', title: 'Firm Fee', minWidth: 110, sort: true },
    { field: 'user_fee', title: 'User Fee', minWidth: 110, sort: true },
    { field: 'rebate', title: 'Rebate', minWidth: 110, sort: true },
    { field: 'prize_amount', title: 'Prize Amount', minWidth: 120, sort: true },
    { field: 'activity_id', title: 'Activity', minWidth: 90 },
    { field: 'operator', title: 'Operator', minWidth: 90 },
    { field: 'is_tester', title: 'Tester', minWidth: 80 },
    { field: 'currency', title: 'Currency', minWidth: 80 },
    { field: 'extra', title: 'Extra', minWidth: 200 },
    { field: 'remark', title: 'Remark', minWidth: 150 },
    { field: 'user_remark', title: 'User Remark', minWidth: 150 },
    { field: 'transfer_record', title: 'Transfer Record', minWidth: 200 },
    { field: 'create_time', title: 'Created', minWidth: 160, sort: true },
    { field: 'update_time', title: 'Updated', minWidth: 160 },
    { field: 'success_time', title: 'Success Time', minWidth: 160 },
    { field: 'transfer_time', title: 'Transfer Time', minWidth: 160 },
    { field: 'review_time', title: 'Review Time', minWidth: 160 }
  ],
  // Model: BankList (sync/config/model.py) — 7 columns
  banks: [
    { field: 'card_number', title: 'Card No', minWidth: 200, fixed: 'left' },
    { field: 'id', title: 'ID', minWidth: 90 },
    { field: 'agent_id', title: 'Agent ID', minWidth: 90 },
    { field: 'bank', title: 'Bank', minWidth: 160 },
    { field: 'branch', title: 'Branch', minWidth: 150 },
    { field: 'is_default', title: 'Default', minWidth: 80 },
    { field: 'create_time', title: 'Created', minWidth: 160 }
  ],
  // Rebate odds (upstream data, no local model)
  rebate: [
    { field: 'odds_11', title: 'Play Type', minWidth: 160, fixed: 'left' },
    { field: 'odds_10', title: 'Rebate 10', minWidth: 100 },
    { field: 'odds_9', title: 'Rebate 9', minWidth: 100 },
    { field: 'odds_8', title: 'Rebate 8', minWidth: 100 },
    { field: 'odds_7', title: 'Rebate 7', minWidth: 100 },
    { field: 'odds_6', title: 'Rebate 6', minWidth: 100 },
    { field: 'odds_5', title: 'Rebate 5', minWidth: 100 },
    { field: 'odds_4', title: 'Rebate 4', minWidth: 100 },
    { field: 'odds_3', title: 'Rebate 3', minWidth: 100 },
    { field: 'odds_2', title: 'Rebate 2', minWidth: 100 },
    { field: 'odds_1', title: 'Rebate 1', minWidth: 100 }
  ]
}

export const ENDPOINT_NAMES = {
  members: 'Members',
  invites: 'Invite List',
  bets: 'Lottery Bets',
  'bet-orders': '3rd Party Bets',
  'report-lottery': 'Lottery Report',
  'report-funds': 'Funds Statement',
  'report-third': 'Provider Report',
  deposits: 'Deposits',
  withdrawals: 'Withdrawals',
  banks: 'Bank List',
  rebate: 'Rebate Odds'
}

export const ENDPOINT_HAS_DATE = {
  bets: true, 'bet-orders': true,
  'report-lottery': true, 'report-funds': true, 'report-third': true,
  deposits: true, withdrawals: true
}

export const ENDPOINT_SEARCH = {
  members: [
    { name: 'username', type: 'text', label: 'Username' },
    { name: 'status', type: 'select', label: 'Status', options: [
      { value: '', text: '--' }, { value: '0', text: 'Chưa đánh giá' },
      { value: '1', text: 'Bình thường' }, { value: '2', text: 'Đóng băng' }, { value: '3', text: 'Khoá' }
    ]},
    { name: 'sort_field', type: 'select', label: 'Sort by', options: [
      { value: '', text: '--' }, { value: 'money', text: 'Balance' },
      { value: 'login_time', text: 'Last Login' }, { value: 'register_time', text: 'Register' },
      { value: 'deposit_money', text: 'Total Dep' }, { value: 'withdrawal_money', text: 'Total Wd' }
    ]}
  ],
  invites: [
    { name: 'invite_code', type: 'text', label: 'Invite Code' },
    { name: 'user_type', type: 'select', label: 'User Type', options: [
      { value: '', text: '--' }, { value: '1', text: 'Hội viên thường' }, { value: '3', text: 'Gửi lời mời' }
    ]}
  ],
  bets: [
    { name: 'username', type: 'text', label: 'Username' },
    { name: 'serial_no', type: 'text', label: 'Serial No' },
    { name: 'lottery_id', type: 'select', label: 'Lottery', options: LOTTERY_OPTIONS },
    { name: 'status', type: 'select', label: 'Status', options: [
      { value: '', text: '--' }, { value: '-9', text: 'Chưa thanh toán' },
      { value: '1', text: 'Trúng' }, { value: '-1', text: 'Không trúng' },
      { value: '2', text: 'Hoà' }, { value: '3', text: 'Khách huỷ' },
      { value: '4', text: 'Hệ thống huỷ' }
    ]}
  ],
  'bet-orders': [
    { name: 'platform_username', type: 'text', label: 'Username' },
    { name: 'serial_no', type: 'text', label: 'Serial No' }
  ],
  'report-lottery': [
    { name: 'username', type: 'text', label: 'Username' },
    { name: 'lottery_id', type: 'select', label: 'Lottery', options: LOTTERY_OPTIONS }
  ],
  'report-funds': [
    { name: 'username', type: 'text', label: 'Username' }
  ],
  'report-third': [
    { name: 'username', type: 'text', label: 'Username' },
    { name: 'platform_id', type: 'select', label: 'Platform', options: [
      { value: '', text: '--' },
      { value: '8', text: 'PA' }, { value: '9', text: 'BBIN' }, { value: '10', text: 'WM' },
      { value: '20', text: 'KY' }, { value: '28', text: 'PGSOFT' },
      { value: '29', text: 'LUCKYWIN' }, { value: '30', text: 'SABA' },
      { value: '38', text: 'RICH88' }, { value: '46', text: 'JILI' },
      { value: '47', text: 'KA' }, { value: '48', text: 'MW' },
      { value: '50', text: 'SBO' }, { value: '51', text: 'NEXTSPIN' }
    ]}
  ],
  deposits: [
    { name: 'username', type: 'text', label: 'Username' },
    { name: 'serial_no', type: 'text', label: 'Serial No' },
    { name: 'status', type: 'select', label: 'Status', options: [
      { value: '', text: '--' }, { value: '0', text: 'Chờ xử lí' },
      { value: '1', text: 'Hoàn tất' }, { value: '2', text: 'Đang xử lí' }, { value: '3', text: 'Không thành công' }
    ]}
  ],
  withdrawals: [
    { name: 'username', type: 'text', label: 'Username' },
    { name: 'serial_no', type: 'text', label: 'Serial No' },
    { name: 'status', type: 'select', label: 'Status', options: [
      { value: '', text: '--' }, { value: '0', text: 'Chờ xử lí' },
      { value: '1', text: 'Hoàn tất' }, { value: '2', text: 'Đang xử lí' }, { value: '3', text: 'Không thành công' }
    ]}
  ],
  banks: [
    { name: 'card_number', type: 'text', label: 'Card Number' }
  ],
  rebate: []
}

/** Hash → endpoint mapping */
export const HASH_TO_ENDPOINT = {
  '#/users': 'members',
  '#/invite-list': 'invites',
  '#/report-lottery': 'report-lottery',
  '#/report-funds': 'report-funds',
  '#/report-provider': 'report-third',
  '#/bank-list': 'banks',
  '#/deposit-list': 'deposits',
  '#/withdrawal-history': 'withdrawals',
  '#/bet-list': 'bets',
  '#/bet-third-party': 'bet-orders',
  '#/rebate-list': 'rebate'
}
