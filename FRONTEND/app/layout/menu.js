/**
 * Sidebar menu — data-driven menu items with i18n labels.
 * @module layout/menu
 */

import { ROUTES } from '../constants/index.js'
import { t } from '../i18n/index.js'

/**
 * Get the full menu tree with translated labels.
 * @returns {Object[]} Menu item array (with optional children)
 */
export const getMenuItems = () => [
  { hash: ROUTES.DASHBOARD, icon: 'hub-icon-home', label: t('menu.home') },
  {
    icon: 'hub-icon-user', label: t('menu.members_group'),
    children: [
      { hash: ROUTES.USERS, label: t('menu.members') },
      { hash: ROUTES.INVITE_LIST, label: t('menu.invites') }
    ]
  },
  {
    icon: 'hub-icon-document', label: t('menu.reports_group'),
    children: [
      { hash: ROUTES.REPORT_LOTTERY, label: t('menu.report_lottery') },
      { hash: ROUTES.REPORT_FUNDS, label: t('menu.report_funds') },
      { hash: ROUTES.REPORT_PROVIDER, label: t('menu.report_provider') }
    ]
  },
  {
    icon: 'hub-icon-money', label: t('menu.finance_group'),
    children: [
      { hash: ROUTES.DEPOSIT_LIST, label: t('menu.deposits') },
      { hash: ROUTES.WITHDRAWAL_HISTORY, label: t('menu.withdrawals') }
    ]
  },
  {
    icon: 'hub-icon-monitor', label: t('menu.bets_group'),
    children: [
      { hash: ROUTES.BET_LIST, label: t('menu.bets') },
      { hash: ROUTES.BET_THIRD_PARTY, label: t('menu.bet_orders') }
    ]
  },
  {
    icon: 'hub-icon-menu', label: t('menu.rebate_group'),
    children: [{ hash: ROUTES.REBATE_LIST, label: t('menu.rebate') }]
  },
  {
    icon: 'hub-icon-settings', label: t('menu.settings_group'),
    children: [
      { hash: ROUTES.SETTINGS_SYSTEM, label: t('menu.settings_system') },
      { hash: ROUTES.SETTINGS_SYNC, label: t('menu.settings_sync') }
    ]
  }
]

/**
 * Render a single menu item to HTML (supports nested children).
 * @param {Object} item - Menu item with icon, label, and optional hash/children
 * @returns {string} HTML string
 */
export const renderMenuItem = (item) => {
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
