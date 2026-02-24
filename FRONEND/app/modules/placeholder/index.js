import { ROUTE_TITLES } from '../../constants/index.js'
import { escapeHtml } from '../../utils/index.js'

const template = (title) => `
  <div class="layui-card">
    <div class="layui-card-header">${escapeHtml(title)}</div>
    <div class="layui-card-body placeholder-body">
      <i class="layui-icon layui-icon-template-1 placeholder-icon"></i>
      <p class="placeholder-text">Trang đang được phát triển</p>
    </div>
  </div>
`

let currentHash = null

export const render = (hash) => {
  currentHash = hash
  const title = ROUTE_TITLES[hash] || hash.replace('#/', '')
  document.getElementById('main-content').innerHTML = template(title)
}

export const destroy = () => {
  currentHash = null
}
