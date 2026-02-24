import { API } from '../../constants/index.js'
import { escapeHtml, getToken } from '../../utils/index.js'

const template = () => `
  <div class="layui-card">
    <div class="layui-card-header">Quản lý người dùng</div>
    <div class="layui-card-body">
      <table id="userTable" lay-filter="userTable"></table>
    </div>
  </div>
`

const STATUS_HTML = {
  active: '<span class="text-success">Hoạt động</span>',
  inactive: '<span class="text-muted">Khóa</span>'
}

let cleanup = null

const loadUsers = () => {
  layui.use('table', function (table) {
    table.render({
      elem: '#userTable',
      url: API.USERS,
      headers: { Authorization: `Bearer ${getToken()}` },
      parseData: (res) => ({
        code: 0,
        count: Array.isArray(res.data || res) ? (res.data || res).length : 0,
        data: Array.isArray(res.data || res) ? (res.data || res) : []
      }),
      request: { pageName: 'page', limitName: 'items_per_page' },
      cols: [[
        { field: 'username', title: 'Username', width: 150, templet: (d) => escapeHtml(d.username) },
        { field: 'name', title: 'Họ tên', width: 180, templet: (d) => escapeHtml(d.name) },
        { field: 'email', title: 'Email', minWidth: 200, templet: (d) => escapeHtml(d.email) },
        { field: 'is_active', title: 'Trạng thái', width: 120, templet: (d) => d.is_active ? STATUS_HTML.active : STATUS_HTML.inactive },
        { field: 'created_at', title: 'Ngày tạo', width: 160 }
      ]],
      page: false,
      skin: 'line',
      even: true
    })
  })
}

export const render = (hash, container) => {
  const el = container || document.getElementById('main-content')
  el.innerHTML = template()
  loadUsers()
}

export const destroy = () => {
  if (cleanup) {
    cleanup()
    cleanup = null
  }
}
