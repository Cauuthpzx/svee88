import { authApi } from '../api/auth.js'
import { clearToken } from '../utils/index.js'
import { initTheme, toggleTheme } from '../utils/theme.js'
import { preloadRoute } from '../router/index.js'
import { store } from '../store/index.js'
import { ROUTES, MSG } from '../constants/index.js'
import '../icons/index.css'
import './index.css'

const LAYOUT_ID = 'admin-layout'
const CONTENT_ID = 'main-content'

const MENU_ITEMS = [
  { hash: ROUTES.DASHBOARD, icon: 'hub-icon-home', label: 'Trang chủ' },
  {
    icon: 'hub-icon-user', label: 'Quản lý hạ cấp',
    children: [
      { hash: ROUTES.USERS, label: 'Danh sách hội viên' },
      { hash: ROUTES.INVITE_LIST, label: 'Mã giới thiệu' }
    ]
  },
  {
    icon: 'hub-icon-document', label: 'Báo cáo',
    children: [
      { hash: ROUTES.REPORT_LOTTERY, label: 'Báo cáo xổ số' },
      { hash: ROUTES.REPORT_FUNDS, label: 'Báo cáo tài chính' },
      { hash: ROUTES.REPORT_PROVIDER, label: 'Báo cáo nhà cung cấp' }
    ]
  },
  {
    icon: 'hub-icon-money', label: 'Rút hoa hồng',
    children: [
      { hash: ROUTES.DEPOSIT_LIST, label: 'Nạp / Rút tiền' },
      { hash: ROUTES.WITHDRAWAL_HISTORY, label: 'Lịch sử rút tiền' }
    ]
  },
  {
    icon: 'hub-icon-monitor', label: 'Quản lý cược',
    children: [
      { hash: ROUTES.BET_LIST, label: 'Cược xổ số' },
      { hash: ROUTES.BET_THIRD_PARTY, label: 'Cược bên thứ 3' }
    ]
  },
  {
    icon: 'hub-icon-menu', label: 'Quản lý hoàn trả',
    children: [{ hash: ROUTES.REBATE_LIST, label: 'Tỷ lệ hoàn trả' }]
  },
  {
    icon: 'hub-icon-settings', label: 'Cài đặt',
    children: [
      { hash: ROUTES.SETTINGS_SYSTEM, label: 'Hệ thống' },
      { hash: ROUTES.SETTINGS_SYNC, label: 'Đồng bộ & Tài khoản' }
    ]
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
          <i class="hub-icon ${item.icon}"></i> <span>${item.label}</span>
        </a>
        <dl class="layui-nav-child">${childHtml}</dl>
      </li>`
  }
  return `
    <li class="layui-nav-item">
      <a href="${item.hash}" data-hash="${item.hash}">
        <i class="hub-icon ${item.icon}"></i> <span>${item.label}</span>
      </a>
    </li>`
}

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
          <a href="javascript:;" id="i18nToggle" lay-tips="Ngôn ngữ" lay-direction="3" aria-label="Ngôn ngữ" role="button">
            <i class="hub-icon hub-icon-globe"></i>
          </a>
        </li>
        <li class="layui-nav-item">
          <a href="javascript:;" id="themeToggle" lay-tips="Giao diện sáng/tối" lay-direction="3" aria-label="Chuyển đổi giao diện sáng/tối" role="button">
            <i class="hub-icon hub-icon-moon" id="themeIcon"></i>
          </a>
        </li>
        <li class="layui-nav-item">
          <a href="javascript:;" id="notifyBtn" lay-tips="Thông báo" lay-direction="3" aria-label="Thông báo" role="button">
            <i class="hub-icon hub-icon-bell"></i>
          </a>
        </li>
        <li class="layui-nav-item">
          <a href="javascript:;">
            <img src="/icons/avatar.svg" class="layui-nav-img" alt="Avatar">
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
  } catch (_) { /* handled by global error handler */ }
}

let clockTimer = null
const pad = (n) => String(n).padStart(2, '0')
const updateClock = () => {
  const now = new Date()
  const h = now.getHours()
  const h12 = h % 12 || 12
  const ampm = h < 12 ? 'AM' : 'PM'
  const time = `${pad(h12)}:${pad(now.getMinutes())}:${pad(now.getSeconds())}  ${ampm}`
  const date = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`
  const timeEl = document.getElementById('clock-display')
  const dateEl = document.getElementById('clock-date')
  if (timeEl) timeEl.textContent = time
  if (dateEl) dateEl.textContent = date
}
const startClock = () => {
  updateClock()
  clockTimer = setInterval(updateClock, 1000)
}

export const isRendered = () => !!document.getElementById(LAYOUT_ID)

const handleSidebarHover = (e) => {
  const link = e.target.closest('a[data-hash]')
  if (link) preloadRoute(link.dataset.hash)
}

const initTips = () => {
  layui.use('layer', function (layer) {
    let activeEl = null
    let closeTimer = null

    document.addEventListener('mouseover', (e) => {
      const el = e.target.closest('[lay-tips]')
      if (el) {
        clearTimeout(closeTimer)
        if (el === activeEl) return
        activeEl = el
        const text = el.getAttribute('lay-tips')
        const dir = parseInt(el.getAttribute('lay-direction'), 10) || 1
        layer.tips(text, el, { tips: dir, time: 0 })
      }
    })

    document.addEventListener('mouseout', (e) => {
      const el = e.target.closest('[lay-tips]')
      if (!el) return
      const to = e.relatedTarget
      if (to && el.contains(to)) return
      closeTimer = setTimeout(() => {
        layer.closeAll('tips')
        activeEl = null
      }, 80)
    })
  })
}

export const render = async () => {
  document.getElementById('app').innerHTML = template()
  layui.use('element', function (element) { element.render('nav') })
  initTheme()
  initTips()
  document.getElementById('themeToggle')
    ?.addEventListener('click', toggleTheme)
  document.getElementById('logoutBtn')
    ?.addEventListener('click', handleLogout)
  document.getElementById('hubSidebarL')
    ?.addEventListener('mouseenter', handleSidebarHover, true)
  startClock()
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
