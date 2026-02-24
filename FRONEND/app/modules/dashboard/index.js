import { authApi } from '../../api/auth.js'
import { clearToken } from '../../utils/index.js'
import { store } from '../../store/index.js'
import { ROUTES, MSG } from '../../constants/index.js'

const template = (user) => `
  <div class="layui-container" style="padding-top: 60px;">
    <div class="layui-card">
      <div class="layui-card-header">
        <h2>Dashboard</h2>
      </div>
      <div class="layui-card-body">
        <p>Xin chào, <strong>${user?.name || 'User'}</strong>!</p>
        <p>Username: ${user?.username || ''}</p>
        <p>Email: ${user?.email || ''}</p>
        <br>
        <button class="layui-btn layui-btn-danger" id="logoutBtn">
          <i class="layui-icon layui-icon-logout"></i> Đăng xuất
        </button>
      </div>
    </div>
  </div>
`

const handleLogout = async () => {
  layui.use('layer', ({ layer }) => {
    layer.confirm('Bạn muốn đăng xuất?', { icon: 3 }, async (idx) => {
      try {
        await authApi.logout()
      } catch (_) {
        /* ignore logout API errors */
      }
      clearToken()
      store.set('token', null)
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
    const nameEl = document.querySelector('.layui-card-body strong')
    const usernameEl = document.querySelectorAll('.layui-card-body p')[1]
    const emailEl = document.querySelectorAll('.layui-card-body p')[2]
    if (nameEl) nameEl.textContent = user.name
    if (usernameEl) usernameEl.textContent = `Username: ${user.username}`
    if (emailEl) emailEl.textContent = `Email: ${user.email}`
  } catch (_) {
    /* handled by interceptor */
  }
}

export const render = () => {
  const container = document.getElementById('app')
  const user = store.get('user')
  container.innerHTML = template(user)

  const logoutBtn = document.getElementById('logoutBtn')
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout)

  loadUserInfo()
}
