import { ROUTE_TITLES } from '../../constants/index.js'
import { escapeHtml } from '../../utils/index.js'
import {
  ENDPOINT_COLS, ENDPOINT_NAMES, ENDPOINT_HAS_DATE,
  ENDPOINT_SEARCH, HASH_TO_ENDPOINT, HASH_TO_ICON, DATE_PARAM_NAME
} from './config.js'
import './index.css'

/* ── Sync endpoint display names (Vietnamese) ── */
const SYNC_EP_LABELS = {
  members: 'Danh sách hội viên',
  bet_order: 'Cược bên thứ 3',
  bet_lottery: 'Cược xổ số',
  deposit_withdrawal: 'Nạp / Rút tiền',
  report_lottery: 'Báo cáo xổ số',
  report_funds: 'Báo cáo tài chính',
  report_third_game: 'Báo cáo nhà cung cấp'
}

const SYNC_EP_ICONS = {
  members: 'hub-icon-user',
  bet_order: 'hub-icon-monitor',
  bet_lottery: 'hub-icon-chart',
  deposit_withdrawal: 'hub-icon-money',
  report_lottery: 'hub-icon-graph',
  report_funds: 'hub-icon-document',
  report_third_game: 'hub-icon-database'
}

const SYNC_ORDER = [
  'members', 'bet_order', 'bet_lottery',
  'deposit_withdrawal', 'report_lottery', 'report_funds', 'report_third_game'
]

/* ── Sync tool panel HTML ── */
const syncToolPanel = () => {
  const epCards = SYNC_ORDER.map((ep) => `
    <div class="sync-card" data-ep="${ep}">
      <div class="sync-card-header">
        <i class="hub-icon ${SYNC_EP_ICONS[ep]}"></i>
        <span class="sync-card-name">${SYNC_EP_LABELS[ep]}</span>
        <span class="sync-card-badge" data-badge="${ep}"></span>
      </div>
      <div class="sync-card-progress">
        <div class="sync-progress-bar" data-bar="${ep}"></div>
      </div>
      <div class="sync-card-status" data-status="${ep}">
        <i class="hub-icon hub-icon-clock"></i> Chờ đồng bộ
      </div>
    </div>
  `).join('')

  return `
    <div class="sync-tool-panel">
      <!-- Thanh điều khiển -->
      <fieldset class="layui-elem-field sync-control-field">
        <legend><i class="hub-icon hub-icon-tools"></i> Bảng Điều Khiển Đồng Bộ</legend>
        <div class="layui-field-box sync-control-box">
          <div class="sync-control-row">
            <div class="sync-btns">
              <button type="button" class="layui-btn layui-btn-sm" id="addAccountBtn">
                <i class="hub-icon hub-icon-plus"></i> Thêm Tài Khoản
              </button>
              <button type="button" class="layui-btn layui-btn-sm layui-btn-normal" id="syncAllBtn">
                <i class="hub-icon hub-icon-sync" id="syncAllIcon"></i> Đồng Bộ Tất Cả
              </button>
              <button type="button" class="layui-btn layui-btn-sm layui-btn-warm" id="hardSyncAllBtn">
                <i class="hub-icon hub-icon-lightning" id="hardSyncIcon"></i> Đồng Bộ Toàn Bộ
              </button>
              <button type="button" class="layui-btn layui-btn-sm layui-btn-danger" id="testAllBtn">
                <i class="hub-icon hub-icon-checklist" id="testAllIcon"></i> Kiểm Tra Dữ Liệu
              </button>
              <button type="button" class="layui-btn layui-btn-sm layui-btn-primary" id="stopSyncBtn" style="display:none;">
                <i class="hub-icon hub-icon-stop"></i> Dừng Lại
              </button>
            </div>
            <div class="sync-speed-wrap">
              <label class="sync-speed-label">
                <i class="hub-icon hub-icon-speedometer"></i> Tốc độ:
              </label>
              <input type="range" id="syncSpeedSlider" min="0" max="2000" step="100" value="500" class="sync-speed-slider">
              <span class="sync-speed-value" id="syncSpeedValue">500ms</span>
            </div>
          </div>
          <div class="sync-overall" id="syncOverall" style="display:none;">
            <div class="sync-overall-info">
              <span id="syncOverallLabel"><i class="hub-icon hub-icon-sync hub-icon-spin"></i> Đang đồng bộ...</span>
              <span id="syncOverallCount"></span>
            </div>
            <div class="sync-overall-progress">
              <div class="sync-overall-bar" id="syncOverallBar"></div>
            </div>
          </div>
        </div>
      </fieldset>

      <!-- Trạng thái từng endpoint -->
      <fieldset class="layui-elem-field sync-status-field">
        <legend><i class="hub-icon hub-icon-activity"></i> Trạng Thái Đồng Bộ</legend>
        <div class="layui-field-box">
          <div class="sync-cards" id="syncCards">${epCards}</div>
        </div>
      </fieldset>

      <!-- Nhật ký hoạt động -->
      <fieldset class="layui-elem-field sync-log-field">
        <legend><i class="hub-icon hub-icon-list"></i> Nhật Ký Hoạt Động</legend>
        <div class="layui-field-box">
          <div class="sync-log" id="syncLog">
            <div class="sync-log-item sync-log-info">
              <i class="hub-icon hub-icon-clock"></i>
              <span>Sẵn sàng. Nhấn nút để bắt đầu đồng bộ dữ liệu.</span>
            </div>
          </div>
        </div>
      </fieldset>
    </div>
  `
}

/* ── Standard data-table template ── */
const template = (title, endpoint, hash) => {
  const isSync = hash === '#/settings-sync'
  const hasDate = isSync ? false : ENDPOINT_HAS_DATE[endpoint]
  const searchFields = isSync ? [] : (ENDPOINT_SEARCH[endpoint] || [])
  const hasSearch = searchFields.length > 0 || hasDate

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
      ${isSync ? syncToolPanel() : ''}

      ${hasSearch ? `
      <div class="layui-form data-toolbar">
        <fieldset class="layui-elem-field">
          <legend>${HASH_TO_ICON[hash] ? `<i class="hub-icon ${HASH_TO_ICON[hash]}"></i> ` : ''}${escapeHtml(title)}</legend>
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
              <div class="layui-inline" id="data-search-wrap">${searchInputs}</div>
              <div class="layui-inline">
                <button type="button" class="layui-btn" lay-submit lay-filter="doDataSearch">
                  <i class="hub-icon hub-icon-search"></i> Tìm kiếm
                </button>
              </div>
              <div class="layui-inline">
                <button type="button" class="layui-btn layui-btn-primary" id="dataResetBtn">
                  <i class="hub-icon hub-icon-refresh"></i> Đặt lại
                </button>
              </div>
            </form>
          </div>
        </fieldset>
      </div>
      ` : ''}

      <table id="dataTable" lay-filter="dataTable"></table>

      <div id="data-total-wrap" class="data-total-wrap">
        <blockquote class="layui-elem-quote total-summary-quote" id="data-total-body">
          <i class="hub-icon hub-icon-chart"></i> <b>Tổng kết</b>
        </blockquote>
      </div>
    </div>
  `
}

let currentEndpoint = null
let syncAbort = false

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

/* ── Sync Tool Log helpers ── */
const now = () => {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
}

const addLog = (msg, type = 'info') => {
  const log = document.getElementById('syncLog')
  if (!log) return
  const iconMap = {
    info: 'hub-icon-clock',
    success: 'hub-icon-checkmark',
    error: 'hub-icon-error',
    warning: 'hub-icon-warning',
    sync: 'hub-icon-sync hub-icon-spin',
    upload: 'hub-icon-cloud',
    verify: 'hub-icon-checklist',
    done: 'hub-icon-ok'
  }
  const icon = iconMap[type] || iconMap.info
  const item = document.createElement('div')
  item.className = `sync-log-item sync-log-${type}`
  item.innerHTML = `<i class="hub-icon ${icon}"></i><span class="sync-log-time">[${now()}]</span> <span>${msg}</span>`
  log.prepend(item)
  if (log.children.length > 200) log.lastChild.remove()
}

const setCardStatus = (ep, status, text, pct) => {
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

  if (barEl && pct !== undefined) {
    barEl.style.width = `${Math.min(100, pct)}%`
  }

  if (cardEl) {
    cardEl.className = `sync-card sync-card-${status}`
    cardEl.setAttribute('data-ep', ep)
  }

  if (badgeEl) {
    const labels = {
      pending: '', syncing: 'Đang chạy', uploading: 'Tải lên',
      verifying: 'Kiểm tra', done: 'Xong', error: 'Lỗi', skipped: 'Bỏ qua'
    }
    badgeEl.textContent = labels[status] || ''
    badgeEl.className = `sync-card-badge badge-${status}`
  }
}

const setOverall = (visible, label, count, pct) => {
  const wrap = document.getElementById('syncOverall')
  const labelEl = document.getElementById('syncOverallLabel')
  const countEl = document.getElementById('syncOverallCount')
  const barEl = document.getElementById('syncOverallBar')
  if (wrap) wrap.style.display = visible ? '' : 'none'
  if (labelEl && label) labelEl.innerHTML = label
  if (countEl && count) countEl.textContent = count
  if (barEl && pct !== undefined) barEl.style.width = `${pct}%`
}

const setSyncBtnsDisabled = (disabled) => {
  const ids = ['syncAllBtn', 'hardSyncAllBtn', 'testAllBtn', 'addAccountBtn']
  ids.forEach((id) => {
    const btn = document.getElementById(id)
    if (btn) btn.disabled = disabled
  })
  const stopBtn = document.getElementById('stopSyncBtn')
  if (stopBtn) stopBtn.style.display = disabled ? '' : 'none'
}

const getSpeed = () => {
  const slider = document.getElementById('syncSpeedSlider')
  return slider ? parseInt(slider.value, 10) : 500
}

const delay = (ms) => new Promise((r) => setTimeout(r, ms))

/* ── Sync operations ── */
const initSyncTool = (form, layer, table) => {
  // Speed slider display
  const slider = document.getElementById('syncSpeedSlider')
  const speedVal = document.getElementById('syncSpeedValue')
  if (slider && speedVal) {
    slider.addEventListener('input', () => {
      const v = parseInt(slider.value, 10)
      speedVal.textContent = v === 0 ? 'Tối đa' : `${v}ms`
    })
  }

  // Stop button
  const stopBtn = document.getElementById('stopSyncBtn')
  if (stopBtn) {
    stopBtn.addEventListener('click', () => {
      syncAbort = true
      addLog('Người dùng đã yêu cầu dừng đồng bộ.', 'warning')
    })
  }

  // Sync All
  const syncAllBtn = document.getElementById('syncAllBtn')
  if (syncAllBtn) {
    syncAllBtn.addEventListener('click', () => runSyncAll(false, layer, table))
  }

  // Hard Sync All
  const hardSyncBtn = document.getElementById('hardSyncAllBtn')
  if (hardSyncBtn) {
    hardSyncBtn.addEventListener('click', () => {
      layer.confirm(
        'Đồng bộ toàn bộ sẽ bỏ qua ngày đồng bộ cuối và tải lại tất cả dữ liệu. Tiếp tục?',
        { icon: 3, title: 'Xác nhận' },
        (idx) => {
          layer.close(idx)
          runSyncAll(true, layer, table)
        }
      )
    })
  }

  // Test All
  const testBtn = document.getElementById('testAllBtn')
  if (testBtn) {
    testBtn.addEventListener('click', () => runTestAll(layer))
  }

  // Add Account popup
  const addAccountBtn = document.getElementById('addAccountBtn')
  if (addAccountBtn) {
    addAccountBtn.addEventListener('click', () => openAddAccountDialog(form, layer))
  }
}

const runSyncAll = async (hard, layer, table) => {
  const { syncAll, syncEndpoint, getStatus, ENDPOINTS } = await import('../../services/sync.js')

  syncAbort = false
  setSyncBtnsDisabled(true)
  SYNC_ORDER.forEach((ep) => setCardStatus(ep, 'pending', 'Chờ đồng bộ', 0))

  const total = SYNC_ORDER.length
  let completed = 0
  const results = []

  const modeLabel = hard ? 'Đồng bộ toàn bộ' : 'Đồng bộ tăng dần'
  addLog(`Bắt đầu ${modeLabel} — ${total} endpoint`, 'sync')
  setOverall(true, `<i class="hub-icon hub-icon-sync hub-icon-spin"></i> ${modeLabel}...`, `0 / ${total}`, 0)

  const startTime = Date.now()

  for (const ep of SYNC_ORDER) {
    if (syncAbort) {
      setCardStatus(ep, 'skipped', 'Đã dừng', 0)
      addLog(`${SYNC_EP_LABELS[ep]}: Đã bỏ qua (dừng bởi người dùng)`, 'warning')
      continue
    }

    setCardStatus(ep, 'syncing', 'Đang tải dữ liệu...', 10)
    addLog(`${SYNC_EP_LABELS[ep]}: Bắt đầu đồng bộ...`, 'sync')

    try {
      const result = await syncEndpoint(ep, (progress) => {
        if (!progress) return
        const { step, message } = progress

        if (step === 'fetch') {
          setCardStatus(ep, 'syncing', message || 'Đang tải...', 30)
        } else if (step === 'upload') {
          setCardStatus(ep, 'uploading', message || 'Đang tải lên...', 60)
        } else if (step === 'verify') {
          setCardStatus(ep, 'verifying', message || 'Đang kiểm tra...', 85)
        }

        if (message) addLog(`${SYNC_EP_LABELS[ep]}: ${message}`, step === 'error' ? 'error' : 'info')
      })

      results.push(result)

      if (result.skipped) {
        setCardStatus(ep, 'skipped', `Đã cập nhật (${result.lastDate || ''})`, 100)
        addLog(`${SYNC_EP_LABELS[ep]}: Đã cập nhật, bỏ qua`, 'warning')
      } else {
        const count = result.fetched || result.processed || 0
        setCardStatus(ep, 'done', `Hoàn tất — ${count} bản ghi`, 100)
        addLog(`${SYNC_EP_LABELS[ep]}: Xong — ${count} bản ghi`, 'success')
      }
    } catch (e) {
      setCardStatus(ep, 'error', `Lỗi: ${e.message}`, 0)
      addLog(`${SYNC_EP_LABELS[ep]}: Lỗi — ${e.message}`, 'error')
      results.push({ endpoint: ep, error: e.message })
    }

    completed++
    const pct = Math.round((completed / total) * 100)
    setOverall(true, `<i class="hub-icon hub-icon-sync hub-icon-spin"></i> ${modeLabel}...`, `${completed} / ${total}`, pct)

    // Delay between endpoints based on speed slider
    const spd = getSpeed()
    if (spd > 0 && completed < total && !syncAbort) await delay(spd)
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
  const errors = results.filter((r) => r.error).length

  if (syncAbort) {
    setOverall(true, '<i class="hub-icon hub-icon-warning"></i> Đã dừng', `${completed} / ${total}`, Math.round((completed / total) * 100))
    addLog(`Đồng bộ đã dừng sau ${elapsed}s (${errors} lỗi)`, 'warning')
  } else {
    setOverall(true, '<i class="hub-icon hub-icon-ok"></i> Hoàn tất!', `${total} / ${total}`, 100)
    addLog(`Đồng bộ hoàn tất trong ${elapsed}s — ${errors} lỗi`, errors > 0 ? 'warning' : 'done')
  }

  setSyncBtnsDisabled(false)

  // Reload members table
  if (table) {
    try {
      table.reload('dataTable', { page: { curr: 1 } })
    } catch (_) { /* table may not exist */ }
  }
}

const runTestAll = async (layer) => {
  const { verifyRandom, getStatus } = await import('../../services/sync.js')
  const { fetchAllPages } = await import('../../api/upstream-sync.js')
  const {
    memberApi, betOrderApi, betApi, depositWithdrawalApi,
    reportLotteryApi, reportFundsApi, reportThirdGameApi
  } = await import('../../api/upstream.js')

  syncAbort = false
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

  addLog('Bắt đầu kiểm tra dữ liệu...', 'verify')
  setOverall(true, '<i class="hub-icon hub-icon-checklist"></i> Đang kiểm tra...', `0 / ${testEndpoints.length}`, 0)

  let completed = 0
  let passed = 0
  let failed = 0

  for (const { name, listFn } of testEndpoints) {
    if (syncAbort) {
      setCardStatus(name, 'skipped', 'Đã dừng', 0)
      continue
    }

    setCardStatus(name, 'verifying', 'Đang kiểm tra...', 50)
    addLog(`${SYNC_EP_LABELS[name]}: Đang kiểm tra...`, 'verify')

    try {
      const { data } = await fetchAllPages(listFn, {}, { pageSize: 10, maxPages: 1, sensitive: name === 'members' })
      const result = await verifyRandom(name, data, 3)

      if (result.ok) {
        passed++
        setCardStatus(name, 'done', `Đạt — ${result.checked} mẫu kiểm tra`, 100)
        addLog(`${SYNC_EP_LABELS[name]}: Đạt (${result.checked} mẫu)`, 'success')
      } else {
        failed++
        setCardStatus(name, 'error', `Không đạt — thiếu ${(result.missing || []).length} bản ghi`, 100)
        addLog(`${SYNC_EP_LABELS[name]}: Không đạt — thiếu dữ liệu`, 'error')
      }
    } catch (e) {
      failed++
      setCardStatus(name, 'error', `Lỗi: ${e.message}`, 0)
      addLog(`${SYNC_EP_LABELS[name]}: Lỗi — ${e.message}`, 'error')
    }

    completed++
    setOverall(true, '<i class="hub-icon hub-icon-checklist"></i> Đang kiểm tra...', `${completed} / ${testEndpoints.length}`, Math.round((completed / testEndpoints.length) * 100))

    const spd = getSpeed()
    if (spd > 0 && !syncAbort) await delay(spd)
  }

  setOverall(
    true,
    failed > 0
      ? '<i class="hub-icon hub-icon-warning"></i> Kiểm tra xong (có lỗi)'
      : '<i class="hub-icon hub-icon-ok"></i> Kiểm tra xong',
    `Đạt: ${passed} | Lỗi: ${failed}`,
    100
  )
  addLog(`Kiểm tra hoàn tất: ${passed} đạt, ${failed} lỗi`, failed > 0 ? 'warning' : 'done')

  setSyncBtnsDisabled(false)
}

const openAddAccountDialog = (form, layer) => {
  layer.open({
    type: 1,
    title: '<i class="hub-icon hub-icon-plus" style="vertical-align:middle;margin-right:6px;"></i>Thêm Tài Khoản',
    area: '380px',
    maxHeight: 500,
    content: `
      <form class="layui-form" lay-filter="addAccountForm" style="padding: 15px 25px 5px;">
        <div class="layui-form-item">
          <div class="layui-input-wrap">
            <div class="layui-input-prefix">
              <i class="hub-icon hub-icon-user"></i>
            </div>
            <input type="text" name="owner" lay-verify="required" placeholder="Tên người sở hữu" lay-reqtext="Vui lòng nhập tên người sở hữu" autocomplete="off" class="layui-input" lay-affix="clear">
          </div>
        </div>
        <div class="layui-form-item">
          <div class="layui-input-wrap">
            <div class="layui-input-prefix">
              <i class="hub-icon hub-icon-user"></i>
            </div>
            <input type="text" name="username" lay-verify="required" placeholder="Tài khoản ee88" lay-reqtext="Vui lòng nhập tài khoản" autocomplete="off" class="layui-input" lay-affix="clear">
          </div>
        </div>
        <div class="layui-form-item">
          <div class="layui-input-wrap">
            <div class="layui-input-prefix">
              <i class="hub-icon hub-icon-lock"></i>
            </div>
            <input type="password" name="password" lay-verify="required" placeholder="Mật khẩu ee88" lay-reqtext="Vui lòng nhập mật khẩu" autocomplete="off" class="layui-input" lay-affix="eye">
          </div>
        </div>
        <div class="layui-form-item">
          <div class="layui-input-wrap">
            <div class="layui-input-prefix">
              <i class="hub-icon hub-icon-link"></i>
            </div>
            <input type="text" name="base_url" lay-verify="required|url" placeholder="Link URL Base" lay-reqtext="Vui lòng nhập URL Base" value="https://a2u4k.ee88dly.com/" autocomplete="off" class="layui-input" lay-affix="clear">
          </div>
        </div>
        <div class="layui-form-item">
          <div class="layui-row">
            <div class="layui-col-xs7">
              <div class="layui-input-wrap">
                <div class="layui-input-prefix">
                  <i class="hub-icon hub-icon-security"></i>
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
          <button type="button" class="layui-btn layui-btn-fluid" lay-submit lay-filter="submitAddAccount">
            <i class="hub-icon hub-icon-login"></i> Đăng nhập
          </button>
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
}

/* ── Load table ── */
const loadTable = (endpoint, hash) => {
  const cols = ENDPOINT_COLS[endpoint]
  if (!cols) return
  const isSync = hash === '#/settings-sync'
  const tableCols = isSync ? [{ type: 'checkbox', fixed: 'left' }, ...cols] : cols

  layui.use(['table', 'form', 'laydate', 'layer'], function (table, form, laydate, layer) {
    form.render('select')

    if (ENDPOINT_HAS_DATE[endpoint] && !isSync) {
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

    // Convert toolbar native title → lay-tips
    document.querySelectorAll('.layui-table-tool-self [title]').forEach((el) => {
      el.setAttribute('lay-tips', el.getAttribute('title'))
      el.setAttribute('lay-direction', '3')
      el.removeAttribute('title')
    })

    // Search submit
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

    // Init sync tool for sync page
    if (isSync) {
      initSyncTool(form, layer, table)
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
  syncAbort = true
}
