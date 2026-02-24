import { API } from '../../constants/index.js'
import { store } from '../../store/index.js'
import { escapeHtml, getToken } from '../../utils/index.js'

const template = () => `
  <div class="layui-card">
    <div class="layui-card-header">Quản lý bài viết</div>
    <div class="layui-card-body">
      <table id="postTable" lay-filter="postTable"></table>
    </div>
  </div>
`

const loadPosts = () => {
  const user = store.get('user')
  if (!user) return
  layui.use('table', function (table) {
    table.render({
      elem: '#postTable',
      url: API.POSTS(user.username),
      headers: { Authorization: `Bearer ${getToken()}` },
      parseData: (res) => ({
        code: 0,
        count: Array.isArray(res.data || res) ? (res.data || res).length : 0,
        data: Array.isArray(res.data || res) ? (res.data || res) : []
      }),
      request: { pageName: 'page', limitName: 'items_per_page' },
      cols: [[
        { field: 'id', title: 'ID', width: 80 },
        { field: 'title', title: 'Tiêu đề', minWidth: 250, templet: (d) => escapeHtml(d.title) },
        { field: 'text', title: 'Nội dung', minWidth: 300, templet: (d) => escapeHtml(d.text) },
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
  loadPosts()
}

export const destroy = () => {}
