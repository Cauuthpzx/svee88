export const TOKEN_KEY = 'token'
export const THEME_KEY = 'color-scheme'
export const DEBOUNCE_MS = 300
export const THROTTLE_MS = 100
export const REFRESH_API = '/api/v1/refresh'
export const INTENDED_ROUTE_KEY = 'intended_route'

export const PASSWORD_MIN_LENGTH = 8
export const USERNAME_MIN_LENGTH = 2
export const USERNAME_MAX_LENGTH = 20
export const NAME_MIN_LENGTH = 2
export const NAME_MAX_LENGTH = 30
export const USERNAME_PATTERN = /^[a-z0-9]+$/

export const ROUTES = {
  LOGIN: '#/login',
  REGISTER: '#/register',
  DASHBOARD: '#/dashboard',
  USERS: '#/users',
  POSTS: '#/posts',
  TIERS: '#/tiers',
  TASKS: '#/tasks',
  INVITE_LIST: '#/invite-list',
  REPORT_LOTTERY: '#/report-lottery',
  REPORT_FUNDS: '#/report-funds',
  REPORT_PROVIDER: '#/report-provider',
  DEPOSIT_LIST: '#/deposit-list',
  WITHDRAWAL_HISTORY: '#/withdrawal-history',
  BET_LIST: '#/bet-list',
  BET_THIRD_PARTY: '#/bet-third-party',
  CHANGE_LOGIN_PW: '#/change-login-pw',
  CHANGE_TRADE_PW: '#/change-trade-pw',
  REBATE_LIST: '#/rebate-list',
  SETTINGS_SYSTEM: '#/settings-system',
  SETTINGS_SYNC: '#/settings-sync'
}

export const ROUTE_TITLES = {
  [ROUTES.DASHBOARD]: 'Trang chủ',
  [ROUTES.USERS]: 'Danh sách hội viên',
  [ROUTES.INVITE_LIST]: 'Mã giới thiệu',
  [ROUTES.REPORT_LOTTERY]: 'Báo cáo xổ số',
  [ROUTES.REPORT_FUNDS]: 'Báo cáo tài chính',
  [ROUTES.REPORT_PROVIDER]: 'Báo cáo nhà cung cấp',
  [ROUTES.DEPOSIT_LIST]: 'Nạp / Rút tiền',
  [ROUTES.WITHDRAWAL_HISTORY]: 'Lịch sử rút tiền',
  [ROUTES.BET_LIST]: 'Cược xổ số',
  [ROUTES.BET_THIRD_PARTY]: 'Cược bên thứ 3',
  [ROUTES.CHANGE_LOGIN_PW]: 'Đổi mật khẩu đăng nhập',
  [ROUTES.CHANGE_TRADE_PW]: 'Đổi mật khẩu giao dịch',
  [ROUTES.REBATE_LIST]: 'Tỷ lệ hoàn trả',
  [ROUTES.POSTS]: 'Quản lý bài viết',
  [ROUTES.TIERS]: 'Quản lý cấp bậc',
  [ROUTES.TASKS]: 'Quản lý tác vụ',
  [ROUTES.SETTINGS_SYSTEM]: 'Hệ thống',
  [ROUTES.SETTINGS_SYNC]: 'Đồng bộ & Tài khoản'
}

export const API = {
  LOGIN: '/api/v1/login',
  REGISTER: '/api/v1/user',
  LOGOUT: '/api/v1/logout',
  USER_ME: '/api/v1/user/me/',
  USERS: '/api/v1/users',
  USER: (username) => `/api/v1/user/${username}`,
  POSTS: (username) => `/api/v1/${username}/posts`,
  POST: (username, id) => `/api/v1/${username}/post/${id}`,
  POST_CREATE: (username) => `/api/v1/${username}/post`,
  TIERS: '/api/v1/tiers',
  TIER: (name) => `/api/v1/tier/${name}`,
  TASKS_CREATE: '/api/v1/tasks/task',
  TASK: (id) => `/api/v1/tasks/task/${id}`
}

/** Sync API — backend endpoints for data synchronization */
export const SYNC_API = {
  STATUS: '/api/v1/sync/status',
  MEMBERS: '/api/v1/sync/members',
  BET_ORDERS: '/api/v1/sync/bet-orders',
  BET_LOTTERY: '/api/v1/sync/bet-lottery',
  DEPOSITS: '/api/v1/sync/deposits',
  REPORT_LOTTERY: '/api/v1/sync/reports/lottery',
  REPORT_FUNDS: '/api/v1/sync/reports/funds',
  REPORT_THIRD_GAME: '/api/v1/sync/reports/third-game',
  CONFIG: '/api/v1/sync/config',
  VERIFY: (ep) => `/api/v1/sync/verify/${ep}`
}

/** Upstream (remote management system) endpoints */
export const UPSTREAM = {
  MEMBERS: '/agent/user.html',
  INVITE_LIST: '/agent/inviteList.html',
  REPORT_LOTTERY: '/agent/reportLottery.html',
  REPORT_FUNDS: '/agent/reportFunds.html',
  REPORT_THIRD_GAME: '/agent/reportThirdGame.html',
  DEPOSIT_WITHDRAWAL: '/agent/depositAndWithdrawal.html',
  WITHDRAWAL_RECORD: '/agent/withdrawalsRecord.html',
  BET: '/agent/bet.html',
  BET_ORDER: '/agent/betOrder.html',
  GET_LOTTERY: '/agent/getLottery',
  REBATE_ODDS: '/agent/getRebateOddsPanel',
  WITHDRAW: '/agent/withdraw.html',
  EDIT_PASSWORD: '/agent/editPassword',
  EDIT_FUND_PASSWORD: '/agent/editFundPassword'
}

/** Route → section mapping for transition type detection */
export const ROUTE_SECTIONS = {
  [ROUTES.DASHBOARD]: 'dashboard',
  [ROUTES.USERS]: 'members',
  [ROUTES.INVITE_LIST]: 'members',
  [ROUTES.REPORT_LOTTERY]: 'reports',
  [ROUTES.REPORT_FUNDS]: 'reports',
  [ROUTES.REPORT_PROVIDER]: 'reports',
  [ROUTES.DEPOSIT_LIST]: 'finance',
  [ROUTES.WITHDRAWAL_HISTORY]: 'finance',
  [ROUTES.BET_LIST]: 'bets',
  [ROUTES.BET_THIRD_PARTY]: 'bets',
  [ROUTES.CHANGE_LOGIN_PW]: 'customer',
  [ROUTES.CHANGE_TRADE_PW]: 'customer',
  [ROUTES.REBATE_LIST]: 'rebate',
  [ROUTES.POSTS]: 'content',
  [ROUTES.TIERS]: 'system',
  [ROUTES.TASKS]: 'system',
  [ROUTES.SETTINGS_SYSTEM]: 'settings',
  [ROUTES.SETTINGS_SYNC]: 'settings'
}

/** Must match longest CSS transition duration */
export const TRANSITION_MS = 350

export const MSG = {
  LOGIN_SUCCESS: 'Đăng nhập thành công',
  REGISTER_SUCCESS: 'Đăng ký thành công, vui lòng đăng nhập',
  LOGOUT_SUCCESS: 'Đăng xuất thành công',
  INVALID_EMAIL: 'Email không hợp lệ',
  PASSWORD_TOO_SHORT: 'Mật khẩu tối thiểu 8 ký tự',
  PASSWORD_MISMATCH: 'Mật khẩu xác nhận không khớp',
  USERNAME_INVALID: 'Tên đăng nhập chỉ gồm chữ thường và số',
  USERNAME_LENGTH: 'Tên đăng nhập từ 2–20 ký tự',
  NAME_LENGTH: 'Họ tên từ 2–30 ký tự',
  NETWORK_ERROR: 'Lỗi kết nối, vui lòng thử lại',
  SERVER_ERROR: 'Lỗi hệ thống, vui lòng thử lại sau'
}
