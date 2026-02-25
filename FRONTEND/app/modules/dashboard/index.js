import { store } from '../../store/index.js'
import { escapeHtml } from '../../utils/index.js'
import { t } from '../../i18n/index.js'

const template = (user) => `
  <div class="layui-card">
    <div class="layui-card-header">${t('dashboard.title')}</div>
    <div class="layui-card-body">
      <p>${t('dashboard.greeting', { name: `<strong>${escapeHtml(user?.name)}</strong>` })}</p>
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
