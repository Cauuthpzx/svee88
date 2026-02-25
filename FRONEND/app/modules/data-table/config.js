/**
 * Data Table — Column configs, search fields, endpoint metadata.
 * Columns match backend model fields exactly.
 */

import { LOTTERY_OPTIONS, PLATFORM_OPTIONS } from './options.js'

/** Agent column — prepended to all endpoint configs */
const AGENT_COL = { field: '_agent_name', title: 'Đại lý', minWidth: 110 }

/** Column configs — field names & Vietnamese titles match upstream exactly */
export const ENDPOINT_COLS = {
  // Member — upstream trả 11 fields (khớp trang gốc)
  members: [
    AGENT_COL,
    { field: 'username', title: 'Hội viên', minWidth: 130 },
    { field: 'type_format', title: 'Loại hình hội viên', minWidth: 100 },
    { field: 'parent_user', title: 'Tài khoản đại lý', minWidth: 130 },
    { field: 'money', title: 'Số dư', minWidth: 120 },
    { field: 'deposit_count', title: 'Lần nạp', minWidth: 90 },
    { field: 'withdrawal_count', title: 'Lần rút', minWidth: 90 },
    { field: 'deposit_amount', title: 'Tổng tiền nạp', minWidth: 110 },
    { field: 'withdrawal_amount', title: 'Tổng tiền rút', minWidth: 110 },
    { field: 'login_time', title: 'Lần đăng nhập cuối', minWidth: 150 },
    { field: 'register_time', title: 'Thời gian đăng ký', minWidth: 150 },
    { field: 'status_format', title: 'Trạng thái', minWidth: 90 }
  ],
  // InviteList — upstream trả 10 fields (khớp trang gốc)
  invites: [
    AGENT_COL,
    { field: 'invite_code', title: 'Mã giới thiệu' },
    { field: 'user_type', title: 'Loại hình giới thiệu' },
    { field: 'reg_count', title: 'Tổng số đã đăng ký' },
    { field: 'scope_reg_count', title: 'Số lượng người dùng đã đăng ký' },
    { field: 'recharge_count', title: 'Số người nạp tiền' },
    { field: 'first_recharge_count', title: 'Nạp đầu trong ngày' },
    { field: 'register_recharge_count', title: 'Nạp đầu trong ngày đăng kí' },
    { field: 'remark', title: 'Ghi chú' },
    { field: 'create_time', title: 'Thời gian thêm vào' },
    { field: 'operate', title: 'Thao tác', width: 280, templet: (d) => {
      const code = d.invite_code || ''
      const id = d.id || ''
      const base = (d._agent_base_url || '').replace(/\/+$/, '')
      return `<div class="invite-actions">
        <button class="layui-btn layui-btn-xs invite-copy-btn" data-code="${code}">Copy đường link</button>
        <button class="layui-btn layui-btn-xs layui-btn-normal invite-setting-btn" data-id="${id}" data-base="${base}">Xem cài đặt</button>
        <button class="layui-btn layui-btn-xs layui-btn-warm invite-qr-btn" data-id="${id}" data-base="${base}">Mã QR</button>
      </div>`
    }}
  ],
  // BetLottery — upstream trả 12 fields (khớp trang gốc)
  bets: [
    AGENT_COL,
    { field: 'serial_no', title: 'Mã giao dịch', width: 200 },
    { field: 'username', title: 'Tên người dùng', width: 150 },
    { field: 'create_time', title: 'Thời gian cược', width: 160 },
    { field: 'lottery_name', title: 'Trò chơi', minWidth: 150 },
    { field: 'play_type_name', title: 'Loại trò chơi', minWidth: 150 },
    { field: 'play_name', title: 'Cách chơi', minWidth: 150 },
    { field: 'issue', title: 'Kỳ', minWidth: 150 },
    { field: 'content', title: 'Thông tin cược', minWidth: 150 },
    { field: 'money', title: 'Tiền cược', minWidth: 150 },
    { field: 'rebate_amount', title: 'Tiền hoàn trả', minWidth: 150 },
    { field: 'result', title: 'Thắng thua', minWidth: 150 },
    { field: 'status_text', title: 'Trạng thái', width: 100 }
  ],
  // Cược bên thứ 3 — upstream 10 fields (khớp trang gốc)
  'bet-orders': [
    AGENT_COL,
    { field: 'serial_no', title: 'Mã giao dịch', width: 250 },
    { field: 'platform_id_name', title: 'Nhà cung cấp game bên thứ 3', width: 150 },
    { field: 'platform_username', title: 'Tên tài khoản thuộc nhà cái', width: 150 },
    { field: 'c_name', title: 'Loại hình trò chơi', width: 150 },
    { field: 'game_name', title: 'Tên trò chơi bên thứ 3', width: 150 },
    { field: 'bet_amount', title: 'Tiền cược', width: 150 },
    { field: 'turnover', title: 'Tiền cược hợp lệ', width: 150 },
    { field: 'prize', title: 'Tiền thưởng', width: 150 },
    { field: 'win_lose', title: 'Thắng thua', width: 150 },
    { field: 'bet_time', title: 'Thời gian cược', width: 160 }
  ],
  // Báo cáo xổ số — upstream 10 fields (khớp trang gốc)
  'report-lottery': [
    AGENT_COL,
    { field: 'username', title: 'Tên tài khoản', width: 150 },
    { field: 'user_parent_format', title: 'Thuộc đại lý', width: 150 },
    { field: 'bet_count', title: 'Số lần cược', minWidth: 150 },
    { field: 'bet_amount', title: 'Tiền cược', minWidth: 150 },
    { field: 'valid_amount', title: 'Tiền cược hợp lệ (trừ cược hoà)', minWidth: 160 },
    { field: 'rebate_amount', title: 'Hoàn trả', minWidth: 150 },
    { field: 'result', title: 'Thắng thua', minWidth: 150 },
    { field: 'win_lose', title: 'Kết quả thắng thua (không gồm hoàn trả)', minWidth: 180 },
    { field: 'prize', title: 'Tiền trúng', minWidth: 150 },
    { field: 'lottery_name', title: 'Tên loại xổ', width: 160 }
  ],
  // Báo cáo tài chính — upstream 12 fields (khớp trang gốc)
  'report-funds': [
    AGENT_COL,
    { field: 'username', title: 'Tên tài khoản', width: 150 },
    { field: 'user_parent_format', title: 'Thuộc đại lý', width: 150 },
    { field: 'deposit_count', title: 'Số lần nạp', width: 160 },
    { field: 'deposit_amount', title: 'Số tiền nạp', minWidth: 150, sort: true },
    { field: 'withdrawal_count', title: 'Số lần rút', minWidth: 150 },
    { field: 'withdrawal_amount', title: 'Số tiền rút', minWidth: 160 },
    { field: 'charge_fee', title: 'Phí dịch vụ', minWidth: 150 },
    { field: 'agent_commission', title: 'Hoa hồng đại lý', minWidth: 150 },
    { field: 'promotion', title: 'Ưu đãi', minWidth: 150 },
    { field: 'third_rebate', title: 'Hoàn trả bên thứ 3', minWidth: 150 },
    { field: 'third_activity_amount', title: 'Tiền thưởng từ bên thứ 3', minWidth: 150 },
    { field: 'date', title: 'Thời gian', minWidth: 160 }
  ],
  // Báo cáo nhà cung cấp — upstream 7 fields (khớp trang gốc)
  'report-third': [
    AGENT_COL,
    { field: 'username', title: 'Tên tài khoản' },
    { field: 'platform_id_name', title: 'Nhà cung cấp game' },
    { field: 't_bet_times', title: 'Số lần cược' },
    { field: 't_bet_amount', title: 'Tiền cược' },
    { field: 't_turnover', title: 'Tiền cược hợp lệ' },
    { field: 't_prize', title: 'Tiền thưởng' },
    { field: 't_win_lose', title: 'Thắng thua' }
  ],
  // Nạp tiền — upstream 6 fields (khớp trang gốc)
  deposits: [
    AGENT_COL,
    { field: 'username', title: 'Tên tài khoản' },
    { field: 'user_parent_format', title: 'Thuộc đại lý' },
    { field: 'amount', title: 'Số tiền' },
    { field: 'type', title: 'Loại hình giao dịch' },
    { field: 'status', title: 'Trạng thái giao dịch' },
    { field: 'create_time', title: 'Thời gian tạo đơn' }
  ],
  // Rút tiền — upstream 8 fields (khớp trang gốc)
  withdrawals: [
    AGENT_COL,
    { field: 'serial_no', title: 'Mã giao dịch', width: 180 },
    { field: 'create_time', title: 'Thời gian tạo đơn', width: 160 },
    { field: 'username', title: 'Tên tài khoản' },
    { field: 'user_parent_format', title: 'Thuộc đại lý' },
    { field: 'amount', title: 'Số tiền' },
    { field: 'user_fee', title: 'Phí hội viên' },
    { field: 'true_amount', title: 'Số tiền thực tế' },
    { field: 'status_format', title: 'Trạng thái giao dịch' }
  ],
  // Tỷ lệ hoàn trả (upstream data, no local model)
  rebate: [
    { field: 'odds_11', title: 'Play Type', minWidth: 160 },
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
  rebate: []
}

/** Endpoint → backend proxy URL (parallel fetch from all agents) */
export const UPSTREAM_URL = {
  members: '/api/v1/sync/proxy/members',
  invites: '/api/v1/sync/proxy/invites',
  bets: '/api/v1/sync/proxy/bets',
  'bet-orders': '/api/v1/sync/proxy/bet-orders',
  'report-lottery': '/api/v1/sync/proxy/report-lottery',
  'report-funds': '/api/v1/sync/proxy/report-funds',
  'report-third': '/api/v1/sync/proxy/report-third',
  deposits: '/api/v1/sync/proxy/deposits',
  withdrawals: '/api/v1/sync/proxy/withdrawals',
  rebate: '/api/v1/sync/proxy/rebate'
}

/** Hash → icon mapping (matches sidebar menu icons) */
export const HASH_TO_ICON = {
  '#/users': 'hub-icon-user',
  '#/invite-list': 'hub-icon-user',
  '#/report-lottery': 'hub-icon-document',
  '#/report-funds': 'hub-icon-document',
  '#/report-provider': 'hub-icon-document',
  '#/deposit-list': 'hub-icon-money',
  '#/withdrawal-history': 'hub-icon-money',
  '#/bet-list': 'hub-icon-monitor',
  '#/bet-third-party': 'hub-icon-monitor',
  '#/rebate-list': 'hub-icon-menu',
  '#/settings-sync': 'hub-icon-settings'
}

/** Report total summary — fields to sum for blockquote below table
 *  type: 'unique' → count distinct values (e.g. unique usernames)
 *  type: 'sum'    → sum numeric values (default)
 *  color: true    → green/red based on positive/negative
 */
export const REPORT_TOTAL_FIELDS = {
  'report-lottery': [
    { field: 'username', label: 'Số khách đặt cược', type: 'unique' },
    { field: 'bet_count', label: 'Số lần cược' },
    { field: 'bet_amount', label: 'Tiền cược' },
    { field: 'valid_amount', label: 'Tiền cược hợp lệ (trừ cược hoà)' },
    { field: 'rebate_amount', label: 'Hoàn trả' },
    { field: 'result', label: 'Thắng thua', color: true },
    { field: 'win_lose', label: 'Kết quả thắng thua (không gồm hoàn trả)', color: true },
    { field: 'prize', label: 'Tiền trúng' }
  ],
  'report-funds': [
    { field: 'deposit_amount', label: 'Số tiền nạp' },
    { field: 'withdrawal_amount', label: 'Số tiền rút' },
    { field: 'charge_fee', label: 'Phí dịch vụ' },
    { field: 'agent_commission', label: 'Hoa hồng đại lý' },
    { field: 'promotion', label: 'Ưu đãi' },
    { field: 'third_rebate', label: 'Hoàn trả bên thứ 3' },
    { field: 'third_activity_amount', label: 'Tiền thưởng từ bên thứ 3' }
  ],
  'report-third': [
    { field: 't_bet_times', label: 'Số lần cược' },
    { field: 'username', label: 'Số khách đặt cược', type: 'unique' },
    { field: 't_bet_amount', label: 'Tiền cược' },
    { field: 't_turnover', label: 'Tiền cược hợp lệ' },
    { field: 't_prize', label: 'Tiền thưởng' },
    { field: 't_win_lose', label: 'Thắng thua', color: true }
  ]
}

/** Hash → endpoint mapping */
export const HASH_TO_ENDPOINT = {
  '#/users': 'members',
  '#/invite-list': 'invites',
  '#/report-lottery': 'report-lottery',
  '#/report-funds': 'report-funds',
  '#/report-provider': 'report-third',
  '#/deposit-list': 'deposits',
  '#/withdrawal-history': 'withdrawals',
  '#/bet-list': 'bets',
  '#/bet-third-party': 'bet-orders',
  '#/rebate-list': 'rebate',
  '#/settings-sync': 'members'
}
