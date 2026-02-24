/**
 * Full 30-day sync test for agent 112233.
 *
 * Runs via Node.js against the Vite dev server (port 3000) which proxies:
 *   - /agent/* → upstream management system (with PHPSESSID cookie)
 *   - /api/*   → local FastAPI backend
 *
 * Usage: node test-sync.js
 */

const axios = require('axios')

const BASE = 'http://localhost:3000'
const BACKEND = 'http://localhost:8000'
const AGENT_ID = 1
const BATCH_SIZE = 5000
const PAGE_SIZE = 50

// --- Date helpers ---

const today = () => new Date().toISOString().slice(0, 10)
const daysAgo = (n) => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}
const fmtDate = (d) => d.toISOString().slice(0, 10)

// --- HTTP helpers ---

const upstream = axios.create({
  baseURL: BASE,
  timeout: 60000,
  headers: { 'X-Requested-With': 'XMLHttpRequest' }
})

const backend = axios.create({
  baseURL: BACKEND,
  timeout: 120000,
  headers: { 'Content-Type': 'application/json' }
})

function postForm(url, data = {}) {
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(data)) {
    if (v !== '' && v != null) params.append(k, v)
  }
  return upstream.post(url, params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  }).then(r => r.data)
}

// --- Sensitive field stripping ---
const SENSITIVE = ['password', 'fund_password', 'salt']
const stripSensitive = (records) =>
  records.map(r => {
    const c = { ...r }
    for (const k of SENSITIVE) delete c[k]
    return c
  })

// --- Fetch all pages ---

async function fetchAllPages(listFn, filters = {}, { pageSize = 50, sensitive = false } = {}) {
  const allData = []
  let page = 1
  let totalCount = Infinity

  while (allData.length < totalCount) {
    const res = await listFn({ ...filters, page, limit: pageSize })
    if (res.code !== 0 || !Array.isArray(res.data)) {
      console.error('  fetchAllPages unexpected:', JSON.stringify(res).slice(0, 200))
      break
    }
    totalCount = res.count
    allData.push(...res.data)
    if (res.data.length < pageSize) break
    page++
  }

  return sensitive ? stripSensitive(allData) : allData
}

// --- Fetch date-chunked (max 7-day windows) ---

async function fetchDateChunked(listFn, startDate, endDate, filters = {}, { pageSize = 50, datetime = false, dateParam = 'create_time' } = {}) {
  const allData = []
  const start = new Date(startDate)
  const end = new Date(endDate)
  const MAX_DAYS = 6

  let chunkStart = new Date(start)
  while (chunkStart <= end) {
    const chunkEnd = new Date(chunkStart)
    chunkEnd.setDate(chunkEnd.getDate() + MAX_DAYS)
    if (chunkEnd > end) chunkEnd.setTime(end.getTime())

    let dateValue
    if (datetime) {
      dateValue = `${fmtDate(chunkStart)} 00:00:00|${fmtDate(chunkEnd)} 23:59:59`
    } else {
      dateValue = `${fmtDate(chunkStart)}|${fmtDate(chunkEnd)}`
    }

    const data = await fetchAllPages(listFn, { ...filters, [dateParam]: dateValue }, { pageSize })
    allData.push(...data)
    process.stdout.write(`    chunk ${fmtDate(chunkStart)}→${fmtDate(chunkEnd)}: ${data.length} (total: ${allData.length})\n`)

    chunkStart.setDate(chunkStart.getDate() + MAX_DAYS + 1)
  }

  return allData
}

// --- Upload batched ---

async function postBatched(url, records) {
  let total = 0
  const batches = Math.ceil(records.length / BATCH_SIZE)
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE)
    const batchNum = Math.floor(i / BATCH_SIZE) + 1
    process.stdout.write(`    uploading batch ${batchNum}/${batches} (${batch.length} records)...`)
    const res = await backend.post(url, { data: batch, agent_id: AGENT_ID })
    total += res.data.processed || 0
    process.stdout.write(` done (${res.data.processed})\n`)
  }
  return total
}

// --- Verify random ---

async function verifyRandom(endpoint, records, n = 5) {
  if (records.length === 0) return { ok: true, checked: 0 }
  const shuffled = [...records].sort(() => Math.random() - 0.5)
  const samples = shuffled.slice(0, Math.min(n, records.length))
  const ids = samples.map(r => r.id).filter(id => id != null)
  if (ids.length === 0) return { ok: true, checked: 0, reason: 'no IDs' }

  try {
    const res = await backend.post(`/api/v1/sync/verify/${endpoint}`, { ids })
    const dbIds = new Set((res.data.records || []).map(r => r.id))
    const missing = ids.filter(id => !dbIds.has(id))
    return { ok: missing.length === 0, checked: ids.length, found: dbIds.size, missing }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

// --- API functions ---

const memberApi = {
  list: (opts = {}) => postForm('/agent/user.html', opts)
}
const betOrderApi = {
  list: (opts = {}) => postForm('/agent/betOrder.html', { es: 1, ...opts })
}
const betApi = {
  list: (opts = {}) => postForm('/agent/bet.html', { es: 1, ...opts })
}
const depositApi = {
  list: (opts = {}) => postForm('/agent/depositAndWithdrawal.html', opts)
}
const reportLotteryApi = {
  list: (opts = {}) => postForm('/agent/reportLottery.html', opts)
}
const reportFundsApi = {
  list: (opts = {}) => postForm('/agent/reportFunds.html', opts)
}
const reportThirdGameApi = {
  list: (opts = {}) => postForm('/agent/reportThirdGame.html', opts)
}
const inviteApi = {
  list: (opts = {}) => postForm('/agent/inviteList.html', opts)
}
const bankApi = {
  list: (opts = {}) => postForm('/agent/bankList.html', opts)
}
const rebateApi = {
  getLotteryInit: () => upstream.post('/agent/getLottery', { type: 'init' }).then(r => r.data)
}

// =====================================================================
//  SYNC FUNCTIONS
// =====================================================================

async function syncConfig() {
  console.log('\n[1/8] CONFIG (lottery_series, lottery_games, invite_list, bank_list)')
  const body = { agent_id: AGENT_ID }
  let t = Date.now()

  try {
    const lotteryInit = await rebateApi.getLotteryInit()
    if (lotteryInit.code === 1 && lotteryInit.data) {
      body.lottery_series = lotteryInit.data.seriesData || []
      body.lottery_games = lotteryInit.data.lotteryData || []
      console.log(`  lottery: ${body.lottery_series.length} series, ${body.lottery_games.length} games`)
    }
  } catch (e) {
    console.warn('  lottery fetch failed:', e.message)
  }

  const invites = await fetchAllPages(inviteApi.list, {}, { pageSize: 50 })
  if (invites.length) body.invite_list = invites
  console.log(`  invites: ${invites.length}`)

  const banks = await fetchAllPages(bankApi.list, {}, { pageSize: 50 })
  if (banks.length) body.bank_list = banks
  console.log(`  banks: ${banks.length}`)

  const res = await backend.post('/api/v1/sync/config', body)
  console.log(`  => ${res.data.processed} records in ${((Date.now() - t) / 1000).toFixed(1)}s`)
  return res.data
}

async function syncMembers() {
  console.log('\n[2/8] MEMBERS')
  let t = Date.now()
  const data = await fetchAllPages(memberApi.list, {}, { pageSize: 50, sensitive: true })
  console.log(`  fetched: ${data.length} in ${((Date.now() - t) / 1000).toFixed(1)}s`)
  if (data.length === 0) return { fetched: 0, processed: 0 }

  t = Date.now()
  const processed = await postBatched('/api/v1/sync/members', data)
  console.log(`  uploaded: ${processed} in ${((Date.now() - t) / 1000).toFixed(1)}s`)

  const verify = await verifyRandom('members', data)
  console.log(`  verify: ${verify.ok ? 'OK' : 'FAIL'} (${verify.checked} checked, ${verify.found} found)`)
  return { fetched: data.length, processed, verify }
}

async function syncBetOrders() {
  const startDate = daysAgo(30)
  const endDate = today()
  console.log(`\n[3/8] BET_ORDER (${startDate} → ${endDate})`)
  let t = Date.now()

  const data = await fetchDateChunked(betOrderApi.list, startDate, endDate, {}, {
    pageSize: 50, datetime: false, dateParam: 'bet_time'
  })
  console.log(`  fetched: ${data.length} in ${((Date.now() - t) / 1000).toFixed(1)}s`)
  if (data.length === 0) return { fetched: 0, processed: 0 }

  t = Date.now()
  const processed = await postBatched('/api/v1/sync/bet-orders', data)
  console.log(`  uploaded: ${processed} in ${((Date.now() - t) / 1000).toFixed(1)}s`)

  const verify = await verifyRandom('bet_order', data)
  console.log(`  verify: ${verify.ok ? 'OK' : 'FAIL'} (${verify.checked} checked, ${verify.found} found)`)
  return { fetched: data.length, processed, verify }
}

async function syncBetLottery() {
  const startDate = daysAgo(30)
  const endDate = today()
  console.log(`\n[4/8] BET_LOTTERY (${startDate} → ${endDate})`)
  let t = Date.now()

  const data = await fetchDateChunked(betApi.list, startDate, endDate, {}, {
    pageSize: 50, datetime: true, dateParam: 'create_time'
  })
  console.log(`  fetched: ${data.length} in ${((Date.now() - t) / 1000).toFixed(1)}s`)
  if (data.length === 0) return { fetched: 0, processed: 0 }

  t = Date.now()
  const processed = await postBatched('/api/v1/sync/bet-lottery', data)
  console.log(`  uploaded: ${processed} in ${((Date.now() - t) / 1000).toFixed(1)}s`)

  const verify = await verifyRandom('bet_lottery', data)
  console.log(`  verify: ${verify.ok ? 'OK' : 'FAIL'} (${verify.checked} checked, ${verify.found} found)`)
  return { fetched: data.length, processed, verify }
}

async function syncDeposits() {
  const startDate = daysAgo(30)
  const endDate = today()
  console.log(`\n[5/8] DEPOSIT_WITHDRAWAL (${startDate} → ${endDate})`)
  let t = Date.now()

  const data = await fetchDateChunked(depositApi.list, startDate, endDate, {}, {
    pageSize: 50, datetime: false, dateParam: 'create_time'
  })
  console.log(`  fetched: ${data.length} in ${((Date.now() - t) / 1000).toFixed(1)}s`)
  if (data.length === 0) return { fetched: 0, processed: 0 }

  t = Date.now()
  const processed = await postBatched('/api/v1/sync/deposits', data)
  console.log(`  uploaded: ${processed} in ${((Date.now() - t) / 1000).toFixed(1)}s`)

  const verify = await verifyRandom('deposit_withdrawal', data)
  console.log(`  verify: ${verify.ok ? 'OK' : 'FAIL'} (${verify.checked} checked, ${verify.found} found)`)
  return { fetched: data.length, processed, verify }
}

async function syncReportDayByDay(name, listFn, syncUrl, dateParam = 'date', renameDate = null) {
  const startDate = daysAgo(30)
  const endDate = today()
  const idx = { report_lottery: '6/8', report_funds: '7/8', report_third_game: '8/8' }
  console.log(`\n[${idx[name]}] ${name.toUpperCase()} (${startDate} → ${endDate})`)
  let t = Date.now()
  const allData = []

  const current = new Date(startDate)
  const end = new Date(endDate)
  while (current <= end) {
    const dateStr = fmtDate(current)
    const dateRange = `${dateStr}|${dateStr}`
    const data = await fetchAllPages(listFn, { [dateParam]: dateRange }, { pageSize: 50 })

    for (const record of data) {
      if (renameDate && record[renameDate] != null) {
        record.report_date = record[renameDate]
        delete record[renameDate]
      } else if (!record.report_date) {
        record.report_date = dateStr
      }
    }

    allData.push(...data)
    if (data.length > 0) {
      process.stdout.write(`    ${dateStr}: ${data.length} records\n`)
    }
    current.setDate(current.getDate() + 1)
  }

  console.log(`  fetched: ${allData.length} in ${((Date.now() - t) / 1000).toFixed(1)}s`)
  if (allData.length === 0) return { fetched: 0, processed: 0 }

  t = Date.now()
  const processed = await postBatched(syncUrl, allData)
  console.log(`  uploaded: ${processed} in ${((Date.now() - t) / 1000).toFixed(1)}s`)
  return { fetched: allData.length, processed }
}

// =====================================================================
//  MAIN
// =====================================================================

async function main() {
  console.log('='.repeat(60))
  console.log('FULL 30-DAY SYNC TEST — Agent 112233')
  console.log('='.repeat(60))
  const startAll = Date.now()

  // Step 1: Clear ALL sync data
  console.log('\n>>> STEP 1: Clearing all sync data...')
  const truncateSQL = `
    TRUNCATE TABLE sync_metadata, members, bank_list, invite_list,
    lottery_series, lottery_games, report_lottery, report_funds,
    report_third_game, bet_order, bet_lottery, deposit_withdrawal
    CASCADE;
  `
  try {
    // Use psql via the backend proxy or direct connection
    const { execSync } = require('child_process')
    execSync(`PGPASSWORD=hiepmun2021 psql -U postgres -d postgres_fastapi -c "${truncateSQL.replace(/\n/g, ' ')}"`, {
      stdio: 'pipe'
    })
    console.log('  All tables truncated.')
  } catch (e) {
    console.error('  Truncate failed, trying via backend...', e.message)
  }

  // Step 2: Run full sync
  console.log('\n>>> STEP 2: Running full sync...')
  const results = {}

  try {
    results.config = await syncConfig()
    results.members = await syncMembers()
    results.bet_order = await syncBetOrders()
    results.bet_lottery = await syncBetLottery()
    results.deposit_withdrawal = await syncDeposits()
    results.report_lottery = await syncReportDayByDay(
      'report_lottery', reportLotteryApi.list, '/api/v1/sync/reports/lottery', 'date')
    results.report_funds = await syncReportDayByDay(
      'report_funds', reportFundsApi.list, '/api/v1/sync/reports/funds', 'date', 'date')
    results.report_third_game = await syncReportDayByDay(
      'report_third_game', reportThirdGameApi.list, '/api/v1/sync/reports/third-game', 'date')
  } catch (e) {
    console.error('\n!!! SYNC ERROR:', e.message)
    if (e.response) console.error('  Response:', JSON.stringify(e.response.data).slice(0, 500))
  }

  // Step 3: Summary
  const elapsed = ((Date.now() - startAll) / 1000).toFixed(1)
  console.log('\n' + '='.repeat(60))
  console.log('SYNC COMPLETE')
  console.log('='.repeat(60))
  console.log(`Total time: ${elapsed}s`)
  console.log('\nResults:')
  for (const [k, v] of Object.entries(results)) {
    if (v.fetched !== undefined) {
      console.log(`  ${k.padEnd(22)} fetched: ${String(v.fetched).padStart(7)}  processed: ${String(v.processed).padStart(7)}${v.verify ? `  verify: ${v.verify.ok ? 'OK' : 'FAIL'}` : ''}`)
    } else {
      console.log(`  ${k.padEnd(22)} processed: ${v.processed}`)
    }
  }

  // Step 4: Verify DB counts
  console.log('\n>>> STEP 3: Verifying DB record counts...')
  try {
    const { execSync } = require('child_process')
    const tables = ['members', 'bet_order', 'bet_lottery', 'deposit_withdrawal',
      'report_lottery', 'report_funds', 'report_third_game',
      'lottery_series', 'lottery_games', 'invite_list', 'bank_list', 'sync_metadata']
    for (const table of tables) {
      const out = execSync(
        `PGPASSWORD=hiepmun2021 psql -U postgres -d postgres_fastapi -t -c "SELECT COUNT(*) FROM ${table};"`,
        { encoding: 'utf-8' }
      ).trim()
      console.log(`  ${table.padEnd(22)} ${out.trim()} rows`)
    }
  } catch (e) {
    console.error('  Count check failed:', e.message)
  }

  // Step 5: Check sync status
  console.log('\n>>> STEP 4: Sync status (last_data_date):')
  try {
    const res = await backend.get('/api/v1/sync/status')
    for (const ep of (res.data.endpoints || [])) {
      const lastDate = ep.sync_params?.last_data_date || 'N/A'
      console.log(`  ${ep.endpoint.padEnd(22)} last_data: ${lastDate}  count: ${ep.last_sync_count}  status: ${ep.sync_status}`)
    }
  } catch (e) {
    console.error('  Status check failed:', e.message)
  }

  console.log('\n' + '='.repeat(60))
  console.log(`DONE in ${elapsed}s`)
  console.log('='.repeat(60))
}

main().catch(e => {
  console.error('Fatal error:', e)
  process.exit(1)
})
