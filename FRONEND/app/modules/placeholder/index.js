import { ROUTE_TITLES } from '../../constants/index.js'
import { escapeHtml } from '../../utils/index.js'
import { t } from '../../i18n/index.js'

const template = (title) => `
  <div class="layui-card">
    <div class="layui-card-header">${escapeHtml(title)}</div>
    <div class="layui-card-body placeholder-body">
      <i class="hub-icon hub-icon-layout placeholder-icon"></i>
      <p class="placeholder-text">${t('page.under_development')}</p>
    </div>
  </div>
`

let currentHash = null

export const render = (hash, container) => {
  currentHash = hash
  const el = container || document.getElementById('main-content')
  const title = ROUTE_TITLES[hash] || hash.replace('#/', '')
  el.innerHTML = template(title)
}

export const destroy = () => {
  currentHash = null
}
