/**
 * Hash-based SPA router with lazy-loading and auth guard.
 * @module router
 */

import { getToken, escapeHtml } from '../utils/index.js'
import { ROUTES, INTENDED_ROUTE_KEY } from '../constants/index.js'
import { t } from '../i18n/index.js'

/* ── Route map (lazy imports) ── */
const placeholder = () => import('../modules/placeholder/index.js')
const dataTable = () => import('../modules/data-table/index.js')

const ROUTE_MAP = {
  [ROUTES.LOGIN]: () => import('../modules/auth/index.js'),
  [ROUTES.REGISTER]: () => import('../modules/auth/index.js'),
  [ROUTES.DASHBOARD]: () => import('../modules/dashboard/index.js'),
  [ROUTES.USERS]: dataTable,
  [ROUTES.TIERS]: () => import('../modules/tiers/index.js'),
  [ROUTES.INVITE_LIST]: dataTable,
  [ROUTES.REPORT_LOTTERY]: dataTable,
  [ROUTES.REPORT_FUNDS]: dataTable,
  [ROUTES.REPORT_PROVIDER]: dataTable,
  [ROUTES.DEPOSIT_LIST]: dataTable,
  [ROUTES.WITHDRAWAL_HISTORY]: dataTable,
  [ROUTES.BET_LIST]: dataTable,
  [ROUTES.BET_THIRD_PARTY]: dataTable,
  [ROUTES.CHANGE_LOGIN_PW]: placeholder,
  [ROUTES.CHANGE_TRADE_PW]: placeholder,
  [ROUTES.REBATE_LIST]: dataTable,
  [ROUTES.SETTINGS_SYSTEM]: placeholder,
  [ROUTES.SETTINGS_SYNC]: dataTable,
  [ROUTES.SETTINGS_ACCOUNT]: dataTable
}

const PUBLIC_ROUTES = new Set([ROUTES.LOGIN, ROUTES.REGISTER])
const getHash = () => location.hash || ROUTES.DASHBOARD

const guard = (hash) => {
  if (PUBLIC_ROUTES.has(hash)) return true
  return !!getToken()
}

let layoutModule = null
let currentModule = null
let currentPage = null
let prevHash = null

/* ── Layout helpers ── */
const ensureLayout = async () => {
  if (!layoutModule) {
    layoutModule = await import('../layout/index.js')
  }
  if (!layoutModule.isRendered()) {
    await layoutModule.render()
  }
}

const removeSkeleton = () => {
  const el = document.getElementById('routeLoading')
  if (el) el.remove()
}

/* ── Create a .page wrapper ── */
const createPage = (container) => {
  if (currentPage) currentPage.remove()
  removeSkeleton()
  const page = document.createElement('div')
  page.className = 'page page-enter'
  container.appendChild(page)
  return page
}

/* ── Error rendering ── */
const renderError = (err) => {
  const container = layoutModule?.getContentContainer()
    || document.getElementById('app')
  if (!container) return
  container.querySelectorAll('.page').forEach((p) => p.remove())
  const page = document.createElement('div')
  page.className = 'page'
  page.innerHTML = `
    <div class="error-boundary">
      <p class="error-boundary-title">${t('error.occurred')}</p>
      <p class="error-boundary-text">${escapeHtml(err?.message) || t('error.page_load_failed')}</p>
      <a href="${ROUTES.DASHBOARD}" class="layui-btn layui-btn-sm">${t('error.back_home')}</a>
    </div>`
  container.appendChild(page)
  currentPage = page
  layoutModule?.hideLoading?.()
}

/* ── Main navigate ── */
const navigate = async (hash) => {
  hash = hash || getHash()

  if (hash === prevHash) return

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
    await ensureLayout()
    const container = layoutModule.getContentContainer()
    const mod = await import('../modules/not-found/index.js')
    currentModule = mod
    const nextPage = createPage(container)
    mod.render(hash, nextPage)
    currentPage = nextPage
    layoutModule.setActiveMenu(null)
    prevHash = hash
    return
  }

  try {
    if (PUBLIC_ROUTES.has(hash)) {
      if (layoutModule?.destroy) layoutModule.destroy()
      layoutModule = null
      currentPage = null
      prevHash = null
      document.getElementById('app').innerHTML = ''
      const mod = await loader()
      currentModule = mod
      mod.render(hash)
    } else {
      await ensureLayout()
      const container = layoutModule.getContentContainer()
      const mod = await loader()
      currentModule = mod
      const nextPage = createPage(container)
      mod.render(hash, nextPage)
      currentPage = nextPage
      layoutModule.setActiveMenu(hash)
    }
  } catch (err) {
    renderError(err)
  }

  prevHash = hash
}

/** Preload a route module on hover for faster navigation */
export const preloadRoute = (hash) => {
  const loader = ROUTE_MAP[hash]
  if (loader) loader()
}

/** Initialize the hash-based SPA router and navigate to the current hash. */
export const initRouter = () => {
  window.addEventListener('hashchange', () => navigate())
  navigate()
}
