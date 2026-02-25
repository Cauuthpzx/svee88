/**
 * Rebate page initialization — series/game dropdowns + table render.
 * @module data-table/rebate
 */

import { t } from '../../i18n/index.js'
import { authHeaders, loadAgentOptions } from './helpers.js'
import { UPSTREAM_URL } from './config.js'

/**
 * Initialize the rebate page: load series/games, render table, bind filters.
 * @param {Object} table - Layui table instance
 * @param {Object} form - Layui form instance
 * @param {Object} layer - Layui layer instance
 * @param {Object[]} tableCols - Column definitions for table.render()
 */
export const initRebatePage = (table, form, layer, tableCols) => {
  const rebateUrl = UPSTREAM_URL['rebate']

  loadAgentOptions(document.getElementById('agentFilter'), form)

  fetch('/api/v1/sync/proxy/rebate-init', { method: 'POST', headers: authHeaders() })
    .then((r) => r.json())
    .then((res) => {
      const seriesSel = document.getElementById('rebateSeriesSelect')
      const gameSel = document.getElementById('rebateGameSelect')
      if (!seriesSel || !gameSel) return

      seriesSel.innerHTML = ''
      for (const s of (res.series || [])) {
        const opt = document.createElement('option')
        opt.value = s.id || s.series_id || ''
        opt.textContent = s.name || s.series_name || `Series ${s.id}`
        seriesSel.appendChild(opt)
      }

      gameSel.innerHTML = ''
      for (const g of (res.games || [])) {
        const opt = document.createElement('option')
        opt.value = g.id || g.lottery_id || ''
        opt.textContent = g.name || g.lottery_name || `Game ${g.id}`
        gameSel.appendChild(opt)
      }

      form.render('select')

      const firstSeries = (res.series || [])[0]
      const firstGame = (res.games || [])[0]
      const initWhere = {}
      if (firstSeries) initWhere.series_id = firstSeries.id || firstSeries.series_id || ''
      if (firstGame) initWhere.lottery_id = firstGame.id || firstGame.lottery_id || ''

      table.render({
        elem: '#dataTable',
        id: 'dataTable',
        url: rebateUrl,
        method: 'post',
        contentType: 'application/x-www-form-urlencoded',
        headers: authHeaders(),
        where: initWhere,
        cols: [tableCols],
        page: false,
        parseData: (r) => ({ code: 0, data: r.data || [], count: r.count || 0, msg: '' }),
        toolbar: true,
        defaultToolbar: ['filter', 'exports', 'print'],
        skin: 'grid',
        even: true,
        size: 'sm',
        text: { none: t('table.no_data') }
      })
    })
    .catch((e) => {
      console.warn('[rebate-init]', e.message)
      table.render({
        elem: '#dataTable',
        id: 'dataTable',
        data: [],
        cols: [tableCols],
        page: false,
        toolbar: true,
        defaultToolbar: ['filter', 'exports', 'print'],
        skin: 'grid',
        even: true,
        size: 'sm',
        text: { none: t('table.no_data_check') }
      })
    })

  form.on('select(rebateSeriesSelect)', (data) => {
    const seriesId = data.value
    fetch('/api/v1/sync/proxy/rebate-games', {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' }),
      body: `series_id=${encodeURIComponent(seriesId)}`
    })
      .then((r) => r.json())
      .then((res) => {
        const gameSel = document.getElementById('rebateGameSelect')
        if (!gameSel) return
        gameSel.innerHTML = ''
        for (const g of (res.games || [])) {
          const opt = document.createElement('option')
          opt.value = g.id || g.lottery_id || ''
          opt.textContent = g.name || g.lottery_name || `Game ${g.id}`
          gameSel.appendChild(opt)
        }
        form.render('select')

        const firstGame = (res.games || [])[0]
        if (firstGame) {
          table.reload('dataTable', {
            where: { lottery_id: firstGame.id || firstGame.lottery_id, series_id: seriesId }
          })
        }
      })
      .catch((e) => console.warn('[rebate-games]', e.message))
  })

  form.on('select(rebateGameSelect)', (data) => {
    const seriesSel = document.getElementById('rebateSeriesSelect')
    table.reload('dataTable', {
      where: { lottery_id: data.value, series_id: seriesSel?.value || '' }
    })
  })

  form.on('submit(doDataSearch)', () => {
    const seriesSel = document.getElementById('rebateSeriesSelect')
    const gameSel = document.getElementById('rebateGameSelect')
    table.reload('dataTable', {
      where: { lottery_id: gameSel?.value || '', series_id: seriesSel?.value || '' }
    })
    return false
  })

  const resetBtn = document.getElementById('dataResetBtn')
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      const seriesSel = document.getElementById('rebateSeriesSelect')
      if (seriesSel && seriesSel.options.length) {
        seriesSel.selectedIndex = 0
        form.render('select')
        const evt = new Event('change')
        seriesSel.dispatchEvent(evt)
      }
    })
  }
}
