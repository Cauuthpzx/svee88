import { ROUTE_TITLES } from '../../constants/index.js'
import { escapeHtml } from '../../utils/index.js'
import {
  ENDPOINT_COLS, ENDPOINT_NAMES, ENDPOINT_HAS_DATE,
  ENDPOINT_SEARCH, HASH_TO_ENDPOINT
} from './config.js'
import './index.css'

const template = (title, endpoint) => {
  const hasDate = ENDPOINT_HAS_DATE[endpoint]
  const searchFields = ENDPOINT_SEARCH[endpoint] || []
  const hasSearch = searchFields.length > 0 || hasDate

  let searchInputs = ''
  searchFields.forEach((p) => {
    if (p.type === 'select' && p.options) {
      const opts = p.options.map((o) =>
        `<option value="${o.value}">${escapeHtml(o.text)}</option>`
      ).join('')
      const w = p.options.length > 10 ? '180px' : '130px'
      const searchAttr = p.options.length > 10 ? ' lay-search' : ''
      searchInputs += `
        <label>${escapeHtml(p.label)}</label>:
        <div style="width:${w}" class="layui-input-inline">
          <select name="${p.name}" lay-filter="search_${p.name}"${searchAttr}>${opts}</select>
        </div> `
    } else {
      searchInputs += `
        <label>${escapeHtml(p.label)}</label>:
        <div style="width:150px" class="layui-input-inline">
          <input type="text" name="${p.name}" placeholder="${escapeHtml(p.label)}" class="layui-input" autocomplete="off">
        </div> `
    }
  })

  return `
    <div class="data-panel">
      <blockquote class="layui-elem-quote data-panel-title">
        <i class="layui-icon layui-icon-table"></i>
        <span>${escapeHtml(title)}</span>
      </blockquote>

      ${hasSearch ? `
      <div class="layui-form data-toolbar">
        <fieldset class="layui-elem-field">
          <legend>Search</legend>
          <div class="layui-field-box">
            <form class="layui-form" lay-filter="dataSearchForm">
              ${hasDate ? `
              <div class="layui-inline" id="data-date-wrap">
                <label>Date</label>:
                <div style="width:220px" class="layui-input-inline">
                  <input type="text" name="date" id="dataDateRange" placeholder="Start - End" class="layui-input" readonly autocomplete="off">
                </div>
                <div style="width:130px" class="layui-input-inline">
                  <select id="quickDateSelect" lay-filter="quickDateSelect">
                    <option value="">Chọn nhanh</option>
                    <option value="yesterday">Hôm qua</option>
                    <option value="today">Hôm nay</option>
                    <option value="thisWeek">Tuần này</option>
                    <option value="thisMonth">Tháng này</option>
                    <option value="lastMonth">Tháng trước</option>
                  </select>
                </div>
              </div>
              ` : ''}
              <div class="layui-inline" id="data-search-wrap">${searchInputs}</div>
              <div class="layui-inline">
                <button type="button" class="layui-btn" lay-submit lay-filter="doDataSearch">
                  <i class="layui-icon layui-icon-search"></i> Search
                </button>
              </div>
              <div class="layui-inline">
                <button type="button" class="layui-btn layui-btn-primary" id="dataResetBtn">
                  <i class="layui-icon layui-icon-refresh"></i> Reset
                </button>
              </div>
            </form>
          </div>
        </fieldset>
      </div>
      ` : ''}

      <table id="dataTable" lay-filter="dataTable"></table>

      <div id="data-total-wrap" style="display:none; margin-top:10px">
        <blockquote class="layui-elem-quote total-summary-quote" id="data-total-body">
          <i class="layui-icon layui-icon-chart"></i> <b>Total Summary</b>
        </blockquote>
      </div>
    </div>
  `
}

let currentEndpoint = null

const getDateStr = (d) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

const initDatePicker = () => {
  layui.use('laydate', function (laydate) {
    const today = getDateStr(new Date())
    const el = document.getElementById('dataDateRange')
    if (!el) return
    el.value = `${today}|${today}`
    const qs = document.getElementById('quickDateSelect')
    if (qs) qs.value = 'today'
    laydate.render({
      elem: '#dataDateRange',
      type: 'date',
      range: '|',
      rangeLinked: true,
      value: `${today}|${today}`
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
    if (el) el.value = `${start}|${end}`
  })
}

const loadTable = (endpoint) => {
  const cols = ENDPOINT_COLS[endpoint]
  if (!cols) return

  layui.use(['table', 'form', 'laydate'], function (table, form) {
    form.render('select')

    if (ENDPOINT_HAS_DATE[endpoint]) {
      initDatePicker()
      initQuickDate(form)
    }

    table.render({
      elem: '#dataTable',
      id: 'dataTable',
      url: `/api/data/${endpoint}`,
      method: 'get',
      cols: [cols],
      page: { limit: 10, limits: [10, 50, 100, 200] },
      request: { pageName: 'page', limitName: 'limit' },
      parseData: (res) => {
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
      text: { none: 'No data found' }
    })

    // Search submit
    form.on('submit(doDataSearch)', (data) => {
      const where = { ...data.field }
      table.reload('dataTable', { where, page: { curr: 1 } })
      return false
    })

    // Reset
    const resetBtn = document.getElementById('dataResetBtn')
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        const formEl = document.querySelector('[lay-filter="dataSearchForm"]')
        if (formEl) formEl.reset()
        if (ENDPOINT_HAS_DATE[endpoint]) initDatePicker()
        form.render('select')
        table.reload('dataTable', { where: {}, page: { curr: 1 } })
      })
    }
  })
}

export const render = (hash, container) => {
  const endpoint = HASH_TO_ENDPOINT[hash]
  if (!endpoint) return
  currentEndpoint = endpoint
  const el = container || document.getElementById('main-content')
  const title = ROUTE_TITLES[hash] || ENDPOINT_NAMES[endpoint] || endpoint
  el.innerHTML = template(title, endpoint)
  loadTable(endpoint)
}

export const destroy = () => {
  currentEndpoint = null
}
