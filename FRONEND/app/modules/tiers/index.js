import http from '../../api/http.js'
import { API } from '../../constants/index.js'

const template = () => `
  <div class="layui-card">
    <div class="layui-card-header">Quản lý cấp bậc</div>
    <div class="layui-card-body">
      <table id="tierTable" lay-filter="tierTable"></table>
    </div>
  </div>
`

const loadTiers = async () => {
  try {
    const res = await http.get(API.TIERS, { params: { page: 1, items_per_page: 20 } })
    const data = res.data || res
    layui.use('table', (table) => {
      table.render({
        elem: '#tierTable',
        cols: [[
          { field: 'name', title: 'Tên cấp bậc', width: 200 },
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
  loadTiers()
}
