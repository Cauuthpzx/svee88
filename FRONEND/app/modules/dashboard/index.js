import { store } from '../../store/index.js'

const template = (user) => `
  <div class="layui-card">
    <div class="layui-card-header">Dashboard</div>
    <div class="layui-card-body">
      <p>Xin chào, <strong>${user?.name || ''}</strong>!</p>
      <p>Username: ${user?.username || ''}</p>
      <p>Email: ${user?.email || ''}</p>
    </div>
  </div>
`

export const render = () => {
  document.getElementById('main-content').innerHTML = template(store.get('user'))
}
