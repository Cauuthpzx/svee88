import { store } from '../../store/index.js'
import { escapeHtml } from '../../utils/index.js'

const template = (user) => `
  <div class="layui-card">
    <div class="layui-card-header">Dashboard</div>
    <div class="layui-card-body">
      <p>Xin chào, <strong>${escapeHtml(user?.name)}</strong>!</p>
      <p>Username: ${escapeHtml(user?.username)}</p>
      <p>Email: ${escapeHtml(user?.email)}</p>
    </div>
  </div>
`

let unsubUser = null

export const render = (hash, container) => {
  const el = container || document.getElementById('main-content')
  const update = () => { el.innerHTML = template(store.get('user')) }
  update()
  unsubUser = store.on('user', update)
}

export const destroy = () => {
  if (unsubUser) {
    unsubUser()
    unsubUser = null
  }
}
