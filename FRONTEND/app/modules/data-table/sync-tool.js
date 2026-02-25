/**
 * Sync tool — control panel HTML, UI helpers, and event bindings.
 * Heavy operations live in sync-operations.js.
 * @module data-table/sync-tool
 */

import { t } from '../../i18n/index.js'
import { moduleState } from './state.js'

/* ── Sync endpoint icons (language-independent) ── */
const SYNC_EP_ICONS = {
  members: 'hub-icon-user',
  bet_order: 'hub-icon-monitor',
  bet_lottery: 'hub-icon-chart',
  deposit_withdrawal: 'hub-icon-money',
  report_lottery: 'hub-icon-graph',
  report_funds: 'hub-icon-document',
  report_third_game: 'hub-icon-database'
}

/** @type {string[]} Ordered list of sync endpoint keys */
export const SYNC_ORDER = [
  'members', 'bet_order', 'bet_lottery',
  'deposit_withdrawal', 'report_lottery', 'report_funds', 'report_third_game'
]

/**
 * Get the translated display label for a sync endpoint.
 * @param {string} ep - Endpoint key
 * @returns {string}
 */
export const getSyncEpLabel = (ep) => t(`sync.ep.${ep}`)

/* ── Sync tool panel HTML ── */
/**
 * Generate the sync control-panel HTML.
 * @returns {string} HTML string
 */
export const syncToolPanel = () => {
  const epCards = SYNC_ORDER.map((ep) => `
    <div class="sync-card" data-ep="${ep}">
      <div class="sync-card-header">
        <i class="hub-icon ${SYNC_EP_ICONS[ep]}"></i>
        <span class="sync-card-name">${getSyncEpLabel(ep)}</span>
        <span class="sync-card-badge" data-badge="${ep}"></span>
      </div>
      <div class="sync-card-progress">
        <div class="sync-progress-bar" data-bar="${ep}"></div>
      </div>
      <div class="sync-card-status" data-status="${ep}">
        <i class="hub-icon hub-icon-clock"></i> ${t('sync.waiting')}
      </div>
    </div>
  `).join('')

  return `
    <div class="sync-tool-panel">
      <fieldset class="layui-elem-field sync-control-field">
        <legend><i class="hub-icon hub-icon-tools"></i> ${t('sync.control_panel')}</legend>
        <div class="layui-field-box sync-control-box">
          <div class="sync-control-row">
            <div class="sync-btns">
              <button type="button" class="layui-btn layui-btn-sm" id="addAccountBtn">
                <i class="hub-icon hub-icon-plus"></i> ${t('sync.add_account')}
              </button>
              <button type="button" class="layui-btn layui-btn-sm layui-btn-normal" id="syncAllBtn">
                <i class="hub-icon hub-icon-sync" id="syncAllIcon"></i> ${t('sync.sync_all')}
              </button>
              <button type="button" class="layui-btn layui-btn-sm layui-btn-warm" id="hardSyncAllBtn">
                <i class="hub-icon hub-icon-lightning" id="hardSyncIcon"></i> ${t('sync.sync_full')}
              </button>
              <button type="button" class="layui-btn layui-btn-sm layui-btn-danger" id="testAllBtn">
                <i class="hub-icon hub-icon-checklist" id="testAllIcon"></i> ${t('sync.test_data')}
              </button>
              <button type="button" class="layui-btn layui-btn-sm layui-btn-primary" id="stopSyncBtn" style="display:none;">
                <i class="hub-icon hub-icon-stop"></i> ${t('sync.stop')}
              </button>
            </div>
            <div class="sync-speed-wrap">
              <label class="sync-speed-label">
                <i class="hub-icon hub-icon-speedometer"></i> ${t('sync.speed')}:
              </label>
              <input type="range" id="syncSpeedSlider" min="0" max="2000" step="100" value="500" class="sync-speed-slider">
              <span class="sync-speed-value" id="syncSpeedValue">500ms</span>
            </div>
          </div>
          <div class="sync-overall" id="syncOverall" style="display:none;">
            <div class="sync-overall-info">
              <span id="syncOverallLabel"><i class="hub-icon hub-icon-sync hub-icon-spin"></i> ${t('sync.syncing')}</span>
              <span id="syncOverallCount"></span>
            </div>
            <div class="sync-overall-progress">
              <div class="sync-overall-bar" id="syncOverallBar"></div>
            </div>
          </div>
        </div>
      </fieldset>

      <fieldset class="layui-elem-field sync-status-field">
        <legend><i class="hub-icon hub-icon-activity"></i> ${t('sync.status_title')}</legend>
        <div class="layui-field-box">
          <div class="sync-cards" id="syncCards">${epCards}</div>
        </div>
      </fieldset>

      <fieldset class="layui-elem-field sync-log-field">
        <legend><i class="hub-icon hub-icon-list"></i> ${t('sync.log_title')}</legend>
        <div class="layui-field-box">
          <div class="sync-log" id="syncLog">
            <div class="sync-log-item sync-log-info">
              <i class="hub-icon hub-icon-clock"></i>
              <span>${t('sync.log_ready')}</span>
            </div>
          </div>
        </div>
      </fieldset>
    </div>
  `
}

/* ── Log / card / overall UI helpers (exported for sync-operations.js) ── */

const nowStr = () => {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
}

/** @param {string} msg @param {string} [type='info'] */
export const addLog = (msg, type = 'info') => {
  const log = document.getElementById('syncLog')
  if (!log) return
  const iconMap = {
    info: 'hub-icon-clock', success: 'hub-icon-checkmark', error: 'hub-icon-error',
    warning: 'hub-icon-warning', sync: 'hub-icon-sync hub-icon-spin',
    upload: 'hub-icon-cloud', verify: 'hub-icon-checklist', done: 'hub-icon-ok'
  }
  const icon = iconMap[type] || iconMap.info
  const item = document.createElement('div')
  item.className = `sync-log-item sync-log-${type}`
  item.innerHTML = `<i class="hub-icon ${icon}"></i><span class="sync-log-time">[${nowStr()}]</span> <span>${msg}</span>`
  log.prepend(item)
  if (log.children.length > 200) log.lastChild.remove()
}

/** @param {string} ep @param {string} status @param {string} text @param {number} [pct] */
export const setCardStatus = (ep, status, text, pct) => {
  const statusEl = document.querySelector(`[data-status="${ep}"]`)
  const barEl = document.querySelector(`[data-bar="${ep}"]`)
  const badgeEl = document.querySelector(`[data-badge="${ep}"]`)
  const cardEl = document.querySelector(`.sync-card[data-ep="${ep}"]`)

  if (statusEl) {
    const icons = {
      pending: '<i class="hub-icon hub-icon-clock"></i>',
      syncing: '<i class="hub-icon hub-icon-sync hub-icon-spin"></i>',
      uploading: '<i class="hub-icon hub-icon-cloud"></i>',
      verifying: '<i class="hub-icon hub-icon-checklist"></i>',
      done: '<i class="hub-icon hub-icon-checkmark"></i>',
      error: '<i class="hub-icon hub-icon-error"></i>',
      skipped: '<i class="hub-icon hub-icon-warning"></i>'
    }
    statusEl.innerHTML = `${icons[status] || ''} ${text}`
  }
  if (barEl && pct !== undefined) barEl.style.width = `${Math.min(100, pct)}%`
  if (cardEl) {
    cardEl.className = `sync-card sync-card-${status}`
    cardEl.setAttribute('data-ep', ep)
  }
  if (badgeEl) {
    const labels = {
      pending: '', syncing: t('sync.badge.running'), uploading: t('sync.badge.uploading'),
      verifying: t('sync.badge.verifying'), done: t('sync.badge.done'),
      error: t('sync.badge.error'), skipped: t('sync.badge.skipped')
    }
    badgeEl.textContent = labels[status] || ''
    badgeEl.className = `sync-card-badge badge-${status}`
  }
}

/** @param {boolean} visible @param {string} [label] @param {string} [count] @param {number} [pct] */
export const setOverall = (visible, label, count, pct) => {
  const wrap = document.getElementById('syncOverall')
  const labelEl = document.getElementById('syncOverallLabel')
  const countEl = document.getElementById('syncOverallCount')
  const barEl = document.getElementById('syncOverallBar')
  if (wrap) wrap.style.display = visible ? '' : 'none'
  if (labelEl && label) labelEl.innerHTML = label
  if (countEl && count) countEl.textContent = count
  if (barEl && pct !== undefined) barEl.style.width = `${pct}%`
}

/** @param {boolean} disabled */
export const setSyncBtnsDisabled = (disabled) => {
  const ids = ['syncAllBtn', 'hardSyncAllBtn', 'testAllBtn', 'addAccountBtn']
  ids.forEach((id) => {
    const btn = document.getElementById(id)
    if (btn) btn.disabled = disabled
  })
  const stopBtn = document.getElementById('stopSyncBtn')
  if (stopBtn) stopBtn.style.display = disabled ? '' : 'none'
}

/** @returns {number} Current speed slider value in ms */
export const getSpeed = () => {
  const slider = document.getElementById('syncSpeedSlider')
  return slider ? parseInt(slider.value, 10) : 500
}

/* ── Init sync tool event bindings ── */

/**
 * Bind sync-tool button events (sync all, hard sync, test, stop, speed slider, add account).
 * @param {Object} form - Layui form instance
 * @param {Object} layer - Layui layer instance
 * @param {Object} table - Layui table instance
 */
export const initSyncTool = (form, layer, table) => {
  const slider = document.getElementById('syncSpeedSlider')
  const speedVal = document.getElementById('syncSpeedValue')
  if (slider && speedVal) {
    slider.addEventListener('input', () => {
      const v = parseInt(slider.value, 10)
      speedVal.textContent = v === 0 ? t('sync.speed_max') : `${v}ms`
    })
  }

  const stopBtn = document.getElementById('stopSyncBtn')
  if (stopBtn) {
    stopBtn.addEventListener('click', () => {
      moduleState.syncAbort = true
      addLog(t('sync.user_stopped'), 'warning')
    })
  }

  /* Lazy-import operations to avoid circular deps (they import from this file) */
  const syncAllBtn = document.getElementById('syncAllBtn')
  if (syncAllBtn) {
    syncAllBtn.addEventListener('click', async () => {
      const { runSyncAll } = await import('./sync-operations.js')
      runSyncAll(false, layer, table)
    })
  }

  const hardSyncBtn = document.getElementById('hardSyncAllBtn')
  if (hardSyncBtn) {
    hardSyncBtn.addEventListener('click', () => {
      layer.confirm(
        t('sync.confirm_full'),
        { icon: 3, title: t('sync.confirm_title') },
        async (idx) => {
          layer.close(idx)
          const { runSyncAll } = await import('./sync-operations.js')
          runSyncAll(true, layer, table)
        }
      )
    })
  }

  const testBtn = document.getElementById('testAllBtn')
  if (testBtn) {
    testBtn.addEventListener('click', async () => {
      const { runTestAll } = await import('./sync-operations.js')
      runTestAll(layer)
    })
  }

  const addAccountBtn = document.getElementById('addAccountBtn')
  if (addAccountBtn) {
    addAccountBtn.addEventListener('click', async () => {
      const { openAddAccountDialog } = await import('./sync-operations.js')
      openAddAccountDialog(form, layer)
    })
  }
}
