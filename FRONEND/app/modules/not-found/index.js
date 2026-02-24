import { ROUTES } from '../../constants/index.js'
import { escapeHtml } from '../../utils/index.js'

const template = (hash) => `
  <div class="layui-card">
    <div class="layui-card-body" style="text-align:center;padding:60px 20px">
      <h1 class="not-found-title">404</h1>
      <p class="not-found-text">Trang <strong>${escapeHtml(hash)}</strong> không tồn tại</p>
      <a href="${ROUTES.DASHBOARD}" class="layui-btn">Về trang chủ</a>
    </div>
  </div>
`

export const render = (hash) => {
  document.getElementById('main-content').innerHTML = template(hash)
}
