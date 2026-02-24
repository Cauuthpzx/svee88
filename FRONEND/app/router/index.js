import { getToken } from '../utils/index.js'
import { ROUTES } from '../constants/index.js'

const ROUTE_MAP = {
  [ROUTES.LOGIN]: () => import('../modules/auth/index.js'),
  [ROUTES.REGISTER]: () => import('../modules/auth/index.js'),
  [ROUTES.DASHBOARD]: () => import('../modules/dashboard/index.js'),
  [ROUTES.USERS]: () => import('../modules/users/index.js'),
  [ROUTES.POSTS]: () => import('../modules/posts/index.js'),
  [ROUTES.TIERS]: () => import('../modules/tiers/index.js'),
  [ROUTES.TASKS]: () => import('../modules/tasks/index.js')
}

const PUBLIC_ROUTES = new Set([ROUTES.LOGIN, ROUTES.REGISTER])

const getHash = () => location.hash || ROUTES.DASHBOARD

const guard = (hash) => {
  if (PUBLIC_ROUTES.has(hash)) return true
  return !!getToken()
}

let layoutModule = null

const ensureLayout = async () => {
  if (!layoutModule) {
    layoutModule = await import('../layout/index.js')
  }
  if (!layoutModule.isRendered()) {
    await layoutModule.render()
  }
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

  const mod = await loader()

  if (PUBLIC_ROUTES.has(hash)) {
    layoutModule = null
    document.getElementById('app').innerHTML = ''
    mod.render(hash)
  } else {
    await ensureLayout()
    layoutModule.getContentContainer().innerHTML = ''
    mod.render()
    layoutModule.setActiveMenu(hash)
  }
}

export const initRouter = () => {
  window.addEventListener('hashchange', () => navigate())
  navigate()
}
