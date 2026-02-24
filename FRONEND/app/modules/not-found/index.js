import { ROUTES } from '../../constants/index.js'
import { escapeHtml } from '../../utils/index.js'

const template = (hash) => `
  <div class="layui-card">
    <div class="layui-card-body placeholder-body">
      <h1 class="not-found-title">404</h1>
      <p class="not-found-text">Trang <strong>${escapeHtml(hash)}</strong> không tồn tại</p>
      <a href="${ROUTES.DASHBOARD}" class="layui-btn">Về trang chủ</a>
    </div>
  </div>
`

export const render = (hash, container) => {
  const el = container || document.getElementById('main-content')
  el.innerHTML = template(hash)
}

export const destroy = () => {}
