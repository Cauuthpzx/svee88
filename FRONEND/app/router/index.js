import { getToken } from '../utils/index.js'
import { ROUTES, INTENDED_ROUTE_KEY } from '../constants/index.js'

const placeholder = () => import('../modules/placeholder/index.js')

const ROUTE_MAP = {
  [ROUTES.LOGIN]: () => import('../modules/auth/index.js'),
  [ROUTES.REGISTER]: () => import('../modules/auth/index.js'),
  [ROUTES.DASHBOARD]: () => import('../modules/dashboard/index.js'),
  [ROUTES.USERS]: () => import('../modules/users/index.js'),
  [ROUTES.POSTS]: () => import('../modules/posts/index.js'),
  [ROUTES.TIERS]: () => import('../modules/tiers/index.js'),
  [ROUTES.TASKS]: () => import('../modules/tasks/index.js'),
  [ROUTES.INVITE_LIST]: placeholder,
  [ROUTES.REPORT_LOTTERY]: placeholder,
  [ROUTES.REPORT_FUNDS]: placeholder,
  [ROUTES.REPORT_PROVIDER]: placeholder,
  [ROUTES.BANK_LIST]: placeholder,
  [ROUTES.DEPOSIT_LIST]: placeholder,
  [ROUTES.WITHDRAWAL_HISTORY]: placeholder,
  [ROUTES.BET_LIST]: placeholder,
  [ROUTES.BET_THIRD_PARTY]: placeholder,
  [ROUTES.CHANGE_LOGIN_PW]: placeholder,
  [ROUTES.CHANGE_TRADE_PW]: placeholder,
  [ROUTES.REBATE_LIST]: placeholder
}

const PUBLIC_ROUTES = new Set([ROUTES.LOGIN, ROUTES.REGISTER])

const getHash = () => location.hash || ROUTES.DASHBOARD

const guard = (hash) => {
  if (PUBLIC_ROUTES.has(hash)) return true
  return !!getToken()
}

let layoutModule = null
let currentModule = null

const ensureLayout = async () => {
  if (!layoutModule) {
    layoutModule = await import('../layout/index.js')
  }
  if (!layoutModule.isRendered()) {
    await layoutModule.render()
  }
}

const scrollToTop = () => {
  const body = document.getElementById('main-content')
  if (body) body.scrollTop = 0
  window.scrollTo(0, 0)
}

const renderNotFound = async (hash) => {
  await ensureLayout()
  const mod = await import('../modules/not-found/index.js')
  currentModule = mod
  layoutModule.getContentContainer().innerHTML = ''
  mod.render(hash)
  layoutModule.setActiveMenu(null)
}

const navigate = async (hash) => {
  hash = hash || getHash()

  if (!guard(hash)) {
    sessionStorage.setItem(INTENDED_ROUTE_KEY, hash)
    location.hash = ROUTES.LOGIN
    return
  }

  if (PUBLIC_ROUTES.has(hash) && getToken()) {
    const intended = sessionStorage.getItem(INTENDED_ROUTE_KEY)
    sessionStorage.removeItem(INTENDED_ROUTE_KEY)
    location.hash = intended || ROUTES.DASHBOARD
    return
  }

  if (currentModule?.destroy) {
    currentModule.destroy()
  }

  const loader = ROUTE_MAP[hash]

  if (!loader) {
    await renderNotFound(hash)
    scrollToTop()
    return
  }

  try {
    if (PUBLIC_ROUTES.has(hash)) {
      layoutModule = null
      document.getElementById('app').innerHTML = ''
      const mod = await loader()
      currentModule = mod
      mod.render(hash)
    } else {
      await ensureLayout()
      layoutModule.showLoading()
      const mod = await loader()
      currentModule = mod
      layoutModule.getContentContainer().innerHTML = ''
      mod.render(hash)
      layoutModule.setActiveMenu(hash)
      layoutModule.hideLoading()
    }
  } catch (err) {
    renderError(err)
  }

  scrollToTop()
}

const renderError = (err) => {
  const container = layoutModule?.getContentContainer() || document.getElementById('app')
  if (!container) return
  container.innerHTML = `
    <div class="error-boundary">
      <p class="error-boundary-title">Đã xảy ra lỗi</p>
      <p class="error-boundary-text">${err?.message || 'Không thể tải trang'}</p>
      <a href="${ROUTES.DASHBOARD}" class="layui-btn layui-btn-sm">Về trang chủ</a>
    </div>`
  layoutModule?.hideLoading?.()
}

/** Preload a route module on hover for faster navigation */
export const preloadRoute = (hash) => {
  const loader = ROUTE_MAP[hash]
  if (loader) loader()
}

export const initRouter = () => {
  window.addEventListener('hashchange', () => navigate())
  navigate()
}
