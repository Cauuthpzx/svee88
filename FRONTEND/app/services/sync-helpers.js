/**
 * Sync Helpers — shared utilities for sync service.
 * Status cache, batch upload, verification, date helpers.
 */

import http from '../api/http.js'
import { SYNC_API } from '../constants/index.js'

const BATCH_SIZE = 5000
const VERIFY_SAMPLE_SIZE = 5
export const DEFAULT_AGENT_ID = 1

// --------------- Date helpers ---------------

export const today = () => new Date().toISOString().slice(0, 10)

export const daysAgo = (n) => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

// --------------- Sync status ---------------

let _statusCache = null

export async function getStatus() {
  const res = await http.get(SYNC_API.STATUS)
  _statusCache = {}
  for (const ep of (res.endpoints || [])) {
    _statusCache[ep.endpoint] = ep
  }
  return _statusCache
}

export function getEndpointStatus(name) {
  return _statusCache?.[name] || null
}

export function getLastDataDate(name) {
  const st = getEndpointStatus(name)
  return st?.sync_params?.last_data_date || null
}

export function isStatusCached() {
  return _statusCache !== null
}

// --------------- Batch upload ---------------

export async function postBatched(url, records, agentId = DEFAULT_AGENT_ID, onProgress) {
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

export async function verifyRandom(endpoint, fetchedRecords, n = VERIFY_SAMPLE_SIZE) {
  if (fetchedRecords.length === 0) return { ok: true, checked: 0 }

  const shuffled = [...fetchedRecords].sort(() => Math.random() - 0.5)
  const samples = shuffled.slice(0, Math.min(n, fetchedRecords.length))

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
