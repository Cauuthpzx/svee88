import { getToken, escapeHtml } from '../utils/index.js'
import {
  ROUTES, INTENDED_ROUTE_KEY, ROUTE_SECTIONS, TRANSITION_MS
} from '../constants/index.js'

/* ── Route map (lazy imports) ── */
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

/* ── Transition state ── */
let layoutModule = null
let currentModule = null
let currentPage = null
let prevHash = null
let isTransitioning = false
let transitionTimer = null

/* ── Transition type detection ── */
const getTransitionType = (from, to) => {
  if (!from || PUBLIC_ROUTES.has(from)) return 'fade'
  const fromSection = ROUTE_SECTIONS[from]
  const toSection = ROUTE_SECTIONS[to]
  if (fromSection === 'dashboard' || toSection === 'dashboard') return 'slide-up'
  if (fromSection === toSection) return 'fade'
  return 'curtain'
}

/* ── Force-complete pending transition (for rapid clicks) ── */
const forceComplete = () => {
  if (!isTransitioning) return
  clearTimeout(transitionTimer)
  const container = layoutModule?.getContentContainer()
  if (container) {
    const leaving = container.querySelector('.page.is-leaving')
    if (leaving) leaving.remove()
  }
  if (currentPage) {
    currentPage.className = 'page is-active'
    currentPage.style.willChange = 'auto'
  }
  isTransitioning = false
}

/* ── Dual-page transition engine ── */
const transitionTo = (container, nextPage, trType) => {
  const trClass = `tr-${trType}`
  nextPage.classList.add(trClass)

  const oldPage = currentPage
  if (oldPage) {
    oldPage.classList.remove('is-active')
    oldPage.classList.add('is-leaving', trClass)
  }

  isTransitioning = true

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      nextPage.classList.remove('is-entering')
      nextPage.classList.add('is-active')
    })
  })

  transitionTimer = setTimeout(() => {
    if (oldPage) oldPage.remove()
    removeSkeleton()
    nextPage.style.willChange = 'auto'
    isTransitioning = false
  }, TRANSITION_MS)

  currentPage = nextPage
}

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

/* ── Create a .page wrapper, mount to container, render module into it ── */
const createPage = (container, trType) => {
  const page = document.createElement('div')
  page.className = `page is-entering tr-${trType}`
  container.appendChild(page)
  return page
}

/* ── Error rendering ── */
const renderError = (err) => {
  forceComplete()
  const container = layoutModule?.getContentContainer()
    || document.getElementById('app')
  if (!container) return
  container.querySelectorAll('.page').forEach((p) => p.remove())
  const page = document.createElement('div')
  page.className = 'page is-active'
  page.innerHTML = `
    <div class="error-boundary">
      <p class="error-boundary-title">Đã xảy ra lỗi</p>
      <p class="error-boundary-text">${escapeHtml(err?.message) || 'Không thể tải trang'}</p>
      <a href="${ROUTES.DASHBOARD}" class="layui-btn layui-btn-sm">Về trang chủ</a>
    </div>`
  container.appendChild(page)
  currentPage = page
  isTransitioning = false
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

  forceComplete()

  if (currentModule?.destroy) {
    currentModule.destroy()
  }

  const loader = ROUTE_MAP[hash]

  if (!loader) {
    await ensureLayout()
    /* skeleton removed in transitionTo cleanup */
    const container = layoutModule.getContentContainer()
    const trType = getTransitionType(prevHash, hash)
    const mod = await import('../modules/not-found/index.js')
    currentModule = mod
    const nextPage = createPage(container, trType)
    mod.render(hash, nextPage)
    transitionTo(container, nextPage, trType)
    layoutModule.setActiveMenu(null)
    prevHash = hash
    return
  }

  try {
    if (PUBLIC_ROUTES.has(hash)) {
      layoutModule = null
      currentPage = null
      prevHash = null
      document.getElementById('app').innerHTML = ''
      const mod = await loader()
      currentModule = mod
      mod.render(hash)
    } else {
      await ensureLayout()
      /* skeleton removed in transitionTo cleanup */
      const container = layoutModule.getContentContainer()
      const trType = getTransitionType(prevHash, hash)
      const mod = await loader()
      currentModule = mod
      const nextPage = createPage(container, trType)
      mod.render(hash, nextPage)
      transitionTo(container, nextPage, trType)
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

export const initRouter = () => {
  window.addEventListener('hashchange', () => navigate())
  navigate()
}
