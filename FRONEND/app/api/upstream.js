/**
 * Upstream API Definitions
 *
 * Endpoint wrappers for the remote management system.
 * Auth: PHPSESSID cookie. Proxy: Vite dev server → upstream.
 *
 * Response formats:
 *   Table APIs  → { code: 0, count: N, data: [...] }
 *   Rebate APIs → { code: 1, msg: "", data: {...} }
 */

import { postForm, postJson } from './upstream-client.js'

// ── 1. MEMBERS ──
export const memberApi = {
  list: ({ page = 1, limit = 10, username, status, first_deposit_time,
           sort_field, sort_direction } = {}) =>
    postForm('/agent/user.html', {
      page, limit, username, status,
      first_deposit_time, sort_field, sort_direction
    }),

  editField: (id, field, value) =>
    postForm('/agent/user.html', { scene: 'editField', id, field, value })
}

// ── 2. INVITE CODES ──
export const inviteApi = {
  list: ({ page = 1, limit = 10 } = {}) =>
    postForm('/agent/inviteList.html', { page, limit })
}

// ── 3. REPORT - LOTTERY ──
export const reportLotteryApi = {
  list: ({ page = 1, limit = 10, username, date, lottery_id } = {}) =>
    postForm('/agent/reportLottery.html', {
      page, limit, username, date, lottery_id
    })
}

// ── 4. REPORT - FUNDS ──
export const reportFundsApi = {
  list: ({ page = 1, limit = 10, username, date } = {}) =>
    postForm('/agent/reportFunds.html', {
      page, limit, username, date
    })
}

// ── 5. REPORT - THIRD PARTY GAMES ──
export const reportThirdGameApi = {
  list: ({ page = 1, limit = 10, username, date, platform_id } = {}) =>
    postForm('/agent/reportThirdGame.html', {
      page, limit, username, date, platform_id
    })
}

// ── 6. BANK LIST ──
export const bankApi = {
  list: ({ page = 1, limit = 10 } = {}) =>
    postForm('/agent/bankList.html', { page, limit })
}

// ── 7. DEPOSIT & WITHDRAWAL ──
export const depositWithdrawalApi = {
  list: ({ page = 1, limit = 10, create_time, username, type, status } = {}) =>
    postForm('/agent/depositAndWithdrawal.html', {
      page, limit, create_time, username, type, status
    })
}

// ── 8. BET ORDERS - LOTTERY ──
export const betApi = {
  list: ({ page = 1, limit = 10, username, create_time,
           serial_no, lottery_id, play_type_id, play_id, status, es = 1 } = {}) =>
    postForm('/agent/bet.html', {
      page, limit, username, create_time, serial_no, lottery_id,
      play_type_id, play_id, status, es
    })
}

// ── 10. BET ORDERS - THIRD PARTY ──
export const betOrderApi = {
  list: ({ page = 1, limit = 10, username, bet_time, serial_no, platform_username, es = 1 } = {}) =>
    postForm('/agent/betOrder.html', {
      page, limit, username, bet_time, serial_no, platform_username, es
    })
}

// ── 11. REBATE ODDS ──
export const rebateApi = {
  getLotteryInit: () =>
    postJson('/agent/getLottery', { type: 'init' }),

  getLotteryBySeries: (seriesId) =>
    postJson('/agent/getLottery', { type: 'getLottery', series_id: seriesId }),

  getOddsPanel: (lotteryId, seriesId) =>
    postJson('/agent/getRebateOddsPanel', { lottery_id: lotteryId, series_id: seriesId })
}

