/**
 * Sync Service — Orchestrate incremental data sync from upstream to local DB.
 */

import http from '../api/http.js'
import { SYNC_API } from '../constants/index.js'
import {
  memberApi, betOrderApi, betApi, depositWithdrawalApi,
  reportLotteryApi, reportFundsApi, reportThirdGameApi,
  bankApi, inviteApi, rebateApi
} from '../api/upstream.js'
import { fetchAllPages, fetchDateChunked } from '../api/upstream-sync.js'
import {
  DEFAULT_AGENT_ID, today, daysAgo,
  getStatus, getLastDataDate, isStatusCached,
  postBatched, verifyRandom
} from './sync-helpers.js'

// --------------- Endpoint configs ---------------

/**
 * @typedef {Object} EndpointConfig
 * @property {string} name
 * @property {Function} listFn
 * @property {string} syncUrl
 * @property {string} [dateParam]
 * @property {string} [dateField]
 * @property {boolean} [datetime]
 * @property {string} [defaultStart]
 * @property {boolean} [sensitive]
 * @property {string} [renameDate]
 * @property {boolean} [dayByDay]
 */
const ENDPOINTS = {
  members: {
    name: 'members',
    listFn: memberApi.list,
    syncUrl: SYNC_API.MEMBERS,
    dateField: 'update_time',
    sensitive: true,
  },
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
    renameDate: 'date',
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

// --------------- Core sync functions ---------------

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

    for (const record of data) {
      if (config.renameDate && record[config.renameDate] != null) {
        record.report_date = record[config.renameDate]
        delete record[config.renameDate]
      } else if (!record.report_date) {
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

async function syncConfig(onProgress) {
  onProgress?.({ endpoint: 'config', step: 'fetch', message: 'Fetching config data...' })

  const body = { agent_id: DEFAULT_AGENT_ID }

  try {
    const lotteryInit = await rebateApi.getLotteryInit()
    if (lotteryInit.code === 1 && lotteryInit.data) {
      body.lottery_series = lotteryInit.data.seriesData || []
      body.lottery_games = lotteryInit.data.lotteryData || []
    }
  } catch (_) {
    /* lottery config fetch failed — non-critical */
  }

  const { data: invites } = await fetchAllPages(inviteApi.list, {}, { pageSize: 50 })
  if (invites.length) body.invite_list = invites

  const { data: banks } = await fetchAllPages(bankApi.list, {}, { pageSize: 50 })
  if (banks.length) body.bank_list = banks

  onProgress?.({ endpoint: 'config', step: 'upload', message: 'Uploading config...' })
  const res = await http.post(SYNC_API.CONFIG, body)

  return { endpoint: 'config', processed: res.processed }
}

// --------------- Orchestrator ---------------

export async function syncEndpoint(name, onProgress) {
  if (!isStatusCached()) await getStatus()

  if (name === 'config') return syncConfig(onProgress)
  if (name === 'members') return syncMembers(onProgress)

  const config = ENDPOINTS[name]
  if (!config) throw new Error(`Unknown endpoint: ${name}`)

  if (config.dayByDay) return syncReport(config, onProgress)
  if (config.dateParam) return syncDateBased(config, onProgress)

  throw new Error(`Endpoint ${name} has no sync strategy`)
}

export async function syncAll(onProgress) {
  const results = []
  const startTime = Date.now()

  await getStatus()

  const order = [
    'config', 'members', 'bet_order', 'bet_lottery',
    'deposit_withdrawal', 'report_lottery', 'report_funds', 'report_third_game',
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

export {
  getStatus,
  getLastDataDate,
  verifyRandom,
  syncMembers,
  syncConfig,
  ENDPOINTS,
}
