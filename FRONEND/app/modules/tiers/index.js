import http from '../../api/http.js'
import { API } from '../../constants/index.js'
import { escapeHtml } from '../../utils/index.js'

const template = () => `
  <div class="layui-card">
    <div class="layui-card-header">Quản lý cấp bậc</div>
    <div class="layui-card-body">
      <table id="tierTable" lay-filter="tierTable"></table>
    </div>
  </div>
`

const loadTiers = () => {
  layui.use('table', function (table) {
    table.render({
      elem: '#tierTable',
      url: API.TIERS,
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      parseData: (res) => ({
        code: 0,
        count: Array.isArray(res.data || res) ? (res.data || res).length : 0,
        data: Array.isArray(res.data || res) ? (res.data || res) : []
      }),
      request: { pageName: 'page', limitName: 'items_per_page' },
      cols: [[
        { field: 'name', title: 'Tên cấp bậc', width: 200, templet: (d) => escapeHtml(d.name) },
        { field: 'created_at', title: 'Ngày tạo', width: 160 }
      ]],
      page: false,
      skin: 'line',
      even: true
    })
  })
}

export const render = () => {
  document.getElementById('main-content').innerHTML = template()
  loadTiers()
}

export const destroy = () => {}
