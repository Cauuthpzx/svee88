/**
 * Report total summary — renders aggregate totals below the table.
 * Uses server-provided _totals (computed from ALL data) when available,
 * falls back to client-side computation from page data only.
 * @module data-table/total-summary
 */

import { formatVN } from '../../utils/format.js'
import { t } from '../../i18n/index.js'
import { getReportTotalFields } from './config.js'

/**
 * Render or hide the total-summary bar below the data table.
 * @param {string} endpoint - Current endpoint key
 * @param {Object[]} data - Array of row objects from the current page
 * @param {Object|null} [serverTotals] - Server-computed totals from _totals field
 */
export const renderTotalSummary = (endpoint, data, serverTotals) => {
  const fields = getReportTotalFields(endpoint)
  const wrap = document.getElementById('data-total-wrap')
  if (!fields || !data || !data.length) {
    if (wrap) wrap.style.display = 'none'
    return
  }

  let totals, uniques

  if (serverTotals) {
    // Use server-provided totals (computed from ALL matching rows, not just current page)
    totals = serverTotals
    uniques = {}
    fields.forEach((f) => {
      if (f.type === 'unique' && serverTotals[f.field] != null) {
        uniques[f.field] = serverTotals[f.field]
      }
    })
  } else {
    // Fallback: compute from current page data only
    totals = {}
    uniques = {}
    fields.forEach((f) => {
      if (f.type === 'unique') uniques[f.field] = new Set()
      else totals[f.field] = 0
    })
    data.forEach((row) => {
      fields.forEach((f) => {
        if (f.type === 'unique') {
          if (row[f.field]) uniques[f.field].add(row[f.field])
        } else {
          totals[f.field] += parseFloat(row[f.field]) || 0
        }
      })
    })
    // Convert Sets to counts for uniform access below
    for (const key of Object.keys(uniques)) {
      uniques[key] = uniques[key].size
    }
  }

  const items = fields.map((f) => {
    let val, formatted
    if (f.type === 'unique') {
      val = uniques[f.field] ?? 0
      formatted = formatVN(typeof val === 'number' ? val : 0, true)
    } else {
      val = typeof totals[f.field] === 'number' ? totals[f.field] : parseFloat(totals[f.field]) || 0
      const isInt = /count|times/i.test(f.field)
      formatted = formatVN(val, isInt)
    }
    let cls = ''
    if (f.color) cls = val > 0 ? 'val-pos' : val < 0 ? 'val-neg' : ''
    return `<span class="total-item"><b>${f.label}:</b> <span class="total-val ${cls}">${formatted}</span></span>`
  }).join('<span class="total-sep">|</span>')

  const body = document.getElementById('data-total-body')
  if (body) body.innerHTML = `<i class="hub-icon hub-icon-chart"></i> <b>${t('table.summary')}:</b> ${items}`
  if (wrap) wrap.style.display = 'block'
}
