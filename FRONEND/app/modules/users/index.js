import http from '../../api/http.js'
import { API } from '../../constants/index.js'

const template = () => `
  <div class="layui-card">
    <div class="layui-card-header">Quản lý người dùng</div>
    <div class="layui-card-body">
      <table id="userTable" lay-filter="userTable"></table>
    </div>
  </div>
`

const loadUsers = async () => {
  try {
    const res = await http.get(API.USERS, { params: { page: 1, items_per_page: 20 } })
    const data = res.data || res
    layui.use('table', (table) => {
      table.render({
        elem: '#userTable',
        cols: [[
          { field: 'username', title: 'Username', width: 150 },
          { field: 'name', title: 'Họ tên', width: 180 },
          { field: 'email', title: 'Email', minWidth: 200 },
          { field: 'is_active', title: 'Trạng thái', width: 120, templet: (d) => d.is_active ? '<span style="color:#16baaa">Hoạt động</span>' : '<span style="color:#999">Khóa</span>' },
          { field: 'created_at', title: 'Ngày tạo', width: 160 }
        ]],
        data: Array.isArray(data) ? data : [],
        page: false,
        skin: 'line',
        even: true
      })
    })
  } catch (_) { /* handled by interceptor */ }
}

export const render = () => {
  document.getElementById('main-content').innerHTML = template()
  loadUsers()
}
