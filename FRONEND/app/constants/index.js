import { t } from '../i18n/index.js'

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

const ROUTE_TITLE_KEYS = {
  [ROUTES.DASHBOARD]: 'route.dashboard',
  [ROUTES.USERS]: 'route.members',
  [ROUTES.INVITE_LIST]: 'route.invites',
  [ROUTES.REPORT_LOTTERY]: 'route.report_lottery',
  [ROUTES.REPORT_FUNDS]: 'route.report_funds',
  [ROUTES.REPORT_PROVIDER]: 'route.report_provider',
  [ROUTES.DEPOSIT_LIST]: 'route.deposits',
  [ROUTES.WITHDRAWAL_HISTORY]: 'route.withdrawals',
  [ROUTES.BET_LIST]: 'route.bets',
  [ROUTES.BET_THIRD_PARTY]: 'route.bet_orders',
  [ROUTES.CHANGE_LOGIN_PW]: 'route.change_login_pw',
  [ROUTES.CHANGE_TRADE_PW]: 'route.change_trade_pw',
  [ROUTES.REBATE_LIST]: 'route.rebate',
  [ROUTES.POSTS]: 'route.posts',
  [ROUTES.TIERS]: 'route.tiers',
  [ROUTES.TASKS]: 'route.tasks',
  [ROUTES.SETTINGS_SYSTEM]: 'route.settings_system',
  [ROUTES.SETTINGS_SYNC]: 'route.settings_sync'
}

export const getRouteTitle = (hash) => {
  const key = ROUTE_TITLE_KEYS[hash]
  return key ? t(key) : ''
}

/** @deprecated Use getRouteTitle(hash) — kept for backward compatibility */
export const ROUTE_TITLES = new Proxy({}, {
  get: (_, hash) => getRouteTitle(hash)
})

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
  get LOGIN_SUCCESS() { return t('msg.login_success') },
  get REGISTER_SUCCESS() { return t('msg.register_success') },
  get LOGOUT_SUCCESS() { return t('msg.logout_success') },
  get INVALID_EMAIL() { return t('msg.invalid_email') },
  get PASSWORD_TOO_SHORT() { return t('msg.password_too_short') },
  get PASSWORD_MISMATCH() { return t('msg.password_mismatch') },
  get USERNAME_INVALID() { return t('msg.username_invalid') },
  get USERNAME_LENGTH() { return t('msg.username_length') },
  get NAME_LENGTH() { return t('msg.name_length') },
  get NETWORK_ERROR() { return t('msg.network_error') },
  get SERVER_ERROR() { return t('msg.server_error') }
}
