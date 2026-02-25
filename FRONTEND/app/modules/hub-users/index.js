/**
 * Hub Users module — Phân Quyền HUBER
 * Quản lý tài khoản ADMINHUB / MODHUB / USERHUB + ma trận phân quyền
 */

import { escapeHtml } from '../../utils/index.js'
import { t } from '../../i18n/index.js'

const API_BASE = '/api/v1/hub-users'

// ── Tất cả routes trong app dùng cho ma trận quyền ──────────────────
const ALL_ROUTES = [
  { hash: '#/dashboard',          label: 'Trang chủ' },
  { hash: '#/users',              label: 'Danh sách hội viên' },
  { hash: '#/invite-list',        label: 'Mã giới thiệu' },
  { hash: '#/report-lottery',     label: 'Báo cáo xổ số' },
  { hash: '#/report-funds',       label: 'Báo cáo tài chính' },
  { hash: '#/report-provider',    label: 'Báo cáo nhà cung cấp' },
  { hash: '#/deposit-list',       label: 'Nạp / Rút tiền' },
  { hash: '#/withdrawal-history', label: 'Lịch sử rút tiền' },
  { hash: '#/bet-list',           label: 'Cược xổ số' },
  { hash: '#/bet-third-party',    label: 'Cược bên thứ 3' },
  { hash: '#/rebate-list',        label: 'Tỷ lệ hoàn trả' },
  { hash: '#/settings-system',    label: 'Hệ thống' },
  { hash: '#/settings-sync',      label: 'Đồng Bộ' },
  { hash: '#/settings-account',   label: 'Phân Quyền HUBER' },
  { hash: '#/tiers',              label: 'Quản lý cấp bậc' },
  { hash: '#/change-login-pw',    label: 'Đổi MK đăng nhập' },
  { hash: '#/change-trade-pw',    label: 'Đổi MK giao dịch' },
]

const ALL_ACTIONS = [
  { key: 'export',            label: 'Export bảng' },
  { key: 'print',             label: 'In bảng' },
  { key: 'sync_add_account',  label: 'Thêm tài khoản EE88' },
  { key: 'sync_run',          label: 'Chạy đồng bộ' },
  { key: 'sync_full',         label: 'Đồng bộ toàn bộ' },
  { key: 'sync_test',         label: 'Kiểm tra dữ liệu' },
  { key: 'invite_copy',       label: 'Copy link mời' },
  { key: 'invite_qr',         label: 'Xem QR code' },
  { key: 'invite_settings',   label: 'Xem cài đặt mời' },
]

// ── Template trang chính ──────────────────────────────────────────────
const template = () => `
  <div class="layui-card hub-users-card">
    <div class="layui-card-header" style="display:flex;align-items:center;justify-content:space-between;">
      <span>Phân Quyền HUBER</span>
      <button class="layui-btn layui-btn-sm layui-btn-normal" id="hubUserAddBtn">
        <i class="layui-icon layui-icon-add-1"></i> Thêm tài khoản
      </button>
    </div>
    <div class="layui-card-body">
      <table id="hubUserTable" lay-filter="hubUserTable"></table>
    </div>
  </div>
`

// ── Template modal thêm/sửa ──────────────────────────────────────────
const modalFormTemplate = (user = null) => `
  <form class="layui-form" id="hubUserForm" style="padding:20px 30px 0;">
    <div class="layui-form-item">
      <label class="layui-form-label">Tên đăng nhập</label>
      <div class="layui-input-block">
        <input type="text" name="username" lay-verify="required" placeholder="Tên đăng nhập"
          class="layui-input" value="${escapeHtml(user?.username || '')}" ${user ? 'disabled' : ''}>
      </div>
    </div>
    <div class="layui-form-item">
      <label class="layui-form-label">Mật khẩu</label>
      <div class="layui-input-block">
        <input type="password" name="password" lay-verify="${user ? '' : 'required'}" placeholder="${user ? 'Để trống = không đổi' : 'Mật khẩu (tối thiểu 6 ký tự)'}"
          class="layui-input">
      </div>
    </div>
    <div class="layui-form-item">
      <label class="layui-form-label">Email</label>
      <div class="layui-input-block">
        <input type="email" name="email" placeholder="Email (tùy chọn)"
          class="layui-input" value="${escapeHtml(user?.email || '')}">
      </div>
    </div>
    <div class="layui-form-item">
      <label class="layui-form-label">Cấp bậc</label>
      <div class="layui-input-block">
        <select name="role" lay-filter="hubUserRole">
          <option value="USERHUB" ${(user?.role || 'USERHUB') === 'USERHUB' ? 'selected' : ''}>USERHUB</option>
          <option value="MODHUB" ${user?.role === 'MODHUB' ? 'selected' : ''}>MODHUB</option>
          <option value="ADMINHUB" ${user?.role === 'ADMINHUB' ? 'selected' : ''}>ADMINHUB</option>
        </select>
      </div>
    </div>
    <div class="layui-form-item">
      <label class="layui-form-label">Trạng thái</label>
      <div class="layui-input-block">
        <input type="checkbox" name="is_active" lay-skin="switch" lay-text="Hoạt động|Khoá"
          ${(user?.is_active !== false) ? 'checked' : ''}>
      </div>
    </div>
  </form>
`

// ── Template modal phân quyền ─────────────────────────────────────────
const permissionsModalTemplate = (user, perms) => {
  const allowedRoutes = perms.routes || []
  const allowedActions = perms.actions || []
  const isAll = allowedRoutes.includes('*')
  const isAllActions = allowedActions.includes('*')

  const routeRows = ALL_ROUTES.map(r => `
    <tr>
      <td>
        <input type="checkbox" class="perm-route-cb" value="${escapeHtml(r.hash)}"
          ${isAll || allowedRoutes.includes(r.hash) ? 'checked' : ''}>
      </td>
      <td style="padding-left:8px;">${escapeHtml(r.label)}</td>
      <td style="color:#aaa;font-size:12px;">${escapeHtml(r.hash)}</td>
    </tr>
  `).join('')

  const actionRows = ALL_ACTIONS.map(a => `
    <tr>
      <td>
        <input type="checkbox" class="perm-action-cb" value="${escapeHtml(a.key)}"
          ${isAllActions || allowedActions.includes(a.key) ? 'checked' : ''}>
      </td>
      <td style="padding-left:8px;">${escapeHtml(a.label)}</td>
    </tr>
  `).join('')

  return `
    <div style="padding:10px 20px;max-height:70vh;overflow-y:auto;">
      <p style="margin-bottom:8px;color:#666;">
        Cấp bậc: <b>${escapeHtml(user.role)}</b> — Quyền đang hiển thị là override cá nhân (nếu chưa có sẽ dùng default của role).
      </p>
      <div class="layui-row layui-col-space16">
        <div class="layui-col-md6">
          <div style="font-weight:bold;margin-bottom:6px;border-bottom:1px solid #e2e2e2;padding-bottom:6px;">
            <input type="checkbox" id="checkAllRoutes"> Trang / Menu
          </div>
          <table style="width:100%;font-size:13px;">
            <tbody id="routePermTable">${routeRows}</tbody>
          </table>
        </div>
        <div class="layui-col-md6">
          <div style="font-weight:bold;margin-bottom:6px;border-bottom:1px solid #e2e2e2;padding-bottom:6px;">
            <input type="checkbox" id="checkAllActions"> Hành động / Nút
          </div>
          <table style="width:100%;font-size:13px;">
            <tbody id="actionPermTable">${actionRows}</tbody>
          </table>
        </div>
      </div>
    </div>
  `
}

// ── API helpers ──────────────────────────────────────────────────────
const apiFetch = async (url, options = {}) => {
  const res = await fetch(url, { credentials: 'include', ...options })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `HTTP ${res.status}`)
  }
  return res.json()
}

// ── Load table ──────────────────────────────────────────────────────
const loadTable = (table, layer) => {
  table.render({
    elem: '#hubUserTable',
    id: 'hubUserTable',
    url: API_BASE,
    method: 'get',
    parseData: (res) => ({ code: 0, data: res.data || [], count: res.count || 0 }),
    cols: [[
      { field: 'id', title: 'ID', width: 60 },
      { field: 'username', title: 'Tên đăng nhập', width: 160, templet: (d) => escapeHtml(d.username) },
      { field: 'email', title: 'Email', width: 200, templet: (d) => escapeHtml(d.email || '—') },
      {
        field: 'role', title: 'Cấp bậc', width: 120,
        templet: (d) => {
          const colorMap = { ADMINHUB: '#FF5722', MODHUB: '#2196F3', USERHUB: '#4CAF50' }
          const c = colorMap[d.role] || '#999'
          return `<span style="color:${c};font-weight:bold;">${escapeHtml(d.role)}</span>`
        }
      },
      {
        field: 'is_active', title: 'Trạng thái', width: 100,
        templet: (d) => d.is_active
          ? '<span style="color:#4CAF50;">● Hoạt động</span>'
          : '<span style="color:#999;">● Khoá</span>'
      },
      { field: 'created_at', title: 'Ngày tạo', width: 160, templet: (d) => d.created_at?.slice(0, 16) || '' },
      {
        title: 'Thao tác', width: 240, align: 'center',
        templet: (d) => `
          <button class="layui-btn layui-btn-xs layui-btn-warm hub-edit-btn" data-id="${d.id}">Sửa</button>
          <button class="layui-btn layui-btn-xs layui-btn-normal hub-perm-btn" data-id="${d.id}" data-username="${escapeHtml(d.username)}" data-role="${escapeHtml(d.role)}">Phân quyền</button>
          <button class="layui-btn layui-btn-xs layui-btn-danger hub-del-btn" data-id="${d.id}" data-username="${escapeHtml(d.username)}">Xóa</button>
        `
      }
    ]],
    page: false,
    skin: 'grid',
    even: true,
    size: 'sm',
  })
}

// ── Mở modal thêm / sửa ─────────────────────────────────────────────
const openUserModal = (layer, form, table, userId = null, userData = null) => {
  const isEdit = !!userId
  const title = isEdit ? `Sửa tài khoản: ${escapeHtml(userData?.username || '')}` : 'Thêm tài khoản mới'

  layer.open({
    type: 1,
    title,
    area: ['480px', 'auto'],
    content: modalFormTemplate(userData),
    success: () => {
      form.render()
    },
    btn: ['Lưu', 'Hủy'],
    yes: async (index) => {
      const formEl = document.getElementById('hubUserForm')
      const fd = new FormData(formEl)
      const isActiveEl = formEl.querySelector('[name="is_active"]')

      const payload = {
        username: fd.get('username'),
        email: fd.get('email') || null,
        role: fd.get('role') || 'USERHUB',
        is_active: isActiveEl ? isActiveEl.checked : true,
      }
      const pw = fd.get('password')
      if (pw) payload.password = pw

      try {
        if (isEdit) {
          await apiFetch(`${API_BASE}/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
          layer.msg('Cập nhật thành công', { icon: 1, time: 1500 })
        } else {
          if (!payload.password) { layer.msg('Vui lòng nhập mật khẩu', { icon: 2 }); return }
          await apiFetch(API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
          layer.msg('Tạo tài khoản thành công', { icon: 1, time: 1500 })
        }
        layer.close(index)
        table.reload('hubUserTable')
      } catch (e) {
        layer.msg(`Lỗi: ${e.message}`, { icon: 2 })
      }
    }
  })
}

// ── Mở modal phân quyền ──────────────────────────────────────────────
const openPermissionsModal = async (layer, table, userId, username, role) => {
  let perms = { routes: [], actions: [] }
  try {
    const res = await apiFetch(`${API_BASE}/${userId}/permissions`)
    perms = res.data?.permissions || perms
  } catch {}

  layer.open({
    type: 1,
    title: `Phân quyền: ${escapeHtml(username)} (${escapeHtml(role)})`,
    area: ['860px', '80vh'],
    content: permissionsModalTemplate({ username, role }, perms),
    success: () => {
      // Check all routes toggle
      const checkAllRoutes = document.getElementById('checkAllRoutes')
      const checkAllActions = document.getElementById('checkAllActions')
      if (checkAllRoutes) {
        checkAllRoutes.addEventListener('change', (e) => {
          document.querySelectorAll('.perm-route-cb').forEach(cb => { cb.checked = e.target.checked })
        })
      }
      if (checkAllActions) {
        checkAllActions.addEventListener('change', (e) => {
          document.querySelectorAll('.perm-action-cb').forEach(cb => { cb.checked = e.target.checked })
        })
      }
    },
    btn: ['Lưu quyền', 'Đặt lại theo Role', 'Hủy'],
    yes: async (index) => {
      const routes = [...document.querySelectorAll('.perm-route-cb:checked')].map(cb => cb.value)
      const actions = [...document.querySelectorAll('.perm-action-cb:checked')].map(cb => cb.value)
      try {
        await apiFetch(`${API_BASE}/${userId}/permissions`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ permissions: { routes, actions } }),
        })
        layer.msg('Đã lưu phân quyền', { icon: 1, time: 1500 })
        layer.close(index)
        table.reload('hubUserTable')
      } catch (e) {
        layer.msg(`Lỗi: ${e.message}`, { icon: 2 })
      }
    },
    btn2: async (index) => {
      // Đặt lại về null (dùng role default)
      try {
        await apiFetch(`${API_BASE}/${userId}/permissions`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ permissions: null }),
        })
        layer.msg('Đã đặt lại về quyền mặc định của role', { icon: 1, time: 1500 })
        layer.close(index)
      } catch (e) {
        layer.msg(`Lỗi: ${e.message}`, { icon: 2 })
      }
    }
  })
}

// ── Bind button events ───────────────────────────────────────────────
const bindEvents = (container, layer, form, table) => {
  container.addEventListener('click', async (e) => {
    // Nút thêm
    if (e.target.closest('#hubUserAddBtn')) {
      openUserModal(layer, form, table)
      return
    }

    // Nút sửa
    const editBtn = e.target.closest('.hub-edit-btn')
    if (editBtn) {
      const userId = editBtn.dataset.id
      const tableData = table.cache['hubUserTable'] || []
      const userData = tableData.find(r => String(r.id) === String(userId))
      openUserModal(layer, form, table, userId, userData)
      return
    }

    // Nút phân quyền
    const permBtn = e.target.closest('.hub-perm-btn')
    if (permBtn) {
      const { id, username, role } = permBtn.dataset
      await openPermissionsModal(layer, table, id, username, role)
      return
    }

    // Nút xóa
    const delBtn = e.target.closest('.hub-del-btn')
    if (delBtn) {
      const { id, username } = delBtn.dataset
      layer.confirm(`Xóa tài khoản <b>${escapeHtml(username)}</b>?`, { icon: 3 }, async (index) => {
        try {
          await apiFetch(`${API_BASE}/${id}`, { method: 'DELETE' })
          layer.msg('Đã xóa', { icon: 1, time: 1500 })
          layer.close(index)
          table.reload('hubUserTable')
        } catch (ex) {
          layer.msg(`Lỗi: ${ex.message}`, { icon: 2 })
        }
      })
    }
  })
}

// ── Render ────────────────────────────────────────────────────────────
export const render = (hash, container) => {
  const el = container || document.getElementById('main-content')
  el.innerHTML = template()

  layui.use(['table', 'layer', 'form'], function (table, layer, form) {
    loadTable(table, layer)
    bindEvents(el, layer, form, table)
  })
}

export const destroy = () => {}
