/**
 * Sync Service — Orchestrate incremental data sync from upstream to local DB.
 *
 * Features:
 *   - Incremental: tracks last_data_date per endpoint, only fetches new data
 *   - Batch upload: chunks large datasets (5000 records per POST)
 *   - Date tagging: reports without date in data get report_date from query param
 *   - Random verification: spot-check synced data against DB
 *   - Progress callback: real-time status updates
 *
 * Usage:
 *   import { syncAll, syncEndpoint } from '../services/sync.js'
 *   const results = await syncAll((progress) => console.log(progress))
 *   // or sync a single endpoint:
 *   const result = await syncEndpoint('bet_order', onProgress)
 */

import http from '../api/http.js'
import { SYNC_API } from '../constants/index.js'
import {
  memberApi, betOrderApi, betApi, depositWithdrawalApi,
  reportLotteryApi, reportFundsApi, reportThirdGameApi,
  bankApi, inviteApi, rebateApi,
  fetchAllPages, fetchDateChunked
} from '../api/upstream.js'

// --------------- Constants ---------------

const BATCH_SIZE = 5000         // Max records per POST to backend
const VERIFY_SAMPLE_SIZE = 5    // Random records to verify per sync
const DEFAULT_AGENT_ID = 1

// --------------- Date helpers ---------------

const today = () => new Date().toISOString().slice(0, 10)

const daysAgo = (n) => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

// --------------- Endpoint configs ---------------

/**
 * Configuration for each syncable endpoint.
 * @typedef {Object} EndpointConfig
 * @property {string} name          - Backend endpoint name (matches sync_metadata)
 * @property {Function} listFn      - Upstream API list function
 * @property {string} syncUrl       - Backend sync endpoint URL
 * @property {string} [dateParam]   - Upstream date param name (null = no date filter)
 * @property {string} [dateField]   - Date field in response data (for tracking)
 * @property {boolean} [datetime]   - Use datetime format for date param
 * @property {string} [defaultStart]- Default start date for first sync
 * @property {boolean} [sensitive]  - Strip sensitive fields (members only)
 * @property {string} [renameDate]  - Rename this field to 'report_date'
 * @property {boolean} [dayByDay]   - Fetch day by day (reports without date in data)
 */
const ENDPOINTS = {
  // --- Non-date endpoints (full sync) ---
  members: {
    name: 'members',
    listFn: memberApi.list,
    syncUrl: SYNC_API.MEMBERS,
    dateField: 'update_time',
    sensitive: true,
  },

  // --- Date-chunked endpoints (7-day max per request) ---
  bet_order: {
    name: 'bet_order',
    listFn: betOrderApi.list,
    syncUrl: SYNC_API.BET_ORDERS,
    dateParam: 'bet_time',
    dateField: 'bet_time',
    datetime: false,
    defaultStart: daysAgo(7),
  },
  bet_lottery: {
    name: 'bet_lottery',
    listFn: betApi.list,
    syncUrl: SYNC_API.BET_LOTTERY,
    dateParam: 'create_time',
    dateField: 'create_time',
    datetime: true,
    defaultStart: daysAgo(7),
  },
  deposit_withdrawal: {
    name: 'deposit_withdrawal',
    listFn: depositWithdrawalApi.list,
    syncUrl: SYNC_API.DEPOSITS,
    dateParam: 'create_time',
    dateField: 'create_time',
    datetime: false,
    defaultStart: daysAgo(30),
  },

  // --- Report endpoints (day-by-day, tag with report_date) ---
  report_lottery: {
    name: 'report_lottery',
    listFn: reportLotteryApi.list,
    syncUrl: SYNC_API.REPORT_LOTTERY,
    dateParam: 'date',
    dateField: 'report_date',
    dayByDay: true,
    defaultStart: daysAgo(30),
  },
  report_funds: {
    name: 'report_funds',
    listFn: reportFundsApi.list,
    syncUrl: SYNC_API.REPORT_FUNDS,
    dateParam: 'date',
    dateField: 'report_date',
    renameDate: 'date',         // upstream 'date' → our 'report_date'
    dayByDay: true,
    defaultStart: daysAgo(30),
  },
  report_third_game: {
    name: 'report_third_game',
    listFn: reportThirdGameApi.list,
    syncUrl: SYNC_API.REPORT_THIRD_GAME,
    dateParam: 'date',
    dateField: 'report_date',
    dayByDay: true,
    defaultStart: daysAgo(30),
  },
}

// --------------- Sync status ---------------

let _statusCache = null

async function getStatus() {
  const res = await http.get(SYNC_API.STATUS)
  _statusCache = {}
  for (const ep of (res.endpoints || [])) {
    _statusCache[ep.endpoint] = ep
  }
  return _statusCache
}

function getEndpointStatus(name) {
  return _statusCache?.[name] || null
}

/**
 * Get last synced data date for an endpoint.
 * This is the ACTUAL date of the most recent data record, not the sync timestamp.
 */
function getLastDataDate(name) {
  const st = getEndpointStatus(name)
  return st?.sync_params?.last_data_date || null
}

// --------------- Batch upload ---------------

async function postBatched(url, records, agentId = DEFAULT_AGENT_ID, onProgress) {
  let totalProcessed = 0
  const batches = Math.ceil(records.length / BATCH_SIZE)

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE)
    const batchNum = Math.floor(i / BATCH_SIZE) + 1
    onProgress?.({
      step: 'upload',
      message: `Batch ${batchNum}/${batches} (${batch.length} records)`,
    })
    const res = await http.post(url, { data: batch, agent_id: agentId })
    totalProcessed += res.processed || 0
  }

  return totalProcessed
}

// --------------- Verification ---------------

/**
 * Pick N random records from fetched data, query them from DB, compare IDs.
 * Returns { ok, checked, found, missing }
 */
async function verifyRandom(endpoint, fetchedRecords, n = VERIFY_SAMPLE_SIZE) {
  if (fetchedRecords.length === 0) return { ok: true, checked: 0 }

  // Pick N random unique records
  const shuffled = [...fetchedRecords].sort(() => Math.random() - 0.5)
  const samples = shuffled.slice(0, Math.min(n, fetchedRecords.length))

  // Get IDs (all our tables have 'id' or 'uid')
  const ids = samples.map(r => r.id).filter(id => id != null)
  if (ids.length === 0) return { ok: true, checked: 0, reason: 'no IDs in data' }

  try {
    const res = await http.post(SYNC_API.VERIFY(endpoint), { ids })
    const dbIds = new Set((res.records || []).map(r => r.id))
    const missing = ids.filter(id => !dbIds.has(id))

    return {
      ok: missing.length === 0,
      checked: ids.length,
      found: dbIds.size,
      missing,
    }
  } catch {
    return { ok: false, checked: ids.length, error: 'verify request failed' }
  }
}

// --------------- Core sync functions ---------------

/**
 * Sync members — no date filter, full upsert.
 * Members API has no date range filter, so we fetch all and let DB handle dedup.
 */
async function syncMembers(onProgress) {
  onProgress?.({ endpoint: 'members', step: 'fetch', message: 'Fetching all members...' })

  const { data } = await fetchAllPages(memberApi.list, {}, { pageSize: 50, sensitive: true })
  if (data.length === 0) {
    return { endpoint: 'members', fetched: 0, processed: 0, skipped: false }
  }

  onProgress?.({ endpoint: 'members', step: 'upload', message: `Uploading ${data.length} members...` })
  const processed = await postBatched(SYNC_API.MEMBERS, data, DEFAULT_AGENT_ID, onProgress)

  onProgress?.({ endpoint: 'members', step: 'verify', message: 'Verifying random samples...' })
  const verify = await verifyRandom('members', data)

  return { endpoint: 'members', fetched: data.length, processed, verify }
}

/**
 * Sync date-based endpoint (bet_order, bet_lottery, deposit_withdrawal).
 * Uses fetchDateChunked with 7-day windows. Incremental from last_data_date.
 */
async function syncDateBased(config, onProgress) {
  const lastDate = getLastDataDate(config.name)
  const startDate = lastDate || config.defaultStart || daysAgo(7)
  const endDate = today()

  if (startDate >= endDate) {
    onProgress?.({ endpoint: config.name, step: 'skip', message: `Up to date (last: ${startDate})` })
    return { endpoint: config.name, fetched: 0, processed: 0, skipped: true, lastDate: startDate }
  }

  onProgress?.({
    endpoint: config.name,
    step: 'fetch',
    message: `Fetching ${config.name} from ${startDate} to ${endDate}...`,
  })

  const data = await fetchDateChunked(
    config.listFn, startDate, endDate, {},
    { pageSize: 50, datetime: config.datetime || false, dateParam: config.dateParam },
  )

  if (data.length === 0) {
    return { endpoint: config.name, fetched: 0, processed: 0, startDate, endDate }
  }

  onProgress?.({ endpoint: config.name, step: 'upload', message: `Uploading ${data.length} records...` })
  const processed = await postBatched(config.syncUrl, data, DEFAULT_AGENT_ID, onProgress)

  onProgress?.({ endpoint: config.name, step: 'verify', message: 'Verifying...' })
  const verify = await verifyRandom(config.name, data)

  return { endpoint: config.name, fetched: data.length, processed, verify, startDate, endDate }
}

/**
 * Sync report endpoint — fetch day by day, tag records with report_date.
 *
 * Reports are daily aggregations. Some (report_lottery, report_third_game) don't
 * include the date in individual records, so we must add it from the query param.
 * report_funds has 'date' field which we rename to 'report_date'.
 */
async function syncReport(config, onProgress) {
  const lastDate = getLastDataDate(config.name)
  const startDate = lastDate || config.defaultStart || daysAgo(30)
  const endDate = today()

  if (startDate >= endDate) {
    onProgress?.({ endpoint: config.name, step: 'skip', message: `Up to date (last: ${startDate})` })
    return { endpoint: config.name, fetched: 0, processed: 0, skipped: true, lastDate: startDate }
  }

  onProgress?.({
    endpoint: config.name,
    step: 'fetch',
    message: `Fetching ${config.name} day by day from ${startDate}...`,
  })

  const allData = []
  const current = new Date(startDate)
  const end = new Date(endDate)

  while (current <= end) {
    const dateStr = current.toISOString().slice(0, 10)
    const dateRange = `${dateStr}|${dateStr}`

    const { data } = await fetchAllPages(
      config.listFn,
      { [config.dateParam]: dateRange },
      { pageSize: 50 },
    )

    // Tag each record with report_date
    for (const record of data) {
      if (config.renameDate && record[config.renameDate] != null) {
        // report_funds: rename 'date' → 'report_date'
        record.report_date = record[config.renameDate]
        delete record[config.renameDate]
      } else if (!record.report_date) {
        // report_lottery, report_third_game: add report_date from query
        record.report_date = dateStr
      }
    }

    allData.push(...data)

    onProgress?.({
      endpoint: config.name,
      step: 'fetch',
      message: `${dateStr}: ${data.length} records (total: ${allData.length})`,
    })

    current.setDate(current.getDate() + 1)
  }

  if (allData.length === 0) {
    return { endpoint: config.name, fetched: 0, processed: 0, startDate, endDate }
  }

  onProgress?.({ endpoint: config.name, step: 'upload', message: `Uploading ${allData.length} records...` })
  const processed = await postBatched(config.syncUrl, allData, DEFAULT_AGENT_ID, onProgress)

  return { endpoint: config.name, fetched: allData.length, processed, startDate, endDate }
}

/**
 * Sync config data — always full sync (small static data).
 * Includes: lottery_series, lottery_games, invite_list, bank_list
 */
async function syncConfig(onProgress) {
  onProgress?.({ endpoint: 'config', step: 'fetch', message: 'Fetching config data...' })

  const body = { agent_id: DEFAULT_AGENT_ID }

  // Lottery series + games from rebate API
  try {
    const lotteryInit = await rebateApi.getLotteryInit()
    if (lotteryInit.code === 1 && lotteryInit.data) {
      body.lottery_series = lotteryInit.data.seriesData || []
      body.lottery_games = lotteryInit.data.lotteryData || []
    }
  } catch (e) {
    console.warn('[sync] Failed to fetch lottery config:', e.message)
  }

  // Invite list
  const { data: invites } = await fetchAllPages(inviteApi.list, {}, { pageSize: 50 })
  if (invites.length) body.invite_list = invites

  // Bank list
  const { data: banks } = await fetchAllPages(bankApi.list, {}, { pageSize: 50 })
  if (banks.length) body.bank_list = banks

  onProgress?.({ endpoint: 'config', step: 'upload', message: 'Uploading config...' })
  const res = await http.post(SYNC_API.CONFIG, body)

  return { endpoint: 'config', processed: res.processed }
}

// --------------- Orchestrator ---------------

/**
 * Sync a single endpoint by name.
 * @param {string} name - Endpoint name (e.g., 'bet_order', 'members', 'report_funds')
 * @param {Function} [onProgress] - Progress callback
 * @returns {Promise<Object>} Sync result
 */
export async function syncEndpoint(name, onProgress) {
  if (!_statusCache) await getStatus()

  if (name === 'config') return syncConfig(onProgress)
  if (name === 'members') return syncMembers(onProgress)

  const config = ENDPOINTS[name]
  if (!config) throw new Error(`Unknown endpoint: ${name}`)

  if (config.dayByDay) return syncReport(config, onProgress)
  if (config.dateParam) return syncDateBased(config, onProgress)

  throw new Error(`Endpoint ${name} has no sync strategy`)
}

/**
 * Sync ALL endpoints in optimal order.
 *
 * Order:
 *   1. Config (small, reference data)
 *   2. Members (needed for FKs)
 *   3. Bet orders (highest volume, 224K/day)
 *   4. Bet lottery (52K/day)
 *   5. Deposits (18K/week)
 *   6. Reports (daily aggregates)
 *
 * @param {Function} [onProgress] - Progress callback: ({ endpoint, step, message })
 * @returns {Promise<Object[]>} Array of sync results
 */
export async function syncAll(onProgress) {
  const results = []
  const startTime = Date.now()

  // 1. Refresh sync status from backend
  await getStatus()

  // 2. Sync in order
  const order = [
    'config',
    'members',
    'bet_order',
    'bet_lottery',
    'deposit_withdrawal',
    'report_lottery',
    'report_funds',
    'report_third_game',
  ]

  for (const name of order) {
    try {
      onProgress?.({ endpoint: name, step: 'start', message: `Starting ${name}...` })
      const result = await syncEndpoint(name, onProgress)
      results.push(result)
      onProgress?.({ endpoint: name, step: 'done', message: `Done: ${result.processed || 0} records`, result })
    } catch (e) {
      results.push({ endpoint: name, error: e.message })
      onProgress?.({ endpoint: name, step: 'error', message: e.message })
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
  onProgress?.({ step: 'complete', message: `All sync complete in ${elapsed}s`, results })

  return results
}

// --------------- Exports ---------------

export {
  getStatus,
  getLastDataDate,
  verifyRandom,
  syncMembers,
  syncConfig,
  ENDPOINTS,
}
