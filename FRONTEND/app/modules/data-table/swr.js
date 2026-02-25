/**
 * SWR (Stale-While-Revalidate) silent background refresh.
 * When the cache returns stale data, this fetches fresh data in the
 * background and patches the DOM without a full table reload.
 * @module data-table/swr
 */

import { moduleState } from './state.js'
import { authHeaders } from './helpers.js'
import { renderTotalSummary } from './total-summary.js'

/**
 * Silently refresh table data from upstream and patch DOM cells in-place.
 * @param {string} upstreamUrl - The upstream POST URL
 * @param {string} endpoint - Current endpoint key (used to guard against stale callbacks)
 */
export const swrSilentRefresh = async (upstreamUrl, endpoint) => {
  await new Promise((r) => setTimeout(r, 200))
  try {
    if (moduleState.currentEndpoint !== endpoint) return

    const formBody = new URLSearchParams()
    Object.entries(moduleState.swrCurrentWhere).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') formBody.append(k, String(v))
    })
    formBody.append('page', String(moduleState.swrPage))
    formBody.append('limit', String(moduleState.swrLimit))

    const resp = await fetch(upstreamUrl + '?_fresh=1', {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' }),
      body: formBody.toString()
    })
    const freshRes = await resp.json()
    moduleState.swrReloading = false

    if (moduleState.currentEndpoint !== endpoint) return
    if (!freshRes.data || !freshRes.data.length) return

    const view = document.querySelector('#dataTable')?.closest('.layui-table-view')
    if (!view) return

    freshRes.data.forEach((row, idx) => {
      for (const [field, value] of Object.entries(row)) {
        if (field === 'LAY_TABLE_INDEX') continue
        const cells = view.querySelectorAll(
          `tr[data-index="${idx}"] td[data-field="${field}"] .layui-table-cell`
        )
        const newVal = String(value ?? '')
        cells.forEach((cell) => {
          if (cell.children.length > 0) return
          if (cell.textContent.trim() !== newVal.trim()) {
            cell.textContent = newVal
          }
        })
      }
    })

    if (typeof layui !== 'undefined' && layui.table && layui.table.cache) {
      layui.table.cache['dataTable'] = freshRes.data.map((row, i) => ({
        ...row, LAY_TABLE_INDEX: i
      }))
    }

    renderTotalSummary(endpoint, freshRes.data, freshRes._totals)
  } catch (e) {
    console.warn('[swr] silent refresh failed:', e.message)
    moduleState.swrReloading = false
  }
}
