/**
 * Shared helpers for data-table sub-modules.
 * @module data-table/helpers
 */

import { getToken } from '../../utils/index.js'
import { formatDateStr } from '../../utils/format.js'

/**
 * Build an Authorization header object with the current Bearer token.
 * @param {Object} [extra={}] - Additional headers to merge
 * @returns {Object} Headers object suitable for fetch() or layui table
 */
export const authHeaders = (extra = {}) => {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}`, ...extra } : { ...extra }
}

/**
 * Alias for formatDateStr — Date to `YYYY-MM-DD`.
 * @param {Date} d
 * @returns {string}
 */
export const getDateStr = formatDateStr

/**
 * Load active agents into a <select> dropdown and re-render Layui select.
 * @param {HTMLSelectElement} selectEl - The <select> element to populate
 * @param {Object} form - Layui form instance for re-rendering
 */
export const loadAgentOptions = (selectEl, form) => {
  if (!selectEl) return
  fetch('/api/v1/sync/agent-options', { headers: authHeaders() })
    .then((r) => r.json())
    .then((res) => {
      const agents = res.agents || []
      for (const ag of agents) {
        const opt = document.createElement('option')
        opt.value = ag.id
        opt.textContent = ag.owner
        selectEl.appendChild(opt)
      }
      if (agents.length) form.render('select')
    })
    .catch((e) => console.warn('[agents]', e.message))
}
