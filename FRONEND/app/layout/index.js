import { authApi } from '../api/auth.js'
import { clearToken } from '../utils/index.js'
import { initTheme, toggleTheme } from '../utils/theme.js'
import { preloadRoute } from '../router/index.js'
import { store } from '../store/index.js'
import { ROUTES, MSG } from '../constants/index.js'
import './index.css'

const LAYOUT_ID = 'admin-layout'
const CONTENT_ID = 'main-content'

const MENU_ITEMS = [
  { hash: ROUTES.DASHBOARD, icon: 'layui-icon-home', label: 'Trang chủ' },
  {
    icon: 'layui-icon-username', label: 'Sub-member Management',
    children: [
      { hash: ROUTES.USERS, label: 'Member List' },
      { hash: ROUTES.INVITE_LIST, label: 'Invite List' }
    ]
  },
  {
    icon: 'layui-icon-tabs', label: 'Reports',
    children: [
      { hash: ROUTES.REPORT_LOTTERY, label: 'Lottery Report' },
      { hash: ROUTES.REPORT_FUNDS, label: 'Transaction Statement' },
      { hash: ROUTES.REPORT_PROVIDER, label: 'Provider Report' }
    ]
  },
  {
    icon: 'layui-icon-dollar', label: 'Commission Withdraw',
    children: [
      { hash: ROUTES.BANK_LIST, label: 'Bank List' },
      { hash: ROUTES.DEPOSIT_LIST, label: 'Deposit List' },
      { hash: ROUTES.WITHDRAWAL_HISTORY, label: 'Withdrawal History' }
    ]
  },
  {
    icon: 'layui-icon-chart-screen', label: 'Bet Management',
    children: [
      { hash: ROUTES.BET_LIST, label: 'Bet List' },
      { hash: ROUTES.BET_THIRD_PARTY, label: '3rd Party Bets' }
    ]
  },
  {
    icon: 'layui-icon-survey', label: 'Customer Info',
    children: [
      { hash: ROUTES.CHANGE_LOGIN_PW, label: 'Change Login PW' },
      { hash: ROUTES.CHANGE_TRADE_PW, label: 'Change Trade PW' }
    ]
  },
  {
    icon: 'layui-icon-list', label: 'Rebate Management',
    children: [{ hash: ROUTES.REBATE_LIST, label: 'Rebate List' }]
  }
]

const renderMenuItem = (item) => {
  if (item.children) {
    const childHtml = item.children.map((c) => {
      const href = c.hash || 'javascript:;'
      const dataHash = c.hash ? ` data-hash="${c.hash}"` : ''
      return `<dd><a href="${href}"${dataHash}>${c.label}</a></dd>`
    }).join('')
    return `
      <li class="layui-nav-item">
        <a href="javascript:;">
          <i class="layui-icon ${item.icon}"></i> <span>${item.label}</span>
        </a>
        <dl class="layui-nav-child">${childHtml}</dl>
      </li>`
  }
  return `
    <li class="layui-nav-item">
      <a href="${item.hash}" data-hash="${item.hash}">
        <i class="layui-icon ${item.icon}"></i> <span>${item.label}</span>
      </a>
    </li>`
}

const template = () => `
  <div class="layui-layout layui-layout-admin" id="${LAYOUT_ID}">
    <header class="layui-header" role="banner">
      <div class="layui-logo layui-hide-xs">Hệ thống quản lý</div>
      <ul class="layui-nav layui-layout-right" role="toolbar">
        <li class="layui-nav-item">
          <a href="javascript:;" id="themeToggle" aria-label="Chuyển đổi giao diện sáng/tối" role="button">
            <i class="layui-icon layui-icon-moon" id="themeIcon"></i>
          </a>
        </li>
        <li class="layui-nav-item">
          <a href="javascript:;">
            <img src="/icons/avatar.png" class="layui-nav-img" alt="Avatar">
            <span id="headerUserName"></span>
          </a>
          <dl class="layui-nav-child">
            <dd><a href="javascript:;" id="logoutBtn" role="button">Đăng xuất</a></dd>
          </dl>
        </li>
      </ul>
    </header>
    <nav class="hub-sidebar hub-sidebar-l" id="hubSidebarL" role="navigation" aria-label="Menu chính">
      <ul class="layui-nav layui-nav-tree" lay-filter="sideNav">
        ${MENU_ITEMS.map(renderMenuItem).join('')}
      </ul>
    </nav>
    <main class="layui-body" id="${CONTENT_ID}" role="main">
      <div class="skeleton-loading" id="routeLoading" aria-label="Đang tải">
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
    layer.confirm('Bạn muốn đăng xuất?', { icon: 3 }, async (idx) => {
      try { await authApi.logout() } catch (_) { /* noop */ }
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
  } catch (err) {
    console.warn('[layout] loadUserInfo failed:', err?.message || err)
  }
}

export const isRendered = () => !!document.getElementById(LAYOUT_ID)

const handleSidebarHover = (e) => {
  const link = e.target.closest('a[data-hash]')
  if (link) preloadRoute(link.dataset.hash)
}

export const render = async () => {
  document.getElementById('app').innerHTML = template()
  layui.use('element', function (element) { element.render('nav') })
  initTheme()
  document.getElementById('themeToggle')
    ?.addEventListener('click', toggleTheme)
  document.getElementById('logoutBtn')
    ?.addEventListener('click', handleLogout)
  document.getElementById('hubSidebarL')
    ?.addEventListener('mouseenter', handleSidebarHover, true)
  await loadUserInfo()
}

export const getContentContainer = () => document.getElementById(CONTENT_ID)

export const showLoading = () => {
  const el = document.getElementById('routeLoading')
  if (el) el.style.display = ''
}

export const hideLoading = () => {
  const el = document.getElementById('routeLoading')
  if (el) el.style.display = 'none'
}

/** Remove skeleton permanently (called once by router after first page mounts) */
export const removeSkeleton = () => {
  const el = document.getElementById('routeLoading')
  if (el) el.remove()
}

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
