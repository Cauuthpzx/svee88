import http from '../../api/http.js'
import { API } from '../../constants/index.js'
import { store } from '../../store/index.js'

const template = () => `
  <div class="layui-card">
    <div class="layui-card-header">Quản lý bài viết</div>
    <div class="layui-card-body">
      <table id="postTable" lay-filter="postTable"></table>
    </div>
  </div>
`

const loadPosts = async () => {
  const user = store.get('user')
  if (!user) return
  try {
    const res = await http.get(API.POSTS(user.username), { params: { page: 1, items_per_page: 20 } })
    const data = res.data || res
    layui.use('table', (table) => {
      table.render({
        elem: '#postTable',
        cols: [[
          { field: 'id', title: 'ID', width: 80 },
          { field: 'title', title: 'Tiêu đề', minWidth: 250 },
          { field: 'text', title: 'Nội dung', minWidth: 300 },
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
  loadPosts()
}
