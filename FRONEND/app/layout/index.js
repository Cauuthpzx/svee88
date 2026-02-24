import { authApi } from '../api/auth.js'
import { clearToken } from '../utils/index.js'
import { initTheme, toggleTheme } from '../utils/theme.js'
import { store } from '../store/index.js'
import { ROUTES, MSG } from '../constants/index.js'
import './index.css'

const LAYOUT_ID = 'admin-layout'
const CONTENT_ID = 'main-content'

const template = () => `
  <div class="layui-layout layui-layout-admin" id="${LAYOUT_ID}">
    <div class="layui-header">
      <div class="layui-logo layui-hide-xs">Hệ thống quản lý</div>
      <ul class="layui-nav layui-layout-right">
        <li class="layui-nav-item">
          <a href="javascript:;" id="themeToggle">
            <i class="layui-icon layui-icon-moon" id="themeIcon"></i>
          </a>
        </li>
        <li class="layui-nav-item">
          <a href="javascript:;">
            <img src="/icons/avatar.png" class="layui-nav-img">
            <span id="headerUserName"></span>
          </a>
          <dl class="layui-nav-child">
            <dd><a href="javascript:;" id="logoutBtn">Đăng xuất</a></dd>
          </dl>
        </li>
      </ul>
    </div>
    <div class="hub-sidebar hub-sidebar-l" id="hubSidebarL">
      <ul class="layui-nav layui-nav-tree" lay-filter="sideNav">
        <li class="layui-nav-item">
          <a href="${ROUTES.DASHBOARD}">
            <i class="layui-icon layui-icon-home"></i> <span>Trang chủ</span>
          </a>
        </li>
        <li class="layui-nav-item layui-nav-itemed">
          <a href="javascript:;">
            <i class="layui-icon layui-icon-username"></i> <span>Sub-member Management</span>
          </a>
          <dl class="layui-nav-child">
            <dd><a href="${ROUTES.USERS}">Member List</a></dd>
          </dl>
        </li>
        <li class="layui-nav-item">
          <a href="javascript:;">
            <i class="layui-icon layui-icon-vercode"></i> <span>Invite Code</span>
          </a>
          <dl class="layui-nav-child">
            <dd><a href="javascript:;">Invite List</a></dd>
          </dl>
        </li>
        <li class="layui-nav-item">
          <a href="javascript:;">
            <i class="layui-icon layui-icon-tabs"></i> <span>Reports</span>
          </a>
          <dl class="layui-nav-child">
            <dd><a href="javascript:;">Lottery Report</a></dd>
            <dd><a href="javascript:;">Transaction Statement</a></dd>
            <dd><a href="javascript:;">Provider Report</a></dd>
          </dl>
        </li>
        <li class="layui-nav-item">
          <a href="javascript:;">
            <i class="layui-icon layui-icon-dollar"></i> <span>Commission Withdraw</span>
          </a>
          <dl class="layui-nav-child">
            <dd><a href="javascript:;">Bank List</a></dd>
            <dd><a href="javascript:;">Deposit List</a></dd>
            <dd><a href="javascript:;">Withdrawal History</a></dd>
          </dl>
        </li>
        <li class="layui-nav-item">
          <a href="javascript:;">
            <i class="layui-icon layui-icon-chart-screen"></i> <span>Bet Management</span>
          </a>
          <dl class="layui-nav-child">
            <dd><a href="javascript:;">Bet List</a></dd>
            <dd><a href="javascript:;">3rd Party Bets</a></dd>
          </dl>
        </li>
        <li class="layui-nav-item">
          <a href="javascript:;">
            <i class="layui-icon layui-icon-survey"></i> <span>Customer Info</span>
          </a>
          <dl class="layui-nav-child">
            <dd><a href="javascript:;">Change Login PW</a></dd>
            <dd><a href="javascript:;">Change Trade PW</a></dd>
          </dl>
        </li>
        <li class="layui-nav-item">
          <a href="javascript:;">
            <i class="layui-icon layui-icon-list"></i> <span>Rebate Management</span>
          </a>
          <dl class="layui-nav-child">
            <dd><a href="javascript:;">Rebate List</a></dd>
          </dl>
        </li>
      </ul>
    </div>
    <div class="layui-body" id="${CONTENT_ID}"></div>
    <div class="layui-footer">© 2024</div>
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

const loadUserInfo = async () => {
  try {
    const user = await authApi.getMe()
    store.set('user', user)
    const el = document.getElementById('headerUserName')
    if (el) el.textContent = user.name
  } catch (_) { /* handled by http interceptor */ }
}

export const isRendered = () => !!document.getElementById(LAYOUT_ID)

export const render = async () => {
  document.getElementById('app').innerHTML = template()
  layui.use('element', function () {})
  initTheme()
  document.getElementById('themeToggle')
    ?.addEventListener('click', toggleTheme)
  document.getElementById('logoutBtn')
    ?.addEventListener('click', handleLogout)
  await loadUserInfo()
}

export const getContentContainer = () => document.getElementById(CONTENT_ID)

export const setActiveMenu = () => {}
