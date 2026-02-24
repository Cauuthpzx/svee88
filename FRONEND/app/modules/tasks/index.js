import http from '../../api/http.js'
import { API } from '../../constants/index.js'

const template = () => `
  <div class="layui-card">
    <div class="layui-card-header">Quản lý tác vụ</div>
    <div class="layui-card-body">
      <div style="margin-bottom: 16px;">
        <button class="layui-btn layui-btn-sm" id="createTaskBtn">Tạo tác vụ mới</button>
      </div>
      <div id="taskList"><p style="color:#999">Chưa có tác vụ nào.</p></div>
    </div>
  </div>
`

const bindEvents = () => {
  document.getElementById('createTaskBtn')?.addEventListener('click', () => {
    layui.use('layer', (layer) => {
      layer.prompt({ title: 'Nhập nội dung tác vụ', formType: 0 }, async (value, index) => {
        try {
          const res = await http.post(`${API.TASKS_CREATE}?message=${encodeURIComponent(value)}`)
          layer.close(index)
          layer.msg('Tạo tác vụ thành công', { icon: 1 })
          const el = document.getElementById('taskList')
          if (el) el.innerHTML = `<p>Task ID: <strong>${res.id || res.data?.id || '—'}</strong></p>`
        } catch (_) {
          layer.msg('Tạo tác vụ thất bại', { icon: 2 })
        }
      })
    })
  })
}

export const render = () => {
  document.getElementById('main-content').innerHTML = template()
  bindEvents()
}
