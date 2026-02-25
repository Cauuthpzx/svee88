/**
 * Admin layout — header, sidebar, clock, theme toggle, i18n, user menu.
 * @module layout
 */

import { authApi } from '../api/auth.js'
import { clearToken } from '../utils/index.js'
import { initTheme, toggleTheme } from '../utils/theme.js'
import { preloadRoute } from '../router/index.js'
import { store } from '../store/index.js'
import { ROUTES, MSG } from '../constants/index.js'
import { t, onLangChange, setLang, getLang, LANG_OPTIONS } from '../i18n/index.js'
import { startClock } from './clock.js'
import { getMenuItems, renderMenuItem } from './menu.js'
import '../icons/index.css'
import './index.css'

const LAYOUT_ID = 'admin-layout'
const CONTENT_ID = 'main-content'

const template = () => `
  <div class="layui-layout layui-layout-admin" id="${LAYOUT_ID}">
    <header class="layui-header" role="banner">
      <div class="layui-logo layui-hide-xs">
        <svg class="header-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 42" role="img" aria-label="HUB SYSTEM">
          <defs>
            <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#ff4060"/>
              <stop offset="50%" stop-color="#ff8020"/>
              <stop offset="100%" stop-color="#ffcc00"/>
            </linearGradient>
          </defs>
          <g stroke="url(#logoGrad)" stroke-width="1.6" stroke-linecap="round" fill="none">
            <line x1="18" y1="21" x2="30" y2="21"/><line x1="18" y1="21" x2="24" y2="10.6"/>
            <line x1="18" y1="21" x2="12" y2="10.6"/><line x1="18" y1="21" x2="6" y2="21"/>
            <line x1="18" y1="21" x2="12" y2="31.4"/><line x1="18" y1="21" x2="24" y2="31.4"/>
          </g>
          <g stroke="url(#logoGrad)" stroke-width="0.6" stroke-linecap="round" fill="none" opacity="0.35">
            <line x1="30" y1="21" x2="24" y2="10.6"/><line x1="24" y1="10.6" x2="12" y2="10.6"/>
            <line x1="12" y1="10.6" x2="6" y2="21"/><line x1="6" y1="21" x2="12" y2="31.4"/>
            <line x1="12" y1="31.4" x2="24" y2="31.4"/><line x1="24" y1="31.4" x2="30" y2="21"/>
          </g>
          <g fill="url(#logoGrad)">
            <circle cx="30" cy="21" r="2.4"/><circle cx="24" cy="10.6" r="2.4"/>
            <circle cx="12" cy="10.6" r="2.4"/><circle cx="6" cy="21" r="2.4"/>
            <circle cx="12" cy="31.4" r="2.4"/><circle cx="24" cy="31.4" r="2.4"/>
          </g>
          <circle cx="18" cy="21" r="4.2" fill="url(#logoGrad)"/>
          <circle cx="18" cy="21" r="1.6" fill="#fff" opacity="0.92"/>
          <text class="logo-outline" x="118" y="21" text-anchor="middle" dominant-baseline="middle"
            font-family="'Arial Black','Impact',sans-serif" font-size="20" font-weight="900"
            letter-spacing="1" fill="none" stroke-width="2.5" stroke-linejoin="round">HUB SYSTEM</text>
          <text class="logo-fill" x="118" y="21" text-anchor="middle" dominant-baseline="middle"
            font-family="'Arial Black','Impact',sans-serif" font-size="20" font-weight="900"
            letter-spacing="1" fill="url(#logoGrad)" stroke-width="0.3"
            paint-order="stroke fill">HUB SYSTEM</text>
        </svg>
        <div id="header-clock" role="timer" aria-label="Current time">
          <span id="clock-display" aria-live="off"></span>
          <span id="clock-date"></span>
        </div>
      </div>
      <ul class="layui-nav layui-layout-right" role="toolbar">
        <li class="layui-nav-item">
          <a href="javascript:;" id="toolsNavBtn" lay-tips="${t('header.tools')}" lay-direction="3" aria-label="${t('header.tools')}" role="button">
            <i class="hub-icon hub-icon-gear"></i>
          </a>
          <dl class="layui-nav-child">
            <dd><a href="${ROUTES.CHANGE_LOGIN_PW}" data-hash="${ROUTES.CHANGE_LOGIN_PW}">${t('header.tools.change_login_pw')}</a></dd>
            <dd><a href="${ROUTES.CHANGE_TRADE_PW}" data-hash="${ROUTES.CHANGE_TRADE_PW}">${t('header.tools.change_trade_pw')}</a></dd>
            <dd><a href="${ROUTES.TIERS}" data-hash="${ROUTES.TIERS}">${t('header.tools.tiers')}</a></dd>
          </dl>
        </li>
        <li class="layui-nav-item">
          <a href="javascript:;" id="supportNavBtn" lay-tips="${t('header.support')}" lay-direction="3" aria-label="${t('header.support')}" role="button">
            <i class="hub-icon hub-icon-flag"></i>
          </a>
          <dl class="layui-nav-child">
            <dd><a href="${ROUTES.INVITE_LIST}" data-hash="${ROUTES.INVITE_LIST}">${t('header.support.invites')}</a></dd>
            <dd><a href="${ROUTES.SETTINGS_SYSTEM}" data-hash="${ROUTES.SETTINGS_SYSTEM}">${t('header.support.settings')}</a></dd>
          </dl>
        </li>
        <li class="layui-nav-item" id="i18nDropdown">
          <a href="javascript:;" aria-label="${t('header.language')}" role="button">
            <i class="hub-icon hub-icon-globe"></i>
          </a>
          <dl class="layui-nav-child">
            ${LANG_OPTIONS.map(opt => `<dd class="${opt.code === getLang() ? 'layui-this' : ''}"><a href="javascript:;" data-lang="${opt.code}">${opt.label}</a></dd>`).join('')}
          </dl>
        </li>
        <li class="layui-nav-item">
          <a href="javascript:;" id="themeToggle" lay-tips="${t('header.theme')}" lay-direction="3" aria-label="${t('header.theme_aria')}" role="button">
            <i class="hub-icon hub-icon-moon" id="themeIcon"></i>
          </a>
        </li>
        <li class="layui-nav-item">
          <a href="javascript:;" id="notifyBtn" lay-tips="${t('header.notifications')}" lay-direction="3" aria-label="${t('header.notifications')}" role="button">
            <i class="hub-icon hub-icon-bell"></i>
          </a>
        </li>
        <li class="layui-nav-item">
          <a href="javascript:;">
            <img src="/icons/avatar.svg" class="layui-nav-img" alt="Avatar">
            <span id="headerUserName"></span>
          </a>
          <dl class="layui-nav-child">
            <dd><a href="javascript:;" id="logoutBtn" role="button">${t('header.logout')}</a></dd>
          </dl>
        </li>
      </ul>
    </header>
    <nav class="hub-sidebar hub-sidebar-l" id="hubSidebarL" role="navigation" aria-label="${t('header.main_menu')}">
      <ul class="layui-nav layui-nav-tree" lay-filter="sideNav">
        ${getMenuItems().map(renderMenuItem).join('')}
      </ul>
    </nav>
    <main class="layui-body" id="${CONTENT_ID}" role="main">
      <div class="skeleton-loading" id="routeLoading" aria-label="${t('header.loading')}">
        <div class="skeleton-card">
          <div class="skeleton-line skeleton-title"></div>
          <div class="skeleton-line skeleton-text"></div>
          <div class="skeleton-line skeleton-text short"></div>
        </div>
      </div>
    </main>
  </div>
`

const handleLogout = () => {
  layui.use('layer', function (layer) {
    layer.confirm(t('header.logout_confirm'), { icon: 3 }, async (idx) => {
      try { await authApi.logout() } catch (e) { console.warn('[layout] logout error:', e.message) }
      clearToken()
      store.set('user', null)
      layer.close(idx)
      layer.msg(MSG.LOGOUT_SUCCESS, { icon: 1 })
      location.hash = ROUTES.LOGIN
    })
  })
}

const setHeaderName = (user) => {
  const el = document.getElementById('headerUserName')
  if (el && user) el.textContent = user.name || user.username || ''
}

const loadUserInfo = async () => {
  const cached = store.get('user')
  if (cached) {
    setHeaderName(cached)
    return
  }
  try {
    const user = await authApi.getMe()
    store.set('user', user)
    setHeaderName(user)
  } catch (e) { console.warn('[layout] user info error:', e.message) }
}

let clockHandle = null
let tipsMouseOver = null
let tipsMouseOut = null

/** @returns {boolean} Whether the admin layout is currently in the DOM */
export const isRendered = () => !!document.getElementById(LAYOUT_ID)

const handleSidebarHover = (e) => {
  const link = e.target.closest('a[data-hash]')
  if (link) preloadRoute(link.dataset.hash)
}

const initTips = () => {
  layui.use('layer', function (layer) {
    let activeEl = null
    let closeTimer = null

    tipsMouseOver = (e) => {
      const el = e.target.closest('[lay-tips]')
      if (el) {
        clearTimeout(closeTimer)
        if (el === activeEl) return
        activeEl = el
        const text = el.getAttribute('lay-tips')
        const dir = parseInt(el.getAttribute('lay-direction'), 10) || 1
        layer.tips(text, el, { tips: dir, time: 0 })
      }
    }

    tipsMouseOut = (e) => {
      const el = e.target.closest('[lay-tips]')
      if (!el) return
      const to = e.relatedTarget
      if (to && el.contains(to)) return
      closeTimer = setTimeout(() => {
        layer.closeAll('tips')
        activeEl = null
      }, 80)
    }

    document.addEventListener('mouseover', tipsMouseOver)
    document.addEventListener('mouseout', tipsMouseOut)
  })
}

const initI18nDropdown = () => {
  const dropdown = document.getElementById('i18nDropdown')
  if (!dropdown) return
  dropdown.addEventListener('click', (e) => {
    const link = e.target.closest('a[data-lang]')
    if (!link) return
    setLang(link.dataset.lang)
  })
}

const updateLayoutTexts = () => {
  // Update sidebar menu labels
  const sidebar = document.getElementById('hubSidebarL')
  if (sidebar) {
    const navUl = sidebar.querySelector('.layui-nav')
    if (navUl) {
      navUl.innerHTML = getMenuItems().map(renderMenuItem).join('')
      layui.use('element', function (element) { element.render('nav', 'sideNav') })
      // Restore active menu state
      const hash = location.hash || ROUTES.DASHBOARD
      setActiveMenu(hash)
    }
    sidebar.setAttribute('aria-label', t('header.main_menu'))
  }

  // Update i18n dropdown active state
  const dropdown = document.getElementById('i18nDropdown')
  if (dropdown) {
    const lang = getLang()
    dropdown.querySelectorAll('dd').forEach((dd) => {
      const a = dd.querySelector('a[data-lang]')
      if (a) dd.classList.toggle('layui-this', a.dataset.lang === lang)
    })
  }

  // Update header tooltips and labels
  const themeToggle = document.getElementById('themeToggle')
  if (themeToggle) {
    themeToggle.setAttribute('lay-tips', t('header.theme'))
    themeToggle.setAttribute('aria-label', t('header.theme_aria'))
  }
  const notifyBtn = document.getElementById('notifyBtn')
  if (notifyBtn) {
    notifyBtn.setAttribute('lay-tips', t('header.notifications'))
    notifyBtn.setAttribute('aria-label', t('header.notifications'))
  }
  const logoutBtn = document.getElementById('logoutBtn')
  if (logoutBtn) logoutBtn.textContent = t('header.logout')
  // Update header nav tooltips
  document.getElementById('toolsNavBtn')
    ?.setAttribute('lay-tips', t('header.tools'))
  document.getElementById('supportNavBtn')
    ?.setAttribute('lay-tips', t('header.support'))
}

let unsubLang = null

/** Render the admin layout — header, sidebar, clock, theme, user info. */
export const render = async () => {
  document.getElementById('app').innerHTML = template()
  layui.use('element', function (element) { element.render('nav') })
  initTheme()
  initTips()
  initI18nDropdown()
  document.getElementById('themeToggle')
    ?.addEventListener('click', toggleTheme)
  document.getElementById('logoutBtn')
    ?.addEventListener('click', handleLogout)
  document.getElementById('hubSidebarL')
    ?.addEventListener('mouseenter', handleSidebarHover, true)
  clockHandle = startClock()
  await loadUserInfo()
  unsubLang = onLangChange(updateLayoutTexts)
}

/** @returns {HTMLElement|null} The main content container for page rendering */
export const getContentContainer = () => document.getElementById(CONTENT_ID)

/** Show the skeleton loading indicator. */
export const showLoading = () => {
  const el = document.getElementById('routeLoading')
  if (el) el.style.display = ''
}

/** Hide the skeleton loading indicator. */
export const hideLoading = () => {
  const el = document.getElementById('routeLoading')
  if (el) el.style.display = 'none'
}

/** Remove skeleton permanently (called once by router after first page mounts) */
export const removeSkeleton = () => {
  const el = document.getElementById('routeLoading')
  if (el) el.remove()
}

/**
 * Highlight the sidebar menu item matching the given hash.
 * @param {string} hash - Route hash (e.g. '#/users')
 */
export const setActiveMenu = (hash) => {
  const sidebar = document.getElementById('hubSidebarL')
  if (!sidebar) return

  sidebar.querySelectorAll('.layui-this').forEach((el) => {
    el.classList.remove('layui-this')
  })

  const link = sidebar.querySelector(`a[data-hash="${hash}"]`)
  if (!link) return

  const dd = link.closest('dd')
  if (dd) {
    dd.classList.add('layui-this')
    const parentLi = dd.closest('.layui-nav-item')
    if (parentLi) parentLi.classList.add('layui-nav-itemed')
  } else {
    const li = link.closest('.layui-nav-item')
    if (li) li.classList.add('layui-this')
  }
}

/** Clean up layout resources — clock, event listeners, i18n subscription. */
export const destroy = () => {
  if (clockHandle) {
    clockHandle.stop()
    clockHandle = null
  }
  if (unsubLang) {
    unsubLang()
    unsubLang = null
  }
  if (tipsMouseOver) {
    document.removeEventListener('mouseover', tipsMouseOver)
    tipsMouseOver = null
  }
  if (tipsMouseOut) {
    document.removeEventListener('mouseout', tipsMouseOut)
    tipsMouseOut = null
  }
  const sidebar = document.getElementById('hubSidebarL')
  if (sidebar) sidebar.removeEventListener('mouseenter', handleSidebarHover, true)
  document.getElementById('themeToggle')?.removeEventListener('click', toggleTheme)
  document.getElementById('logoutBtn')?.removeEventListener('click', handleLogout)
}
