import { ROUTE_TITLES } from '../../constants/index.js'
import { escapeHtml } from '../../utils/index.js'
import {
  ENDPOINT_COLS, ENDPOINT_NAMES, ENDPOINT_HAS_DATE,
  ENDPOINT_SEARCH, HASH_TO_ENDPOINT, DATE_PARAM_NAME
} from './config.js'
import './index.css'

const template = (title, endpoint, hash) => {
  const isSync = hash === '#/settings-sync'
  const hasDate = isSync ? false : ENDPOINT_HAS_DATE[endpoint]
  const searchFields = isSync ? [] : (ENDPOINT_SEARCH[endpoint] || [])
  const hasSearch = searchFields.length > 0 || hasDate || isSync

  let searchInputs = ''
  searchFields.forEach((p) => {
    if (p.type === 'select' && p.options) {
      const opts = p.options.map((o) =>
        `<option value="${o.value}">${escapeHtml(o.text)}</option>`
      ).join('')
      const wClass = p.options.length > 10 ? 'data-input-lg' : 'data-input-sm'
      const searchAttr = p.options.length > 10 ? ' lay-search' : ''
      searchInputs += `
        <label>${escapeHtml(p.label)}</label>:
        <div class="layui-input-inline ${wClass}">
          <select name="${p.name}" lay-filter="search_${p.name}"${searchAttr}>${opts}</select>
        </div> `
    } else {
      searchInputs += `
        <label>${escapeHtml(p.label)}</label>:
        <div class="layui-input-inline data-input-md">
          <input type="text" name="${p.name}" placeholder="${escapeHtml(p.label)}" class="layui-input" autocomplete="off">
        </div> `
    }
  })

  return `
    <div class="data-panel">
      ${hasSearch ? `
      <div class="layui-form data-toolbar">
        <fieldset class="layui-elem-field">
          <legend>${escapeHtml(title)}</legend>
          <div class="layui-field-box">
            <form class="layui-form" lay-filter="dataSearchForm">
              ${hasDate ? `
              <div class="layui-inline" id="data-date-wrap">
                <label>Thời gian</label>:
                <div class="layui-input-inline data-date-input">
                  <input type="text" name="date" id="dataDateRange" placeholder="Bắt đầu - Kết thúc" class="layui-input" readonly autocomplete="off">
                </div>
                <div class="layui-input-inline data-quick-select">
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
              ${isSync ? `
              <div class="layui-inline">
                <button type="button" class="layui-btn" id="addAccountBtn">
                  <i class="layui-icon layui-icon-add-1"></i> Thêm Tài Khoản
                </button>
              </div>
              ` : `
              <div class="layui-inline" id="data-search-wrap">${searchInputs}</div>
              <div class="layui-inline">
                <button type="button" class="layui-btn" lay-submit lay-filter="doDataSearch">
                  <i class="layui-icon layui-icon-search"></i> Tìm kiếm
                </button>
              </div>
              <div class="layui-inline">
                <button type="button" class="layui-btn layui-btn-primary" id="dataResetBtn">
                  <i class="layui-icon layui-icon-refresh"></i> Đặt lại
                </button>
              </div>
              `}
              ${isSync ? `
              <div class="layui-inline">
                <button type="button" class="layui-btn layui-btn-normal" id="syncAllBtn">
                  <i class="layui-icon layui-icon-transfer"></i> Sync All
                </button>
              </div>
              <div class="layui-inline">
                <button type="button" class="layui-btn layui-btn-warm" id="hardSyncAllBtn">
                  <i class="layui-icon layui-icon-download-circle"></i> Hard Sync All
                </button>
              </div>
              <div class="layui-inline">
                <button type="button" class="layui-btn layui-btn-primary" id="testAllBtn">
                  <i class="layui-icon layui-icon-flag"></i> Test All
                </button>
              </div>
              ` : ''}
            </form>
          </div>
        </fieldset>
      </div>
      ` : ''}

      <table id="dataTable" lay-filter="dataTable"></table>

      <div id="data-total-wrap" class="data-total-wrap">
        <blockquote class="layui-elem-quote total-summary-quote" id="data-total-body">
          <i class="layui-icon layui-icon-chart"></i> <b>Tổng kết</b>
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

const loadTable = (endpoint, hash) => {
  const cols = ENDPOINT_COLS[endpoint]
  if (!cols) return
  const isSync = hash === '#/settings-sync'
  const tableCols = isSync ? [{ type: 'checkbox', fixed: 'left' }, ...cols] : cols

  layui.use(['table', 'form', 'laydate', 'layer'], function (table, form, laydate, layer) {
    form.render('select')

    if (ENDPOINT_HAS_DATE[endpoint]) {
      initDatePicker()
      initQuickDate(form)
    }

    table.render({
      elem: '#dataTable',
      id: 'dataTable',
      url: `/api/v1/data/${endpoint}`,
      method: 'get',
      cols: [tableCols],
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
      text: { none: 'Không có dữ liệu' }
    })

    // Convert toolbar native title → lay-tips for unified Layui tips
    document.querySelectorAll('.layui-table-tool-self [title]').forEach((el) => {
      el.setAttribute('lay-tips', el.getAttribute('title'))
      el.setAttribute('lay-direction', '3')
      el.removeAttribute('title')
    })

    // Search submit — rename 'date' to upstream param name
    form.on('submit(doDataSearch)', (data) => {
      const where = { ...data.field }
      if (where.date) {
        const paramName = DATE_PARAM_NAME[endpoint] || 'date'
        if (paramName !== 'date') {
          where[paramName] = where.date
          delete where.date
        }
      }
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

    // Add Account popup (Sync & Account page only)
    const addAccountBtn = document.getElementById('addAccountBtn')
    if (addAccountBtn) {
      addAccountBtn.addEventListener('click', () => {
        layer.open({
          type: 1,
          title: 'Thêm Tài Khoản',
          area: '380px',
          maxHeight: 500,
          content: `
            <form class="layui-form" lay-filter="addAccountForm" style="padding: 15px 25px 5px;">
              <div class="layui-form-item">
                <div class="layui-input-wrap">
                  <div class="layui-input-prefix">
                    <i class="layui-icon layui-icon-user"></i>
                  </div>
                  <input type="text" name="owner" lay-verify="required" placeholder="Tên người sở hữu" lay-reqtext="Vui lòng nhập tên người sở hữu" autocomplete="off" class="layui-input" lay-affix="clear">
                </div>
              </div>
              <div class="layui-form-item">
                <div class="layui-input-wrap">
                  <div class="layui-input-prefix">
                    <i class="layui-icon layui-icon-username"></i>
                  </div>
                  <input type="text" name="username" lay-verify="required" placeholder="Tài khoản ee88" lay-reqtext="Vui lòng nhập tài khoản" autocomplete="off" class="layui-input" lay-affix="clear">
                </div>
              </div>
              <div class="layui-form-item">
                <div class="layui-input-wrap">
                  <div class="layui-input-prefix">
                    <i class="layui-icon layui-icon-password"></i>
                  </div>
                  <input type="password" name="password" lay-verify="required" placeholder="Mật khẩu ee88" lay-reqtext="Vui lòng nhập mật khẩu" autocomplete="off" class="layui-input" lay-affix="eye">
                </div>
              </div>
              <div class="layui-form-item">
                <div class="layui-row">
                  <div class="layui-col-xs7">
                    <div class="layui-input-wrap">
                      <div class="layui-input-prefix">
                        <i class="layui-icon layui-icon-vercode"></i>
                      </div>
                      <input type="text" name="captcha" lay-verify="required" placeholder="Mã xác nhận" lay-reqtext="Vui lòng nhập mã xác nhận" autocomplete="off" class="layui-input" lay-affix="clear">
                    </div>
                  </div>
                  <div class="layui-col-xs5">
                    <div style="margin-left: 10px;">
                      <img src="https://www.oschina.net/action/user/captcha" onclick="this.src='https://www.oschina.net/action/user/captcha?t='+ new Date().getTime();" style="cursor:pointer; height:38px;">
                    </div>
                  </div>
                </div>
              </div>
              <div class="layui-form-item">
                <input type="checkbox" name="remember" lay-skin="primary" title="Ghi nhớ mật khẩu">
              </div>
              <div class="layui-form-item">
                <button type="button" class="layui-btn layui-btn-fluid" lay-submit lay-filter="submitAddAccount">Đăng nhập</button>
              </div>
            </form>
          `,
          success: () => {
            form.render(null, 'addAccountForm')
            form.on('submit(submitAddAccount)', (data) => {
              layer.msg('Đang xử lý: ' + JSON.stringify(data.field), { icon: 1 })
              return false
            })
          }
        })
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
  el.innerHTML = template(title, endpoint, hash)
  loadTable(endpoint, hash)
}

export const destroy = () => {
  currentEndpoint = null
}
