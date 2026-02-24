/**
 * Upstream API Client
 *
 * Fetch data from the remote management system and sync to local server.
 *
 * Authentication: PHPSESSID cookie (session-based, set via browser)
 * Proxy: Vite dev server proxies /agent/* to upstream (see vite.config.js)
 *
 * Response formats:
 *   Table APIs  → { code: 0, count: N, data: [...] }
 *     Some include: total_data (aggregates), form_data (pre-fill), hsDateTime
 *   Rebate APIs → { code: 1, msg: "", data: {...} }  (code=1 = success!)
 *
 * Date param names (CRITICAL — each endpoint uses different field!):
 *   reportLottery/Funds/ThirdGame → param: "date"   format: "YYYY-MM-DD|YYYY-MM-DD"
 *   depositAndWithdrawal          → param: "create_time" format: "YYYY-MM-DD|YYYY-MM-DD" (max 7 days!)
 *   withdrawalsRecord             → param: "create_time" format: "YYYY-MM-DD|YYYY-MM-DD"
 *   bet.html (lottery)            → param: "create_time" format: "YYYY-MM-DD HH:mm:ss|..." (max 7 days!)
 *   betOrder.html (3rd party)     → param: "bet_time"    format: "YYYY-MM-DD|YYYY-MM-DD" (max 7 days!)
 */

import axios from 'axios'

// --------------- axios instance ---------------

const upstream = axios.create({
  baseURL: '',
  timeout: 30000,
  withCredentials: true,
  headers: { 'X-Requested-With': 'XMLHttpRequest' }
})

upstream.interceptors.response.use(
  (res) => res.data,
  (error) => {
    console.error('[upstream]', error?.response?.status, error.message)
    return Promise.reject(error)
  }
)

// --------------- helpers ---------------

/** Build URLSearchParams, skipping empty/null values */
function formParams(obj) {
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(obj)) {
    if (v !== '' && v != null) p.append(k, v)
  }
  return p
}

const FORM_HEADER = { 'Content-Type': 'application/x-www-form-urlencoded' }

/** POST with form-urlencoded */
function postForm(url, data = {}) {
  return upstream.post(url, formParams(data), { headers: FORM_HEADER })
}

/** POST with JSON body */
function postJson(url, data = {}) {
  return upstream.post(url, data)
}

/** Remove sensitive fields (password hashes, salt) from member records */
function stripSensitive(records) {
  const SENSITIVE = ['password', 'fund_password', 'salt']
  return records.map(r => {
    const clean = { ...r }
    for (const key of SENSITIVE) delete clean[key]
    return clean
  })
}

// =====================================================================
//  1. MEMBERS (Hội viên thuộc cấp)
//     URL: POST /agent/user.html
//     Method: form-urlencoded
//     ⚠ Response includes password hashes — use stripSensitive() !
// =====================================================================
/**
 * @param {object} opts
 * @param {number} opts.page            - Trang (default 1)
 * @param {number} opts.limit           - Số dòng/trang (default 10)
 * @param {string} [opts.username]      - Tìm theo tên tài khoản
 * @param {string} [opts.status]        - 0=Chưa đánh giá, 1=Bình thường, 2=Đóng băng, 3=Khoá
 * @param {string} [opts.first_deposit_time] - "YYYY-MM-DD|YYYY-MM-DD"
 * @param {string} [opts.sort_field]    - money|login_time|register_time|deposit_money|withdrawal_money
 * @param {string} [opts.sort_direction] - desc|asc
 *
 * Actual response fields (verified):
 *   id, username, user_parent, user_tree, level,
 *   salt*, password*, fund_password*,  ← SENSITIVE — stripped by stripSensitive()
 *   type, group_id, status, login_ip, useragent, device, login_time,
 *   register_ip, register_time, truename, phone, email, email_verified,
 *   remark, note, invite_code, phone_verified, phone_verified_time,
 *   agent_type, is_tester, first_deposit_time, create_time, update_time,
 *   money, deposit_times, deposit_money, withdrawal_times, withdrawal_money,
 *   type_format, parent_user, deposit_count, deposit_amount,
 *   withdrawal_count, withdrawal_amount, status_format
 */
export const memberApi = {
  list: ({ page = 1, limit = 10, username, status, first_deposit_time,
           sort_field, sort_direction } = {}) =>
    postForm('/agent/user.html', {
      page, limit, username, status,
      first_deposit_time, sort_field, sort_direction
    }),

  /** Inline edit a field: scene=editField, id, field, value */
  editField: (id, field, value) =>
    postForm('/agent/user.html', { scene: 'editField', id, field, value })
}

// =====================================================================
//  2. INVITE CODES (Mã giới thiệu)
//     URL: POST /agent/inviteList.html
//     Method: form-urlencoded
//     Note: Không có filter form — chỉ pagination
// =====================================================================
/**
 * Actual response fields (verified):
 *   id, uid, invite_code, group_id, user_type,
 *   rebate_arr (JSON string with series rebate config),
 *   reg_count, remark, create_time, update_time,
 *   recharge_count, first_recharge_count,
 *   register_recharge_count, scope_reg_count
 */
export const inviteApi = {
  list: ({ page = 1, limit = 10 } = {}) =>
    postForm('/agent/inviteList.html', { page, limit })
}

// =====================================================================
//  3. REPORT - LOTTERY (Báo cáo xổ số)
//     URL: POST /agent/reportLottery.html
//     Method: form-urlencoded
//     Note: Mặc định ngày hôm nay nếu không truyền create_time
//     Response extra: hsDateTime, total_data
// =====================================================================
/**
 * @param {object} opts
 * @param {string} [opts.username]  - Tên tài khoản
 * @param {string} [opts.date]      - "YYYY-MM-DD|YYYY-MM-DD" ⚠ param name is "date" NOT "create_time"!
 * @param {string} [opts.lottery_id] - ID xổ số (từ rebateApi.getLotteryInit)
 *
 * Data fields (verified): uid, lottery_id, bet_count, bet_amount,
 *   valid_amount, rebate_amount, result, win_lose, prize,
 *   username, user_parent_format, lottery_name
 *
 * total_data: total_bet_count, total_bet_amount, total_valid_amount,
 *   total_rebate_amount, total_result, total_win_lose, total_prize, total_bet_number
 */
export const reportLotteryApi = {
  list: ({ page = 1, limit = 10, username, date, lottery_id } = {}) =>
    postForm('/agent/reportLottery.html', {
      page, limit, username, date, lottery_id
    })
}

// =====================================================================
//  4. REPORT - FUNDS (Sao kê giao dịch)
//     URL: POST /agent/reportFunds.html
//     Method: form-urlencoded
//     Note: Mặc định ngày hôm nay. Response extra: hsDateTime, total_data
// =====================================================================
/**
 * @param {object} opts
 * @param {string} [opts.username] - Tên tài khoản
 * @param {string} [opts.date]     - "YYYY-MM-DD|YYYY-MM-DD" ⚠ param name is "date"!
 *
 * Data fields (verified): id, uid, user_parent, date, deposit_count, deposit_amount,
 *   withdrawal_count, withdrawal_amount, charge_fee, agent_commission,
 *   promotion, third_rebate, username, user_parent_format
 *
 * total_data: total_deposit_count, total_deposit_amount,
 *   total_withdrawal_count, total_withdrawal_amount, total_charge_fee,
 *   total_agent_commission, total_promotion, total_third_rebate,
 *   third_activity_amount
 */
export const reportFundsApi = {
  list: ({ page = 1, limit = 10, username, date } = {}) =>
    postForm('/agent/reportFunds.html', {
      page, limit, username, date
    })
}

// =====================================================================
//  5. REPORT - THIRD PARTY GAMES (Báo cáo nhà cung cấp)
//     URL: POST /agent/reportThirdGame.html
//     Method: form-urlencoded
//     Note: Mặc định ngày hôm nay. Response extra: hsDateTime, total_data
// =====================================================================
/**
 * @param {object} opts
 * @param {string} [opts.username]    - Tên tài khoản
 * @param {string} [opts.date]        - "YYYY-MM-DD|YYYY-MM-DD" ⚠ param name is "date"!
 * @param {string} [opts.platform_id] - ID nhà cung cấp (từ HTML form select)
 *
 * Data fields (verified): uid, platform_id, t_bet_amount, t_bet_times,
 *   t_turnover, t_prize, t_win_lose, username, platform_id_name
 *
 * total_data: total_bet_amount, total_turnover, total_prize,
 *   total_win_lose, total_bet_times, total_bet_number
 */
export const reportThirdGameApi = {
  list: ({ page = 1, limit = 10, username, date, platform_id } = {}) =>
    postForm('/agent/reportThirdGame.html', {
      page, limit, username, date, platform_id
    })
}

// =====================================================================
//  6. BANK LIST (Thẻ ngân hàng)
//     URL: POST /agent/bankList.html
//     Method: form-urlencoded
//     Note: Không có search form — chỉ pagination
// =====================================================================
/**
 * Response fields: id, is_default, bank, branch, card_number, create_time
 */
export const bankApi = {
  list: ({ page = 1, limit = 10 } = {}) =>
    postForm('/agent/bankList.html', { page, limit })
}

// =====================================================================
//  7. DEPOSIT & WITHDRAWAL (Nạp/rút tiền)
//     URL: POST /agent/depositAndWithdrawal.html
//     Method: form-urlencoded
//     ⚠ MAX 7-DAY DATE RANGE — server returns code=1 error if exceeded
//     Date format: "YYYY-MM-DD|YYYY-MM-DD"
//     Response extra: hsDateTime
// =====================================================================
/**
 * @param {object} opts
 * @param {string} [opts.create_time] - "YYYY-MM-DD|YYYY-MM-DD" (max 7 ngày!)
 * @param {string} [opts.username]    - Tên tài khoản
 * @param {string} [opts.type]        - 1=Nạp tiền, 2=Rút tiền
 * @param {string} [opts.status]      - 0=Chờ xử lí, 1=Hoàn tất, 2=Đang xử lí, 3=Không thành công
 *
 * Actual response fields (verified):
 *   id, serial_no, uid, user_parent, user_tree, group_id,
 *   amount, true_amount, firm_fee, user_fee, rebate,
 *   name, bank_id, branch, account, transfer_time,
 *   remark, user_remark, status (text: "Hoàn tất"/"Chờ xử lí"/...),
 *   prostatus (number), operator, prize_amount, activity_id, extra,
 *   category_id, merchant_id, pay_type, trade_id, is_tester,
 *   success_time, review_time, transfer_record, currency,
 *   create_time, update_time, username, user_parent_format,
 *   type (text: "Nạp tiền"/"Rút tiền")
 */
export const depositWithdrawalApi = {
  list: ({ page = 1, limit = 10, create_time, username, type, status } = {}) =>
    postForm('/agent/depositAndWithdrawal.html', {
      page, limit, create_time, username, type, status
    })
}

// =====================================================================
//  8. WITHDRAWAL RECORDS (Lịch sử rút tiền)
//     URL: POST /agent/withdrawalsRecord.html
//     Method: form-urlencoded
//     Date format: "YYYY-MM-DD|YYYY-MM-DD"
// =====================================================================
/**
 * @param {object} opts
 * @param {string} [opts.create_time] - "YYYY-MM-DD|YYYY-MM-DD"
 * @param {string} [opts.username]    - Tên tài khoản
 * @param {string} [opts.serial_no]   - Mã giao dịch
 * @param {string} [opts.status]      - 0=Chờ xử lí, 1=Hoàn tất, 2=Đang xử lí, 3=Không thành công
 */
export const withdrawalRecordApi = {
  list: ({ page = 1, limit = 10, create_time, username, serial_no, status } = {}) =>
    postForm('/agent/withdrawalsRecord.html', {
      page, limit, create_time, username, serial_no, status
    })
}

// =====================================================================
//  9. BET ORDERS - LOTTERY (Đơn cược xổ số)
//     URL: POST /agent/bet.html
//     Method: form-urlencoded
//     ⚠ MAX 7-DAY DATE RANGE
//     ⚠ Date format: "YYYY-MM-DD HH:mm:ss|YYYY-MM-DD HH:mm:ss" (DATETIME!)
//     ⚠ Hidden param: es=1 (from page JS: var es = parseInt("1"))
//     Response extra: form_data (pre-fill filters)
// =====================================================================
/**
 * @param {object} opts
 * @param {string} [opts.username]      - Tên người dùng
 * @param {string} [opts.create_time]  - "YYYY-MM-DD HH:mm:ss|YYYY-MM-DD HH:mm:ss" (max 7 ngày!)
 * @param {string} [opts.serial_no]    - Mã giao dịch
 * @param {string} [opts.lottery_id]   - ID xổ số
 * @param {string} [opts.play_type_id] - ID loại chơi
 * @param {string} [opts.play_id]      - ID cách chơi
 * @param {string} [opts.status]       - Trạng thái
 * @param {number} [opts.es=1]        - Hidden param (from page JS: var es = parseInt("1"))
 *
 * Actual response fields (verified):
 *   id, serial_no, uid, user_parent, user_tree,
 *   bet_data_set (nested object: { uid: { odds, rebate } }),
 *   issue, issue_id, lottery_id, lottery_name,
 *   play_id, play_type_id, odds_id, odds,
 *   content, count, win_count, real_count, real_win_count,
 *   price, money, rebate, rebate_amount, result, prize,
 *   status (number: -1=không trúng, 0=chờ, 1=trúng),
 *   commission_status, source, prize_time, ip, is_tester,
 *   create_time, update_time, username,
 *   play_type_name, play_name, status_text
 */
export const betApi = {
  list: ({ page = 1, limit = 10, username, create_time,
           serial_no, lottery_id, play_type_id, play_id, status, es = 1 } = {}) =>
    postForm('/agent/bet.html', {
      page, limit, username, create_time, serial_no, lottery_id,
      play_type_id, play_id, status, es
    })
}

// =====================================================================
//  10. BET ORDERS - THIRD PARTY (Đơn cược bên thứ 3)
//      URL: POST /agent/betOrder.html
//      Method: form-urlencoded
//      ⚠ Param: "bet_time" (NOT create_time!)  format: "YYYY-MM-DD|YYYY-MM-DD"
//      ⚠ MAX 7-DAY DATE RANGE
//      ⚠ Hidden param: es=1 (from page JS: var es = parseInt("1"))
//      Response extra: bet_time, form_data
// =====================================================================
/**
 * @param {object} opts
 * @param {string} [opts.username]          - Tên người dùng
 * @param {string} [opts.bet_time]          - "YYYY-MM-DD|YYYY-MM-DD" (max 7 ngày!)
 * @param {string} [opts.serial_no]         - Mã giao dịch
 * @param {string} [opts.platform_username] - Tên user trên platform
 * @param {number} [opts.es=1]              - Hidden param (from page JS), returns full record with raw numbers
 *
 * Response fields (with es=1): id, serial_no, bet_time, cid, platform_id, uid,
 *   game_name, game_code, bet_amount (number), turnover (number), prize (number),
 *   win_lose (number), extra, origin, prizetime, create_time, update_time,
 *   delete_time, platform_id_name, c_name, platform_username
 *
 * Response fields (without es): id, uid, platform_id, cid, serial_no,
 *   bet_amount (string "1000.0000"), turnover, prize, win_lose, bet_time,
 *   game_name, platform_id_name, c_name, platform_username
 */
export const betOrderApi = {
  list: ({ page = 1, limit = 10, username, bet_time, serial_no, platform_username, es = 1 } = {}) =>
    postForm('/agent/betOrder.html', {
      page, limit, username, bet_time, serial_no, platform_username, es
    })
}

// =====================================================================
//  11. REBATE ODDS (Tỉ lệ hoàn trả)
//      URL: POST /agent/getLottery (JSON)
//           POST /agent/getRebateOddsPanel (JSON)
//      Method: JSON body (NOT form-urlencoded!)
//      ⚠ Response code=1 means SUCCESS (khác table APIs code=0)
// =====================================================================
/**
 * getLotteryInit response (verified):
 *   { code:1, msg:"", data: {
 *       seriesData: [{id, name}],         // 9 series: Miền Nam, Miền Bắc, ...
 *       lotteryData: [{id, name, series_id}], // 24+ lotteries
 *       tableHead: [{title, field}],      // odds column headers
 *       tableBody: [[name, odds...]],     // odds data rows
 *       firsSeriesId: 1,
 *       firsLotteryId: 1
 *   }}
 *
 * getOddsPanel response (verified):
 *   { code:1, msg:"", data: {
 *       tableHead: [{title, field}],
 *       tableBody: [[playTypeName, odds_10, odds_9, ..., odds_1]]
 *   }}
 */
export const rebateApi = {
  getLotteryInit: () =>
    postJson('/agent/getLottery', { type: 'init' }),

  getLotteryBySeries: (seriesId) =>
    postJson('/agent/getLottery', { type: 'getLottery', series_id: seriesId }),

  getOddsPanel: (lotteryId, seriesId) =>
    postJson('/agent/getRebateOddsPanel', { lottery_id: lotteryId, series_id: seriesId })
}

// =====================================================================
//  12. WITHDRAW COMMISSION (Rút hoa hồng)
//      URL: POST /agent/withdraw.html
//      Method: form-urlencoded
// =====================================================================
export const withdrawApi = {
  submit: (data) => postForm('/agent/withdraw.html', data)
}

// =====================================================================
//  13. ACCOUNT SETTINGS (Thông tin khách hàng)
//      URL: POST /agent/editPassword (form-urlencoded)
//           POST /agent/editFundPassword (form-urlencoded)
//      Params: oldPwd, newPwd, confirmPwd
// =====================================================================
export const accountApi = {
  changePassword: (oldPwd, newPwd, confirmPwd) =>
    postForm('/agent/editPassword', { oldPwd, newPwd, confirmPwd }),

  changeFundPassword: (oldPwd, newPwd, confirmPwd) =>
    postForm('/agent/editFundPassword', { oldPwd, newPwd, confirmPwd })
}

// =====================================================================
//  14. USER REBATE SETTINGS (Cài đặt hoàn trả cho hội viên)
//      URL: GET /agent/seeUserRebate?id={userId} (popup iframe)
// =====================================================================
export const userRebateApi = {
  get: (userId) =>
    upstream.get('/agent/seeUserRebate', { params: { id: userId } })
}

// =====================================================================
//  SYNC HELPERS — fetch all pages, handle date chunking
// =====================================================================

/**
 * Fetch ALL records from a paginated table endpoint.
 * Automatically strips sensitive fields from member data.
 *
 * @param {Function} listFn - One of the .list() functions above
 * @param {object} filters - Filter params (without page/limit)
 * @param {object} [options]
 * @param {number} [options.pageSize=50] - Records per page
 * @param {boolean} [options.sensitive=false] - Strip password/salt fields
 * @returns {Promise<{data: Array, totalData: object|null}>}
 */
export async function fetchAllPages(listFn, filters = {}, { pageSize = 50, sensitive = false } = {}) {
  const allData = []
  let page = 1
  let totalCount = Infinity
  let totalData = null

  while (allData.length < totalCount) {
    const res = await listFn({ ...filters, page, limit: pageSize })

    if (res.code !== 0 || !Array.isArray(res.data)) {
      console.error('[upstream] fetchAllPages unexpected response:', res)
      break
    }

    totalCount = res.count
    allData.push(...res.data)
    if (res.total_data && !totalData) totalData = res.total_data

    if (res.data.length < pageSize) break
    page++
  }

  const cleaned = sensitive ? stripSensitive(allData) : allData
  return { data: cleaned, totalData }
}

/**
 * Fetch data from endpoints with a MAX 7-day date range.
 * Automatically chunks the date range into 7-day windows.
 *
 * @param {Function} listFn - List function (depositWithdrawalApi.list, betApi.list, etc.)
 * @param {string} startDate - Start date "YYYY-MM-DD"
 * @param {string} endDate - End date "YYYY-MM-DD"
 * @param {object} filters - Extra filters (username, type, status, etc.)
 * @param {object} [options]
 * @param {number} [options.pageSize=50]
 * @param {boolean} [options.datetime=false] - Use datetime format (for bet.html)
 * @param {string} [options.dateParam='create_time'] - Date field name ('create_time', 'bet_time', 'date')
 * @returns {Promise<Array>}
 */
export async function fetchDateChunked(listFn, startDate, endDate, filters = {}, { pageSize = 50, datetime = false, dateParam = 'create_time' } = {}) {
  const allData = []
  const start = new Date(startDate)
  const end = new Date(endDate)
  const MAX_DAYS = 6 // 7-day inclusive range = 6 days apart

  let chunkStart = new Date(start)
  while (chunkStart <= end) {
    const chunkEnd = new Date(chunkStart)
    chunkEnd.setDate(chunkEnd.getDate() + MAX_DAYS)
    if (chunkEnd > end) chunkEnd.setTime(end.getTime())

    const fmt = (d) => d.toISOString().slice(0, 10)
    let dateValue
    if (datetime) {
      dateValue = `${fmt(chunkStart)} 00:00:00|${fmt(chunkEnd)} 23:59:59`
    } else {
      dateValue = `${fmt(chunkStart)}|${fmt(chunkEnd)}`
    }

    const { data } = await fetchAllPages(listFn, { ...filters, [dateParam]: dateValue }, { pageSize })
    allData.push(...data)

    chunkStart.setDate(chunkStart.getDate() + MAX_DAYS + 1)
  }

  return allData
}

/**
 * Fetch data and POST to local backend for sync.
 *
 * @param {Function} listFn - Upstream list function
 * @param {string} localEndpoint - Local API endpoint to POST data to
 * @param {object} filters - Upstream filters
 * @param {object} [options]
 * @param {number} [options.pageSize=50]
 * @param {boolean} [options.sensitive=false] - Strip sensitive fields
 * @returns {Promise<{fetched: number, synced: boolean}>}
 *
 * Example:
 *   await syncToLocal(memberApi.list, '/api/v1/sync/members', {}, { sensitive: true })
 */
export async function syncToLocal(listFn, localEndpoint, filters = {}, { pageSize = 50, sensitive = false } = {}) {
  const { data } = await fetchAllPages(listFn, filters, { pageSize, sensitive })
  if (data.length === 0) return { fetched: 0, synced: true }

  const res = await axios.post(localEndpoint, { data, count: data.length }, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 60000
  })

  return { fetched: data.length, synced: res.status === 200 }
}
