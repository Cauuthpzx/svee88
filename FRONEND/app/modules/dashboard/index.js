import { authApi } from '../../api/auth.js'
import { clearToken } from '../../utils/index.js'
import { store } from '../../store/index.js'
import { ROUTES, MSG } from '../../constants/index.js'
import './index.css'

const template = (user) => `
  <div class="layui-container dashboard-wrapper">
    <div class="layui-card">
      <div class="layui-card-header">
        <h2>Dashboard</h2>
      </div>
      <div class="layui-card-body">
        <p>Xin chào, <strong id="userName">${user?.name || ''}</strong>!</p>
        <p id="userUsername">Username: ${user?.username || ''}</p>
        <p id="userEmail">Email: ${user?.email || ''}</p>
        <br>
        <button class="layui-btn layui-btn-danger" id="logoutBtn">
          <i class="layui-icon layui-icon-logout"></i> Đăng xuất
        </button>
      </div>
    </div>
  </div>
`

const handleLogout = () => {
  layui.use('layer', function (layer) {
    layer.confirm('Bạn muốn đăng xuất?', { icon: 3 }, async (idx) => {
      try { await authApi.logout() } catch (_) { /* noop */ }
      clearToken()
      store.set('user', null)
      layer.close(idx)
      layer.msg(MSG.LOGOUT_SUCCESS, { icon: 1 })
      location.hash = ROUTES.LOGIN
    })
  })
}

const loadUserInfo = async () => {
  try {
    const user = await authApi.getMe()
    store.set('user', user)
    const nameEl = document.getElementById('userName')
    const usernameEl = document.getElementById('userUsername')
    const emailEl = document.getElementById('userEmail')
    if (nameEl) nameEl.textContent = user.name
    if (usernameEl) usernameEl.textContent = `Username: ${user.username}`
    if (emailEl) emailEl.textContent = `Email: ${user.email}`
  } catch (_) { /* handled by http interceptor */ }
}

export const render = () => {
  const container = document.getElementById('app')
  container.innerHTML = template(store.get('user'))

  document.getElementById('logoutBtn')
    ?.addEventListener('click', handleLogout)

  loadUserInfo()
}
