/**
 * Sync operations — runSyncAll, runTestAll, openAddAccountDialog.
 * Separated from sync-tool.js to keep files under 300 lines.
 * @module data-table/sync-operations
 */

import { t } from '../../i18n/index.js'
import { moduleState } from './state.js'
import { authHeaders } from './helpers.js'
import { addLog, setCardStatus, setOverall, setSyncBtnsDisabled, getSpeed, getSyncEpLabel, SYNC_ORDER } from './sync-tool.js'

const delay = (ms) => new Promise((r) => setTimeout(r, ms))

/**
 * Run full sync across all endpoints (incremental or hard).
 * @param {boolean} hard - If true, force full re-sync
 * @param {Object} layer - Layui layer instance
 * @param {Object} table - Layui table instance
 */
export const runSyncAll = async (hard, layer, table) => {
  const { syncEndpoint } = await import('../../services/sync.js')

  moduleState.syncAbort = false
  setSyncBtnsDisabled(true)
  SYNC_ORDER.forEach((ep) => setCardStatus(ep, 'pending', t('sync.waiting'), 0))

  const total = SYNC_ORDER.length
  let completed = 0
  const results = []

  const modeLabel = hard ? t('sync.log.mode_full') : t('sync.log.mode_incremental')
  addLog(t('sync.log.start', { mode: modeLabel, total }), 'sync')
  setOverall(true, `<i class="hub-icon hub-icon-sync hub-icon-spin"></i> ${modeLabel}...`, `0 / ${total}`, 0)

  const startTime = Date.now()

  for (const ep of SYNC_ORDER) {
    if (moduleState.syncAbort) {
      setCardStatus(ep, 'skipped', t('sync.status.stopped'), 0)
      addLog(t('sync.log.ep_skipped_user', { ep: getSyncEpLabel(ep) }), 'warning')
      continue
    }

    setCardStatus(ep, 'syncing', t('sync.status.loading'), 10)
    addLog(t('sync.log.ep_start', { ep: getSyncEpLabel(ep) }), 'sync')

    try {
      const result = await syncEndpoint(ep, (progress) => {
        if (!progress) return
        const { step, message } = progress

        if (step === 'fetch') {
          setCardStatus(ep, 'syncing', message || t('sync.status.fetching'), 30)
        } else if (step === 'upload') {
          setCardStatus(ep, 'uploading', message || t('sync.status.uploading'), 60)
        } else if (step === 'verify') {
          setCardStatus(ep, 'verifying', message || t('sync.status.verifying'), 85)
        }

        if (message) addLog(`${getSyncEpLabel(ep)}: ${message}`, step === 'error' ? 'error' : 'info')
      })

      results.push(result)

      if (result.skipped) {
        setCardStatus(ep, 'skipped', t('sync.status.updated', { date: result.lastDate || '' }), 100)
        addLog(t('sync.log.ep_skipped', { ep: getSyncEpLabel(ep) }), 'warning')
      } else {
        const count = result.fetched || result.processed || 0
        setCardStatus(ep, 'done', t('sync.status.done', { count }), 100)
        addLog(t('sync.log.ep_done', { ep: getSyncEpLabel(ep), count }), 'success')
      }
    } catch (e) {
      setCardStatus(ep, 'error', `${t('sync.badge.error')}: ${e.message}`, 0)
      addLog(t('sync.log.ep_error', { ep: getSyncEpLabel(ep), message: e.message }), 'error')
      results.push({ endpoint: ep, error: e.message })
    }

    completed++
    const pct = Math.round((completed / total) * 100)
    setOverall(true, `<i class="hub-icon hub-icon-sync hub-icon-spin"></i> ${modeLabel}...`, `${completed} / ${total}`, pct)

    const spd = getSpeed()
    if (spd > 0 && completed < total && !moduleState.syncAbort) await delay(spd)
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
  const errors = results.filter((r) => r.error).length

  if (moduleState.syncAbort) {
    setOverall(true, `<i class="hub-icon hub-icon-warning"></i> ${t('sync.log.overall_stopped')}`, `${completed} / ${total}`, Math.round((completed / total) * 100))
    addLog(t('sync.log.stopped', { elapsed, errors }), 'warning')
  } else {
    setOverall(true, `<i class="hub-icon hub-icon-ok"></i> ${t('sync.log.overall_done')}`, `${total} / ${total}`, 100)
    addLog(t('sync.log.done', { elapsed, errors }), errors > 0 ? 'warning' : 'done')
  }

  setSyncBtnsDisabled(false)

  if (table) {
    try {
      table.reload('dataTable', { page: { curr: 1 } })
    } catch (e) { console.warn('[sync] table reload failed:', e.message) }
  }
}

/**
 * Verify data integrity by sampling random records from each endpoint.
 * @param {Object} layer - Layui layer instance
 */
export const runTestAll = async (layer) => {
  const { verifyRandom } = await import('../../services/sync.js')
  const { fetchAllPages } = await import('../../api/upstream-sync.js')
  const {
    memberApi, betOrderApi, betApi, depositWithdrawalApi,
    reportLotteryApi, reportFundsApi, reportThirdGameApi
  } = await import('../../api/upstream.js')

  moduleState.syncAbort = false
  setSyncBtnsDisabled(true)

  const testEndpoints = [
    { name: 'members', listFn: memberApi.list },
    { name: 'bet_order', listFn: betOrderApi.list },
    { name: 'bet_lottery', listFn: betApi.list },
    { name: 'deposit_withdrawal', listFn: depositWithdrawalApi.list },
    { name: 'report_lottery', listFn: reportLotteryApi.list },
    { name: 'report_funds', listFn: reportFundsApi.list },
    { name: 'report_third_game', listFn: reportThirdGameApi.list }
  ]

  addLog(t('sync.test.start'), 'verify')
  setOverall(true, `<i class="hub-icon hub-icon-checklist"></i> ${t('sync.test.checking')}`, `0 / ${testEndpoints.length}`, 0)

  let completed = 0
  let passed = 0
  let failed = 0

  for (const { name, listFn } of testEndpoints) {
    if (moduleState.syncAbort) {
      setCardStatus(name, 'skipped', t('sync.status.stopped'), 0)
      continue
    }

    setCardStatus(name, 'verifying', t('sync.test.checking'), 50)
    addLog(`${getSyncEpLabel(name)}: ${t('sync.test.checking')}`, 'verify')

    try {
      const { data } = await fetchAllPages(listFn, {}, { pageSize: 10, maxPages: 1, sensitive: name === 'members' })
      const result = await verifyRandom(name, data, 3)

      if (result.ok) {
        passed++
        setCardStatus(name, 'done', t('sync.test.pass', { checked: result.checked }), 100)
        addLog(t('sync.test.ep_pass', { ep: getSyncEpLabel(name), checked: result.checked }), 'success')
      } else {
        failed++
        setCardStatus(name, 'error', t('sync.test.fail', { missing: (result.missing || []).length }), 100)
        addLog(t('sync.test.ep_fail', { ep: getSyncEpLabel(name) }), 'error')
      }
    } catch (e) {
      failed++
      setCardStatus(name, 'error', `${t('sync.badge.error')}: ${e.message}`, 0)
      addLog(t('sync.test.ep_error', { ep: getSyncEpLabel(name), message: e.message }), 'error')
    }

    completed++
    setOverall(true, `<i class="hub-icon hub-icon-checklist"></i> ${t('sync.test.checking')}`, `${completed} / ${testEndpoints.length}`, Math.round((completed / testEndpoints.length) * 100))

    const spd = getSpeed()
    if (spd > 0 && !moduleState.syncAbort) await delay(spd)
  }

  setOverall(
    true,
    failed > 0
      ? `<i class="hub-icon hub-icon-warning"></i> ${t('sync.test.done_error')}`
      : `<i class="hub-icon hub-icon-ok"></i> ${t('sync.test.done_ok')}`,
    t('sync.test.result', { passed, failed }),
    100
  )
  addLog(t('sync.test.summary', { passed, failed }), failed > 0 ? 'warning' : 'done')

  setSyncBtnsDisabled(false)
}

const DEFAULT_BASE_URL = 'https://a2u4k.ee88dly.com'

/**
 * Open the "Add Account" dialog for registering a new sync agent.
 * @param {Object} form - Layui form instance
 * @param {Object} layer - Layui layer instance
 */
export const openAddAccountDialog = (form, layer) => {
  const dialogIdx = layer.open({
    type: 1,
    title: `<i class="hub-icon hub-icon-plus" style="vertical-align:middle;margin-right:6px;"></i>${t('sync.account.title')}`,
    area: '380px',
    maxHeight: 500,
    content: `
      <form class="layui-form" lay-filter="addAccountForm" style="padding: 15px 25px 5px;">
        <div class="layui-form-item">
          <div class="layui-input-wrap">
            <div class="layui-input-prefix">
              <i class="hub-icon hub-icon-user"></i>
            </div>
            <input type="text" name="owner" lay-verify="required" placeholder="${t('sync.account.owner')}" lay-reqtext="${t('sync.account.owner_required')}" autocomplete="off" class="layui-input" lay-affix="clear">
          </div>
        </div>
        <div class="layui-form-item">
          <div class="layui-input-wrap">
            <div class="layui-input-prefix">
              <i class="hub-icon hub-icon-user"></i>
            </div>
            <input type="text" name="username" lay-verify="required" placeholder="${t('sync.account.username')}" lay-reqtext="${t('sync.account.username_required')}" autocomplete="off" class="layui-input" lay-affix="clear">
          </div>
        </div>
        <div class="layui-form-item">
          <div class="layui-input-wrap">
            <div class="layui-input-prefix">
              <i class="hub-icon hub-icon-lock"></i>
            </div>
            <input type="password" name="password" lay-verify="required" placeholder="${t('sync.account.password')}" lay-reqtext="${t('sync.account.password_required')}" autocomplete="off" class="layui-input" lay-affix="eye">
          </div>
        </div>
        <div class="layui-form-item">
          <div class="layui-input-wrap">
            <div class="layui-input-prefix">
              <i class="hub-icon hub-icon-link"></i>
            </div>
            <input type="text" name="base_url" lay-verify="url" placeholder="${DEFAULT_BASE_URL}" autocomplete="off" class="layui-input" lay-affix="clear">
          </div>
        </div>
        <div class="layui-form-item">
          <button type="button" class="layui-btn layui-btn-fluid" lay-submit lay-filter="submitAddAccount">
            <i class="hub-icon hub-icon-login"></i> ${t('btn.login')}
          </button>
        </div>
      </form>
    `,
    success: () => {
      form.render(null, 'addAccountForm')
      form.on('submit(submitAddAccount)', (data) => {
        const { owner, username, password } = data.field
        const base_url = (data.field.base_url || '').trim() || DEFAULT_BASE_URL
        const loadIdx = layer.load(2)
        fetch('/api/v1/agents', {
          method: 'POST',
          headers: authHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ owner, username, base_url, password }),
        })
          .then((r) => r.json())
          .then((res) => {
            if (res.code !== 0) throw new Error(res.message || t('sync.account.error_unknown'))
            const agentId = res.data?.agent?.id
            return fetch(`/api/v1/agents/${agentId}/login`, {
              method: 'POST',
              headers: authHeaders(),
            }).then((r) => r.json())
          })
          .then((loginRes) => {
            layer.close(loadIdx)
            layer.close(dialogIdx)
            const ok = loginRes.code === 0
            layer.msg(
              ok ? t('sync.account.success') : t('sync.account.login_failed', { message: loginRes.message }),
              { icon: ok ? 1 : 6 }
            )
          })
          .catch((e) => {
            layer.close(loadIdx)
            layer.msg(t('sync.account.error', { message: e.message }), { icon: 2 })
          })
        return false
      })
    },
  })
}
