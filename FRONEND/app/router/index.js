import { getToken } from '../utils/index.js'
import { ROUTES } from '../constants/index.js'

const ROUTE_MAP = {
  [ROUTES.LOGIN]: () => import('../modules/auth/index.js'),
  [ROUTES.REGISTER]: () => import('../modules/auth/index.js'),
  [ROUTES.DASHBOARD]: () => import('../modules/dashboard/index.js')
}

const PUBLIC_ROUTES = new Set([ROUTES.LOGIN, ROUTES.REGISTER])

const getHash = () => location.hash || ROUTES.DASHBOARD

const guard = (hash) => {
  if (PUBLIC_ROUTES.has(hash)) return true
  return !!getToken()
}

const navigate = async (hash) => {
  hash = hash || getHash()

  if (!guard(hash)) {
    location.hash = ROUTES.LOGIN
    return
  }

  if (PUBLIC_ROUTES.has(hash) && getToken()) {
    location.hash = ROUTES.DASHBOARD
    return
  }

  const loader = ROUTE_MAP[hash]
  if (!loader) {
    location.hash = ROUTES.DASHBOARD
    return
  }

  const container = document.getElementById('app')
  container.innerHTML = ''

  const mod = await loader()
  const mode = hash === ROUTES.REGISTER ? 'register' : 'login'
  mod.render(mode)
}

const initRouter = () => {
  window.addEventListener('hashchange', () => navigate())
  navigate()
}

export { navigate, initRouter }
