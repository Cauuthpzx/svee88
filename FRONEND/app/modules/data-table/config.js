/**
 * Data Table — Column configs, search fields, endpoint metadata.
 * Columns match backend model fields exactly.
 */

const LOTTERY_OPTIONS = [
  { value: '', text: '--' },
  // Sicbo
  { value: '66', text: 'Sicbo 20s' }, { value: '67', text: 'Sicbo 30s' },
  { value: '68', text: 'Sicbo 40s' }, { value: '69', text: 'Sicbo 50s' },
  { value: '70', text: 'Sicbo 1m' }, { value: '71', text: 'Sicbo 1.5m' },
  // Win go
  { value: '77', text: 'Win go 30s' }, { value: '73', text: 'Win go 45s' },
  { value: '74', text: 'Win go 1m' }, { value: '75', text: 'Win go 3m' }, { value: '76', text: 'Win go 5m' },
  // Keno VIP
  { value: '51', text: 'Keno VIP 20s' }, { value: '52', text: 'Keno VIP 30s' },
  { value: '53', text: 'Keno VIP 40s' }, { value: '54', text: 'Keno VIP 50s' },
  { value: '55', text: 'Keno VIP 1m' }, { value: '56', text: 'Keno VIP 5m' },
  // Miền Bắc
  { value: '32', text: 'Miền Bắc' }, { value: '63', text: 'XS Miền Bắc' },
  { value: '45', text: 'M.Bắc nhanh 5m' }, { value: '46', text: 'M.Bắc nhanh 3m' },
  { value: '47', text: 'M.Bắc VIP 45s' }, { value: '48', text: 'M.Bắc VIP 75s' }, { value: '49', text: 'M.Bắc VIP 2m' },
  // Miền Nam VIP
  { value: '44', text: 'M.Nam VIP 5m' }, { value: '57', text: 'M.Nam VIP 45s' },
  { value: '58', text: 'M.Nam VIP 1m' }, { value: '59', text: 'M.Nam VIP 90s' }, { value: '60', text: 'M.Nam VIP 2m' },
  // Xổ số Miền Nam
  { value: '1', text: 'Bạc Liêu' }, { value: '2', text: 'Vũng Tàu' }, { value: '3', text: 'Tiền Giang' },
  { value: '4', text: 'Kiên Giang' }, { value: '5', text: 'Đà Lạt' }, { value: '6', text: 'Bình Phước' },
  { value: '7', text: 'Bình Dương' }, { value: '8', text: 'An Giang' }, { value: '9', text: 'Bình Thuận' },
  { value: '10', text: 'Cà Mau' }, { value: '11', text: 'Cần Thơ' }, { value: '12', text: 'Hậu Giang' },
  { value: '13', text: 'Đồng Tháp' }, { value: '14', text: 'Tây Ninh' }, { value: '15', text: 'Sóc Trăng' },
  { value: '16', text: 'TP Hồ Chí Minh' }, { value: '17', text: 'Đồng Nai' },
  { value: '30', text: 'Đắk Lắk' }, { value: '31', text: 'Đắk Nông' },
  { value: '42', text: 'Trà Vinh' }, { value: '43', text: 'Vĩnh Long' },
  // Xổ số Miền Trung
  { value: '18', text: 'Đà Nẵng' }, { value: '19', text: 'Thừa Thiên Huế' },
  { value: '20', text: 'Quảng Trị' }, { value: '21', text: 'Phú Yên' },
  { value: '22', text: 'Quảng Bình' }, { value: '23', text: 'Quảng Nam' },
  { value: '24', text: 'Quảng Ngãi' }, { value: '25', text: 'Ninh Thuận' },
  { value: '26', text: 'Kon Tum' }, { value: '27', text: 'Khánh Hoà' },
  { value: '28', text: 'Gia Lai' }, { value: '29', text: 'Bình Định' }
]

const PLATFORM_OPTIONS = [
  { value: '', text: '--' },
  { value: '8', text: 'PA' }, { value: '9', text: 'BBIN' }, { value: '10', text: 'WM' },
  { value: '14', text: 'MINI' }, { value: '20', text: 'KY' }, { value: '28', text: 'PGSOFT' },
  { value: '29', text: 'LUCKYWIN' }, { value: '30', text: 'SABA' }, { value: '31', text: 'PT' },
  { value: '38', text: 'RICH88' }, { value: '43', text: 'ASTAR' }, { value: '45', text: 'FB' },
  { value: '46', text: 'JILI' }, { value: '47', text: 'KA' }, { value: '48', text: 'MW' },
  { value: '50', text: 'SBO' }, { value: '51', text: 'NEXTSPIN' }, { value: '52', text: 'AMB' },
  { value: '53', text: 'FunTa' }, { value: '62', text: 'MG' }, { value: '63', text: 'WS168' },
  { value: '69', text: 'DG CASINO' }, { value: '70', text: 'V8' }, { value: '71', text: 'AE' },
  { value: '72', text: 'TP' }, { value: '73', text: 'FC' }, { value: '74', text: 'JDB' },
  { value: '75', text: 'CQ9' }, { value: '76', text: 'PP' }, { value: '77', text: 'VA' },
  { value: '78', text: 'BNG' }, { value: '84', text: 'DB CASINO' }, { value: '85', text: 'EVO CASINO' },
  { value: '90', text: 'CMD SPORTS' }, { value: '91', text: 'PG NEW' }, { value: '92', text: 'FBLIVE' },
  { value: '93', text: 'ON CASINO' }, { value: '94', text: 'MT' }, { value: '102', text: 'fC NEW' }
]

/** Column configs — field names & Vietnamese titles match upstream exactly */
export const ENDPOINT_COLS = {
  // Member — upstream trả 12 fields (mapped qua clean_member)
  members: [
    { field: 'username', title: 'Hội viên', minWidth: 150, fixed: 'left' },
    { field: 'id', title: 'ID', minWidth: 90 },
    { field: 'type', title: 'Loại hình', minWidth: 120 },
    { field: 'user_parent', title: 'Đại lý', minWidth: 100 },
    { field: 'status', title: 'Trạng thái', minWidth: 100 },
    { field: 'money', title: 'Số dư', minWidth: 140, sort: true },
    { field: 'deposit_times', title: 'Lần nạp', minWidth: 90, sort: true },
    { field: 'deposit_money', title: 'Tổng nạp', minWidth: 140, sort: true },
    { field: 'withdrawal_times', title: 'Lần rút', minWidth: 90, sort: true },
    { field: 'withdrawal_money', title: 'Tổng rút', minWidth: 140, sort: true },
    { field: 'login_time', title: 'Đăng nhập cuối', minWidth: 160, sort: true },
    { field: 'register_time', title: 'Đăng ký', minWidth: 160, sort: true }
  ],
  // InviteList — upstream trả 10 fields
  invites: [
    { field: 'invite_code', title: 'Mã giới thiệu', minWidth: 150, fixed: 'left' },
    { field: 'id', title: 'ID', minWidth: 90 },
    { field: 'user_type', title: 'Loại hình', minWidth: 120 },
    { field: 'reg_count', title: 'Tổng đăng ký', minWidth: 110, sort: true },
    { field: 'scope_reg_count', title: 'Đăng ký phạm vi', minWidth: 120 },
    { field: 'recharge_count', title: 'Số người nạp', minWidth: 110, sort: true },
    { field: 'first_recharge_count', title: 'Nạp đầu/ngày', minWidth: 110 },
    { field: 'register_recharge_count', title: 'Nạp đầu/đăng ký', minWidth: 130 },
    { field: 'remark', title: 'Ghi chú', minWidth: 150 },
    { field: 'create_time', title: 'Thời gian tạo', minWidth: 160, sort: true }
  ],
  // BetLottery — upstream trả 12 fields
  bets: [
    { field: 'serial_no', title: 'Mã giao dịch', minWidth: 200, fixed: 'left' },
    { field: 'username', title: 'Người dùng', minWidth: 140 },
    { field: 'create_time', title: 'Thời gian cược', minWidth: 160, sort: true },
    { field: 'lottery_name', title: 'Trò chơi', minWidth: 150 },
    { field: 'play_type_name', title: 'Loại trò chơi', minWidth: 150 },
    { field: 'play_name', title: 'Cách chơi', minWidth: 150 },
    { field: 'issue', title: 'Kỳ', minWidth: 150 },
    { field: 'content', title: 'Thông tin cược', minWidth: 150 },
    { field: 'money', title: 'Tiền cược', minWidth: 140, sort: true },
    { field: 'rebate_amount', title: 'Hoàn trả', minWidth: 140, sort: true },
    { field: 'result', title: 'Thắng thua', minWidth: 140, sort: true },
    { field: 'status_text', title: 'Trạng thái', minWidth: 100, fixed: 'right' }
  ],
  // Cược bên thứ 3 — upstream 12 fields
  'bet-orders': [
    { field: 'serial_no', title: 'Mã giao dịch', minWidth: 200, fixed: 'left' },
    { field: 'platform_id_name', title: 'Nhà cung cấp game', minWidth: 160 },
    { field: 'platform_username', title: 'Tài khoản nhà cái', minWidth: 150 },
    { field: 'c_name', title: 'Loại hình trò chơi', minWidth: 140 },
    { field: 'game_code', title: 'Mã trò chơi', minWidth: 120 },
    { field: 'game_name', title: 'Tên trò chơi', minWidth: 160 },
    { field: 'bet_amount', title: 'Tiền cược', minWidth: 130, sort: true },
    { field: 'turnover', title: 'Cược hợp lệ', minWidth: 130, sort: true },
    { field: 'prize', title: 'Tiền thưởng', minWidth: 130, sort: true },
    { field: 'win_lose', title: 'Thắng thua', minWidth: 130, sort: true },
    { field: 'create_time', title: 'Thời gian tạo', minWidth: 160, sort: true },
    { field: 'bet_time', title: 'Thời gian cược', minWidth: 160, sort: true }
  ],
  // Báo cáo xổ số — upstream 11 fields (+ total_data)
  'report-lottery': [
    { field: 'username', title: 'Tên tài khoản', minWidth: 140, fixed: 'left' },
    { field: 'user_parent_format', title: 'Thuộc đại lý', minWidth: 120 },
    { field: 'lottery_name', title: 'Tên loại xổ', minWidth: 150 },
    { field: 'bet_count', title: 'Số lần cược', minWidth: 100, sort: true },
    { field: 'bet_amount', title: 'Tiền cược', minWidth: 130, sort: true },
    { field: 'valid_amount', title: 'Cược hợp lệ (trừ hoà)', minWidth: 170, sort: true },
    { field: 'rebate_amount', title: 'Hoàn trả', minWidth: 130, sort: true },
    { field: 'result', title: 'Thắng thua', minWidth: 130, sort: true },
    { field: 'win_lose', title: 'Kết quả (không gồm hoàn trả)', minWidth: 200, sort: true },
    { field: 'prize', title: 'Tiền trúng', minWidth: 130, sort: true },
    { field: 'report_date', title: 'Thời gian', minWidth: 120, sort: true }
  ],
  // Báo cáo tài chính — upstream 12 fields (+ total_data)
  'report-funds': [
    { field: 'username', title: 'Tên tài khoản', minWidth: 140, fixed: 'left' },
    { field: 'user_parent_format', title: 'Thuộc đại lý', minWidth: 120 },
    { field: 'deposit_count', title: 'Số lần nạp', minWidth: 100, sort: true },
    { field: 'deposit_amount', title: 'Số tiền nạp', minWidth: 130, sort: true },
    { field: 'withdrawal_count', title: 'Số lần rút', minWidth: 100, sort: true },
    { field: 'withdrawal_amount', title: 'Số tiền rút', minWidth: 130, sort: true },
    { field: 'charge_fee', title: 'Phí dịch vụ', minWidth: 120, sort: true },
    { field: 'agent_commission', title: 'Hoa hồng đại lý', minWidth: 140, sort: true },
    { field: 'promotion', title: 'Ưu đãi', minWidth: 110, sort: true },
    { field: 'third_rebate', title: 'Hoàn trả bên thứ 3', minWidth: 150, sort: true },
    { field: 'third_activity_amount', title: 'Thưởng bên thứ 3', minWidth: 150, sort: true },
    { field: 'report_date', title: 'Thời gian', minWidth: 120, sort: true }
  ],
  // Báo cáo nhà cung cấp — upstream 7 fields
  'report-third': [
    { field: 'username', title: 'Tên tài khoản', minWidth: 140, fixed: 'left' },
    { field: 'platform_id_name', title: 'Nhà cung cấp game', minWidth: 160 },
    { field: 't_bet_times', title: 'Số lần cược', minWidth: 100, sort: true },
    { field: 't_bet_amount', title: 'Tiền cược', minWidth: 130, sort: true },
    { field: 't_turnover', title: 'Cược hợp lệ', minWidth: 130, sort: true },
    { field: 't_prize', title: 'Tiền thưởng', minWidth: 130, sort: true },
    { field: 't_win_lose', title: 'Thắng thua', minWidth: 130, sort: true }
  ],
  // Nạp tiền — upstream 6 fields
  deposits: [
    { field: 'username', title: 'Tên tài khoản', minWidth: 140, fixed: 'left' },
    { field: 'user_parent_format', title: 'Thuộc đại lý', minWidth: 120 },
    { field: 'amount', title: 'Số tiền', minWidth: 130, sort: true },
    { field: 'type', title: 'Loại hình giao dịch', minWidth: 140 },
    { field: 'status', title: 'Trạng thái giao dịch', minWidth: 140 },
    { field: 'create_time', title: 'Thời gian tạo đơn', minWidth: 160, sort: true }
  ],
  // Rút tiền — upstream 8 fields
  withdrawals: [
    { field: 'serial_no', title: 'Mã giao dịch', minWidth: 200, fixed: 'left' },
    { field: 'create_time', title: 'Thời gian tạo đơn', minWidth: 160, sort: true },
    { field: 'username', title: 'Tên tài khoản', minWidth: 140 },
    { field: 'user_parent_format', title: 'Thuộc đại lý', minWidth: 120 },
    { field: 'amount', title: 'Số tiền', minWidth: 130, sort: true },
    { field: 'user_fee', title: 'Phí hội viên', minWidth: 120, sort: true },
    { field: 'true_amount', title: 'Số tiền thực tế', minWidth: 140, sort: true },
    { field: 'status_format', title: 'Trạng thái giao dịch', minWidth: 140 }
  ],
  // Ngân hàng — upstream 6 fields
  banks: [
    { field: 'id', title: 'Mã số', minWidth: 90 },
    { field: 'is_default', title: 'Mặc định', minWidth: 100 },
    { field: 'bank', title: 'Tên ngân hàng', minWidth: 180 },
    { field: 'branch', title: 'Chi nhánh', minWidth: 180 },
    { field: 'card_number', title: 'Số tài khoản', minWidth: 200 },
    { field: 'create_time', title: 'Thời gian thêm', minWidth: 160 }
  ],
  // Tỷ lệ hoàn trả (upstream data, no local model)
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
  members: 'Quản lí hội viên',
  invites: 'Mã giới thiệu',
  bets: 'Cược xổ số',
  'bet-orders': 'Cược bên thứ 3',
  'report-lottery': 'Báo cáo xổ số',
  'report-funds': 'Báo cáo tài chính',
  'report-third': 'Báo cáo nhà cung cấp',
  deposits: 'Nạp tiền',
  withdrawals: 'Rút tiền',
  banks: 'Danh sách ngân hàng',
  rebate: 'Tỷ lệ hoàn trả'
}

export const ENDPOINT_HAS_DATE = {
  bets: true, 'bet-orders': true,
  'report-lottery': true, 'report-funds': true, 'report-third': true,
  deposits: true, withdrawals: true
}

/** Upstream date param name per endpoint (default = 'date') */
export const DATE_PARAM_NAME = {
  bets: 'create_time',
  'bet-orders': 'bet_time',
  deposits: 'create_time',
  withdrawals: 'create_time'
  // reports use 'date' — no rename needed
}

export const ENDPOINT_SEARCH = {
  members: [
    { name: 'username', type: 'text', label: 'Tên tài khoản' },
    { name: 'status', type: 'select', label: 'Trạng thái', options: [
      { value: '', text: '--' }, { value: '0', text: 'Chưa đánh giá' },
      { value: '1', text: 'Bình thường' }, { value: '2', text: 'Đóng băng' }, { value: '3', text: 'Khoá' }
    ]},
    { name: 'sort_field', type: 'select', label: 'Sắp xếp', options: [
      { value: '', text: '--' }, { value: 'money', text: 'Số dư' },
      { value: 'login_time', text: 'Đăng nhập cuối' }, { value: 'register_time', text: 'Đăng ký' },
      { value: 'deposit_money', text: 'Tổng nạp' }, { value: 'withdrawal_money', text: 'Tổng rút' }
    ]},
    { name: 'sort_direction', type: 'select', label: 'Hướng', options: [
      { value: 'desc', text: 'Lớn → Bé' }, { value: 'asc', text: 'Bé → Lớn' }
    ]}
  ],
  invites: [
    { name: 'invite_code', type: 'text', label: 'Mã giới thiệu' },
    { name: 'user_type', type: 'select', label: 'Loại hình', options: [
      { value: '', text: '--' }, { value: '1', text: 'Hội viên thường' }, { value: '3', text: 'Gửi lời mời' }
    ]}
  ],
  bets: [
    { name: 'username', type: 'text', label: 'Tên tài khoản' },
    { name: 'serial_no', type: 'text', label: 'Mã giao dịch' },
    { name: 'lottery_id', type: 'select', label: 'Trò chơi', options: LOTTERY_OPTIONS },
    { name: 'status', type: 'select', label: 'Trạng thái', options: [
      { value: '', text: '--' }, { value: '-9', text: 'Chưa thanh toán' },
      { value: '1', text: 'Trúng' }, { value: '-1', text: 'Không trúng' },
      { value: '2', text: 'Hoà' }, { value: '3', text: 'Khách huỷ đơn' },
      { value: '4', text: 'Hệ thống huỷ đơn' }, { value: '5', text: 'Đơn cược bất thường' },
      { value: '6', text: 'Chưa thanh toán (khôi phục)' }
    ]}
  ],
  'bet-orders': [
    { name: 'username', type: 'text', label: 'Tên tài khoản' },
    { name: 'serial_no', type: 'text', label: 'Mã giao dịch' },
    { name: 'platform_username', type: 'text', label: 'Tài khoản nhà cái' }
  ],
  'report-lottery': [
    { name: 'username', type: 'text', label: 'Tên tài khoản' },
    { name: 'lottery_id', type: 'select', label: 'Loại xổ', options: LOTTERY_OPTIONS }
  ],
  'report-funds': [
    { name: 'username', type: 'text', label: 'Tên tài khoản' }
  ],
  'report-third': [
    { name: 'username', type: 'text', label: 'Tên tài khoản' },
    { name: 'platform_id', type: 'select', label: 'Nhà cung cấp', options: PLATFORM_OPTIONS }
  ],
  deposits: [
    { name: 'username', type: 'text', label: 'Tên tài khoản' },
    { name: 'type', type: 'select', label: 'Loại hình', options: [
      { value: '', text: '--' }, { value: '1', text: 'Nạp tiền' }, { value: '2', text: 'Rút tiền' }
    ]},
    { name: 'status', type: 'select', label: 'Trạng thái', options: [
      { value: '', text: '--' }, { value: '0', text: 'Chờ xử lí' },
      { value: '1', text: 'Hoàn tất' }, { value: '2', text: 'Đang xử lí' }, { value: '3', text: 'Không thành công' }
    ]}
  ],
  withdrawals: [
    { name: 'username', type: 'text', label: 'Tên tài khoản' },
    { name: 'serial_no', type: 'text', label: 'Mã giao dịch' },
    { name: 'status', type: 'select', label: 'Trạng thái', options: [
      { value: '', text: '--' }, { value: '0', text: 'Chờ xử lí' },
      { value: '1', text: 'Hoàn tất' }, { value: '2', text: 'Đang xử lí' }, { value: '3', text: 'Không thành công' }
    ]}
  ],
  banks: [
    { name: 'card_number', type: 'text', label: 'Số tài khoản' }
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
