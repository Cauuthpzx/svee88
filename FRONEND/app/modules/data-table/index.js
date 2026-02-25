/**
 * Data-table module — main entry point.
 * Renders paginated data tables for all proxy endpoints.
 * @module data-table
 */

import { getRouteTitle } from '../../constants/index.js'
import { t, onLangChange } from '../../i18n/index.js'
import {
  getEndpointCols, getEndpointNames, ENDPOINT_HAS_DATE,
  HASH_TO_ENDPOINT, DATE_PARAM_NAME, UPSTREAM_URL
} from './config.js'
import { moduleState, resetState } from './state.js'
import { authHeaders, getDateStr, loadAgentOptions } from './helpers.js'
import { initSyncTool } from './sync-tool.js'
import { initRebatePage } from './rebate.js'
import { renderTotalSummary } from './total-summary.js'
import { swrSilentRefresh } from './swr.js'
import { template } from './template.js'
import './index.css'

/* ── Date picker ── */
const initDatePicker = () => {
  layui.use('laydate', function (laydate) {
    const today = getDateStr(new Date())
    const el = document.getElementById('dataDateRange')
    if (!el) return
    el.value = `${today} | ${today}`
    const qs = document.getElementById('quickDateSelect')
    if (qs) qs.value = 'today'

    laydate.render({
      elem: '#dataDateRange',
      type: 'date',
      range: '|',
      rangeLinked: true,
      value: `${today} | ${today}`
    })
  })
}

const initQuickDate = (form) => {
  form.on('select(quickDateSelect)', (data) => {
    const now = new Date()
    let start, end
    switch (data.value) {
      case 'today':
        start = end = getDateStr(now)
        break
      case 'yesterday': {
        const y = new Date(now)
        y.setDate(y.getDate() - 1)
        start = end = getDateStr(y)
        break
      }
      case 'thisWeek': {
        const day = now.getDay() || 7
        const mon = new Date(now)
        mon.setDate(mon.getDate() - day + 1)
        start = getDateStr(mon)
        end = getDateStr(now)
        break
      }
      case 'thisMonth':
        start = getDateStr(new Date(now.getFullYear(), now.getMonth(), 1))
        end = getDateStr(now)
        break
      case 'lastMonth': {
        const firstLast = new Date(now.getFullYear(), now.getMonth(), 0)
        start = getDateStr(new Date(firstLast.getFullYear(), firstLast.getMonth(), 1))
        end = getDateStr(firstLast)
        break
      }
      default: return
    }
    const el = document.getElementById('dataDateRange')
    if (el) el.value = `${start} | ${end}`
  })
}

/* ── Load table ── */
const loadTable = (endpoint, hash) => {
  const cols = getEndpointCols(endpoint)
  if (!cols) return
  const isSync = hash === '#/settings-sync'
  const tableCols = isSync ? [{ type: 'checkbox', fixed: 'left' }, ...cols] : cols

  layui.use(['table', 'form', 'laydate', 'layer'], function (table, form, laydate, layer) {
    form.render('select')

    if (ENDPOINT_HAS_DATE[endpoint] && !isSync) {
      initDatePicker()
      initQuickDate(form)
    }

    loadAgentOptions(document.getElementById('agentFilter'), form)

    const upstreamUrl = UPSTREAM_URL[endpoint]
    const useUpstream = !!upstreamUrl && !isSync

    if (endpoint === 'rebate') {
      initRebatePage(table, form, layer, tableCols)
      return
    }

    table.render({
      elem: '#dataTable',
      id: 'dataTable',
      url: useUpstream ? upstreamUrl : `/api/v1/data/${endpoint}`,
      method: useUpstream ? 'post' : 'get',
      contentType: useUpstream ? 'application/x-www-form-urlencoded' : undefined,
      headers: authHeaders(),
      cols: [tableCols],
      page: { limit: 10, limits: [10, 50, 100, 200] },
      request: { pageName: 'page', limitName: 'limit' },
      parseData: (res) => {
        if (useUpstream) {
          if (res._cache_status === 'stale' && !moduleState.swrReloading) {
            moduleState.swrReloading = true
            swrSilentRefresh(upstreamUrl, endpoint)
          }

          return {
            code: 0,
            data: res.data || [],
            count: res.count || 0,
            msg: res.msg || '',
            _totals: res._totals || null
          }
        }
        if (res.code === 0) {
          const data = res.data || {}
          return { code: 0, data: data.rows || [], count: data.count || 0, msg: '' }
        }
        return { code: 0, data: [], count: 0, msg: '' }
      },
      toolbar: true,
      defaultToolbar: ['filter', 'exports', 'print'],
      skin: 'grid',
      even: true,
      size: 'sm',
      cellMinWidth: 50,
      text: { none: t('table.no_data') },
      done: function(res, curr) {
        moduleState.swrPage = curr || 1
        const limitEl = document.querySelector('.layui-laypage-limits select')
        if (limitEl) moduleState.swrLimit = parseInt(limitEl.value, 10) || 10
        renderTotalSummary(endpoint, res.data || table.cache['dataTable'] || [], res._totals)
      }
    })

    document.querySelectorAll('.layui-table-tool-self [title]').forEach((el) => {
      el.setAttribute('lay-tips', el.getAttribute('title'))
      el.setAttribute('lay-direction', '3')
      el.removeAttribute('title')
    })

    form.on('submit(doDataSearch)', (data) => {
      const where = { ...data.field }
      if (where.date) {
        const paramName = DATE_PARAM_NAME[endpoint] || 'date'
        if (paramName !== 'date') {
          where[paramName] = where.date
          delete where.date
        }
      }
      moduleState.swrReloading = false
      moduleState.swrCurrentWhere = { ...where }
      table.reload('dataTable', { url: upstreamUrl, where, page: { curr: 1 } })
      return false
    })

    const resetBtn = document.getElementById('dataResetBtn')
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        const formEl = document.querySelector('[lay-filter="dataSearchForm"]')
        if (formEl) formEl.reset()
        if (ENDPOINT_HAS_DATE[endpoint]) initDatePicker()
        form.render('select')
        moduleState.swrReloading = false
        moduleState.swrCurrentWhere = {}
        table.reload('dataTable', { url: upstreamUrl, where: {}, page: { curr: 1 } })
      })
    }

    if (endpoint === 'invites') {
      document.querySelector('#dataTable')?.closest('.layui-table-view')
        ?.addEventListener('click', (e) => {
          const copyBtn = e.target.closest('.invite-copy-btn')
          const settingBtn = e.target.closest('.invite-setting-btn')
          const qrBtn = e.target.closest('.invite-qr-btn')

          if (copyBtn) {
            const code = copyBtn.dataset.code
            const base = (copyBtn.dataset.base || '').replace(/\/+$/, '')
            const link = base ? `${base}/?inviteCode=${code}` : `?inviteCode=${code}`
            navigator.clipboard.writeText(link).then(() => {
              layer.msg(t('invite.link_copied'), { icon: 1, time: 1500 })
            }).catch(() => {
              const ta = document.createElement('textarea')
              ta.value = link
              document.body.appendChild(ta)
              ta.select()
              document.execCommand('copy')
              ta.remove()
              layer.msg(t('invite.link_copied'), { icon: 1, time: 1500 })
            })
          }

          if (settingBtn) {
            const id = settingBtn.dataset.id
            const base = settingBtn.dataset.base
            if (!base || !id) return
            layer.open({
              type: 2,
              title: t('table.rebate_settings'),
              area: ['650px', '500px'],
              content: `${base}/agent/inviteDetail?id=${id}`
            })
          }

          if (qrBtn) {
            const id = qrBtn.dataset.id
            const base = qrBtn.dataset.base
            if (!base || !id) return
            layer.open({
              type: 2,
              title: t('btn.qr_code'),
              area: ['350px', '385px'],
              content: `${base}/agent/inviteQrcode?id=${id}`
            })
          }
        })
    }

    if (isSync) {
      initSyncTool(form, layer, table)
    }
  })
}

/**
 * Render the data-table page for a given route hash.
 * @param {string} hash - Route hash (e.g. '#/users')
 * @param {HTMLElement} [container] - Container element to render into
 */
export const render = (hash, container) => {
  const endpoint = HASH_TO_ENDPOINT[hash]
  if (!endpoint) return
  moduleState.currentEndpoint = endpoint
  moduleState.currentHash = hash
  const el = container || document.getElementById('main-content')
  const title = getRouteTitle(hash) || getEndpointNames(endpoint) || endpoint
  el.innerHTML = template(title, endpoint, hash)
  loadTable(endpoint, hash)

  moduleState.unsubLang = onLangChange(() => {
    if (!moduleState.currentEndpoint || !moduleState.currentHash) return
    const ep = moduleState.currentEndpoint
    const h = moduleState.currentHash
    const cont = container || document.getElementById('main-content')
    const newTitle = getRouteTitle(h) || getEndpointNames(ep) || ep
    cont.innerHTML = template(newTitle, ep, h)
    loadTable(ep, h)
  })
}

/**
 * Destroy the data-table module — reset all state, abort sync, unsubscribe i18n.
 */
export const destroy = () => {
  resetState()
}
