import http from '../../api/http.js'
import { API } from '../../constants/index.js'
import { escapeHtml } from '../../utils/index.js'

const template = () => `
  <div class="layui-card">
    <div class="layui-card-header">Quản lý tác vụ</div>
    <div class="layui-card-body">
      <div class="task-toolbar">
        <button class="layui-btn layui-btn-sm" id="createTaskBtn">Tạo tác vụ mới</button>
      </div>
      <div id="taskList"><p class="text-muted">Chưa có tác vụ nào.</p></div>
    </div>
  </div>
`

let cleanup = null

const handleCreateTask = () => {
  layui.use('layer', function (layer) {
    layer.prompt({ title: 'Nhập nội dung tác vụ', formType: 0 }, async (value, index) => {
      try {
        const res = await http.post(API.TASKS_CREATE, null, {
          params: { message: value }
        })
        layer.close(index)
        layer.msg('Tạo tác vụ thành công', { icon: 1 })
        const el = document.getElementById('taskList')
        if (el) el.innerHTML = `<p>Task ID: <strong>${escapeHtml(res.id || res.data?.id || '—')}</strong></p>`
      } catch (_) {
        layer.msg('Tạo tác vụ thất bại', { icon: 2 })
      }
    })
  })
}

const bindEvents = () => {
  const btn = document.getElementById('createTaskBtn')
  if (btn) {
    btn.addEventListener('click', handleCreateTask)
    cleanup = () => btn.removeEventListener('click', handleCreateTask)
  }
}

export const render = () => {
  document.getElementById('main-content').innerHTML = template()
  bindEvents()
}

export const destroy = () => {
  if (cleanup) {
    cleanup()
    cleanup = null
  }
}
