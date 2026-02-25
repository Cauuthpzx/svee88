/**
 * Data Table — Column configs, search fields, endpoint metadata.
 * Factory functions call t() at render time for i18n support.
 */

import { t } from '../../i18n/index.js'
import { escapeHtml } from '../../utils/index.js'
import { LOTTERY_OPTIONS, PLATFORM_OPTIONS } from './options.js'

/** Agent column — prepended to all endpoint configs */
const agentCol = () => ({ field: '_agent_name', title: t('col.agent') })

/** Column configs — field names match upstream exactly */
export function getEndpointCols(endpoint) {
  const cols = {
    members: [
      agentCol(),
      { field: 'username', title: t('col.members.username') },
      { field: 'type_format', title: t('col.members.type_format') },
      { field: 'parent_user', title: t('col.members.parent_user') },
      { field: 'money', title: t('col.members.money') },
      { field: 'deposit_count', title: t('col.members.deposit_count') },
      { field: 'withdrawal_count', title: t('col.members.withdrawal_count') },
      { field: 'deposit_amount', title: t('col.members.deposit_amount') },
      { field: 'withdrawal_amount', title: t('col.members.withdrawal_amount') },
      { field: 'login_time', title: t('col.members.login_time') },
      { field: 'register_time', title: t('col.members.register_time') },
      { field: 'status_format', title: t('col.members.status_format') }
    ],
    invites: [
      agentCol(),
      { field: 'invite_code', title: t('col.invites.invite_code') },
      { field: 'user_type', title: t('col.invites.user_type') },
      { field: 'reg_count', title: t('col.invites.reg_count') },
      { field: 'scope_reg_count', title: t('col.invites.scope_reg_count') },
      { field: 'recharge_count', title: t('col.invites.recharge_count') },
      { field: 'first_recharge_count', title: t('col.invites.first_recharge_count') },
      { field: 'register_recharge_count', title: t('col.invites.register_recharge_count') },
      { field: 'remark', title: t('col.invites.remark') },
      { field: 'create_time', title: t('col.invites.create_time') },
      { field: 'operate', title: t('col.invites.operate'), minWidth: 280, templet: (d) => {
        const code = escapeHtml(d.invite_code || '')
        const id = escapeHtml(String(d.id || ''))
        const base = escapeHtml((d._agent_base_url || '').replace(/\/+$/, ''))
        return `<div class="invite-actions">
          <button class="layui-btn layui-btn-xs invite-copy-btn" data-code="${code}" data-base="${base}">${t('btn.copy_link')}</button>
          <button class="layui-btn layui-btn-xs layui-btn-normal invite-setting-btn" data-id="${id}" data-base="${base}">${t('btn.view_settings')}</button>
          <button class="layui-btn layui-btn-xs layui-btn-warm invite-qr-btn" data-id="${id}" data-base="${base}">${t('btn.qr_code')}</button>
        </div>`
      }}
    ],
    bets: [
      agentCol(),
      { field: 'serial_no', title: t('col.bets.serial_no') },
      { field: 'username', title: t('col.bets.username') },
      { field: 'create_time', title: t('col.bets.create_time') },
      { field: 'lottery_name', title: t('col.bets.lottery_name') },
      { field: 'play_type_name', title: t('col.bets.play_type_name') },
      { field: 'play_name', title: t('col.bets.play_name') },
      { field: 'issue', title: t('col.bets.issue') },
      { field: 'content', title: t('col.bets.content') },
      { field: 'money', title: t('col.bets.money') },
      { field: 'rebate_amount', title: t('col.bets.rebate_amount') },
      { field: 'result', title: t('col.bets.result') },
      { field: 'status_text', title: t('col.bets.status_text') }
    ],
    'bet-orders': [
      agentCol(),
      { field: 'serial_no', title: t('col.bet_orders.serial_no') },
      { field: 'platform_id_name', title: t('col.bet_orders.platform_id_name') },
      { field: 'platform_username', title: t('col.bet_orders.platform_username') },
      { field: 'c_name', title: t('col.bet_orders.c_name') },
      { field: 'game_name', title: t('col.bet_orders.game_name') },
      { field: 'bet_amount', title: t('col.bet_orders.bet_amount') },
      { field: 'turnover', title: t('col.bet_orders.turnover') },
      { field: 'prize', title: t('col.bet_orders.prize') },
      { field: 'win_lose', title: t('col.bet_orders.win_lose') },
      { field: 'bet_time', title: t('col.bet_orders.bet_time') }
    ],
    'report-lottery': [
      agentCol(),
      { field: 'username', title: t('col.report_lottery.username') },
      { field: 'user_parent_format', title: t('col.report_lottery.user_parent_format') },
      { field: 'bet_count', title: t('col.report_lottery.bet_count') },
      { field: 'bet_amount', title: t('col.report_lottery.bet_amount') },
      { field: 'valid_amount', title: t('col.report_lottery.valid_amount') },
      { field: 'rebate_amount', title: t('col.report_lottery.rebate_amount') },
      { field: 'result', title: t('col.report_lottery.result') },
      { field: 'win_lose', title: t('col.report_lottery.win_lose') },
      { field: 'prize', title: t('col.report_lottery.prize') },
      { field: 'lottery_name', title: t('col.report_lottery.lottery_name') }
    ],
    'report-funds': [
      agentCol(),
      { field: 'username', title: t('col.report_funds.username') },
      { field: 'user_parent_format', title: t('col.report_funds.user_parent_format') },
      { field: 'deposit_count', title: t('col.report_funds.deposit_count') },
      { field: 'deposit_amount', title: t('col.report_funds.deposit_amount'), sort: true },
      { field: 'withdrawal_count', title: t('col.report_funds.withdrawal_count') },
      { field: 'withdrawal_amount', title: t('col.report_funds.withdrawal_amount') },
      { field: 'charge_fee', title: t('col.report_funds.charge_fee') },
      { field: 'agent_commission', title: t('col.report_funds.agent_commission') },
      { field: 'promotion', title: t('col.report_funds.promotion') },
      { field: 'third_rebate', title: t('col.report_funds.third_rebate') },
      { field: 'third_activity_amount', title: t('col.report_funds.third_activity_amount') },
      { field: 'date', title: t('col.report_funds.date') }
    ],
    'report-third': [
      agentCol(),
      { field: 'username', title: t('col.report_third.username') },
      { field: 'platform_id_name', title: t('col.report_third.platform_id_name') },
      { field: 't_bet_times', title: t('col.report_third.t_bet_times') },
      { field: 't_bet_amount', title: t('col.report_third.t_bet_amount') },
      { field: 't_turnover', title: t('col.report_third.t_turnover') },
      { field: 't_prize', title: t('col.report_third.t_prize') },
      { field: 't_win_lose', title: t('col.report_third.t_win_lose') }
    ],
    deposits: [
      agentCol(),
      { field: 'username', title: t('col.deposits.username') },
      { field: 'user_parent_format', title: t('col.deposits.user_parent_format') },
      { field: 'amount', title: t('col.deposits.amount') },
      { field: 'type', title: t('col.deposits.type') },
      { field: 'status', title: t('col.deposits.status') },
      { field: 'create_time', title: t('col.deposits.create_time') }
    ],
    withdrawals: [
      agentCol(),
      { field: 'serial_no', title: t('col.withdrawals.serial_no') },
      { field: 'create_time', title: t('col.withdrawals.create_time') },
      { field: 'username', title: t('col.withdrawals.username') },
      { field: 'user_parent_format', title: t('col.withdrawals.user_parent_format') },
      { field: 'amount', title: t('col.withdrawals.amount') },
      { field: 'user_fee', title: t('col.withdrawals.user_fee') },
      { field: 'true_amount', title: t('col.withdrawals.true_amount') },
      { field: 'status_format', title: t('col.withdrawals.status_format') }
    ],
    rebate: [
      { field: 'odds_11', title: t('col.rebate.play_type'), minWidth: 160 },
      { field: 'odds_10', title: t('col.rebate.rebate_10') },
      { field: 'odds_9', title: t('col.rebate.rebate_9') },
      { field: 'odds_8', title: t('col.rebate.rebate_8') },
      { field: 'odds_7', title: t('col.rebate.rebate_7') },
      { field: 'odds_6', title: t('col.rebate.rebate_6') },
      { field: 'odds_5', title: t('col.rebate.rebate_5') },
      { field: 'odds_4', title: t('col.rebate.rebate_4') },
      { field: 'odds_3', title: t('col.rebate.rebate_3') },
      { field: 'odds_2', title: t('col.rebate.rebate_2') },
      { field: 'odds_1', title: t('col.rebate.rebate_1') }
    ]
  }
  return cols[endpoint]
}

export function getEndpointNames(endpoint) {
  const names = {
    members: t('endpoint.members'),
    invites: t('endpoint.invites'),
    bets: t('endpoint.bets'),
    'bet-orders': t('endpoint.bet_orders'),
    'report-lottery': t('endpoint.report_lottery'),
    'report-funds': t('endpoint.report_funds'),
    'report-third': t('endpoint.report_third'),
    deposits: t('endpoint.deposits'),
    withdrawals: t('endpoint.withdrawals'),
    rebate: t('endpoint.rebate')
  }
  return names[endpoint] || endpoint
}

export const ENDPOINT_HAS_DATE = {
  bets: true, 'bet-orders': true,
  'report-lottery': true, 'report-funds': true, 'report-third': true,
  deposits: true, withdrawals: true
}

/** Upstream date param name per endpoint (default = 'date') */
export const DATE_PARAM_NAME = {
  bets: 'create_time',
  'bet-orders': 'bet_time',
  deposits: 'create_time',
  withdrawals: 'create_time'
}

export function getEndpointSearch(endpoint) {
  const search = {
    members: [
      { name: 'username', type: 'text', label: t('search.username') },
      { name: 'status', type: 'select', label: t('search.status'), options: [
        { value: '', text: t('opt.all') }, { value: '0', text: t('opt.status.unreviewed') },
        { value: '1', text: t('opt.status.normal') }, { value: '2', text: t('opt.status.frozen') }, { value: '3', text: t('opt.status.locked') }
      ]},
      { name: 'sort_field', type: 'select', label: t('search.sort_field'), options: [
        { value: '', text: t('opt.all') }, { value: 'money', text: t('opt.sort.balance') },
        { value: 'login_time', text: t('opt.sort.last_login') }, { value: 'register_time', text: t('opt.sort.register') },
        { value: 'deposit_money', text: t('opt.sort.total_deposit') }, { value: 'withdrawal_money', text: t('opt.sort.total_withdrawal') }
      ]},
      { name: 'sort_direction', type: 'select', label: t('search.sort_direction'), options: [
        { value: 'desc', text: t('opt.direction.desc') }, { value: 'asc', text: t('opt.direction.asc') }
      ]}
    ],
    invites: [
      { name: 'invite_code', type: 'text', label: t('search.invite_code') },
      { name: 'user_type', type: 'select', label: t('search.user_type'), options: [
        { value: '', text: t('opt.all') }, { value: '1', text: t('opt.invite_type.normal') }, { value: '3', text: t('opt.invite_type.invite') }
      ]}
    ],
    bets: [
      { name: 'username', type: 'text', label: t('search.username') },
      { name: 'serial_no', type: 'text', label: t('search.serial_no') },
      { name: 'lottery_id', type: 'select', label: t('search.lottery_id'), options: LOTTERY_OPTIONS },
      { name: 'status', type: 'select', label: t('search.status'), options: [
        { value: '', text: t('opt.all') }, { value: '-9', text: t('opt.bet_status.pending') },
        { value: '1', text: t('opt.bet_status.win') }, { value: '-1', text: t('opt.bet_status.lose') },
        { value: '2', text: t('opt.bet_status.draw') }, { value: '3', text: t('opt.bet_status.user_cancel') },
        { value: '4', text: t('opt.bet_status.sys_cancel') }, { value: '5', text: t('opt.bet_status.abnormal') },
        { value: '6', text: t('opt.bet_status.pending_restore') }
      ]}
    ],
    'bet-orders': [
      { name: 'username', type: 'text', label: t('search.username') },
      { name: 'serial_no', type: 'text', label: t('search.serial_no') },
      { name: 'platform_username', type: 'text', label: t('search.platform_username') }
    ],
    'report-lottery': [
      { name: 'username', type: 'text', label: t('search.username') },
      { name: 'lottery_id', type: 'select', label: t('search.lottery_type'), options: LOTTERY_OPTIONS }
    ],
    'report-funds': [
      { name: 'username', type: 'text', label: t('search.username') }
    ],
    'report-third': [
      { name: 'username', type: 'text', label: t('search.username') },
      { name: 'platform_id', type: 'select', label: t('search.platform_id'), options: PLATFORM_OPTIONS }
    ],
    deposits: [
      { name: 'username', type: 'text', label: t('search.username') },
      { name: 'type', type: 'select', label: t('search.type'), options: [
        { value: '', text: t('opt.all') }, { value: '1', text: t('opt.tx_type.deposit') }, { value: '2', text: t('opt.tx_type.withdrawal') }
      ]},
      { name: 'status', type: 'select', label: t('search.status'), options: [
        { value: '', text: t('opt.all') }, { value: '0', text: t('opt.tx_status.pending') },
        { value: '1', text: t('opt.tx_status.completed') }, { value: '2', text: t('opt.tx_status.processing') }, { value: '3', text: t('opt.tx_status.failed') }
      ]}
    ],
    withdrawals: [
      { name: 'username', type: 'text', label: t('search.username') },
      { name: 'serial_no', type: 'text', label: t('search.serial_no') },
      { name: 'status', type: 'select', label: t('search.status'), options: [
        { value: '', text: t('opt.all') }, { value: '0', text: t('opt.tx_status.pending') },
        { value: '1', text: t('opt.tx_status.completed') }, { value: '2', text: t('opt.tx_status.processing') }, { value: '3', text: t('opt.tx_status.failed') }
      ]}
    ],
    rebate: []
  }
  return search[endpoint] || []
}

/** Endpoint → backend proxy URL (parallel fetch from all agents) */
export const UPSTREAM_URL = {
  members: '/api/v1/sync/proxy/members',
  invites: '/api/v1/sync/proxy/invites',
  bets: '/api/v1/sync/proxy/bets',
  'bet-orders': '/api/v1/sync/proxy/bet-orders',
  'report-lottery': '/api/v1/sync/proxy/report-lottery',
  'report-funds': '/api/v1/sync/proxy/report-funds',
  'report-third': '/api/v1/sync/proxy/report-third',
  deposits: '/api/v1/sync/proxy/deposits',
  withdrawals: '/api/v1/sync/proxy/withdrawals',
  rebate: '/api/v1/sync/proxy/rebate'
}

/** Hash → icon mapping (matches sidebar menu icons) */
export const HASH_TO_ICON = {
  '#/users': 'hub-icon-user',
  '#/invite-list': 'hub-icon-user',
  '#/report-lottery': 'hub-icon-document',
  '#/report-funds': 'hub-icon-document',
  '#/report-provider': 'hub-icon-document',
  '#/deposit-list': 'hub-icon-money',
  '#/withdrawal-history': 'hub-icon-money',
  '#/bet-list': 'hub-icon-monitor',
  '#/bet-third-party': 'hub-icon-monitor',
  '#/rebate-list': 'hub-icon-menu',
  '#/settings-sync': 'hub-icon-settings'
}

/** Report total summary — fields to sum for blockquote below table */
export function getReportTotalFields(endpoint) {
  const fields = {
    'report-lottery': [
      { field: 'username', label: t('total.report_lottery.bettors'), type: 'unique' },
      { field: 'bet_count', label: t('total.report_lottery.bet_count') },
      { field: 'bet_amount', label: t('total.report_lottery.bet_amount') },
      { field: 'valid_amount', label: t('total.report_lottery.valid_amount') },
      { field: 'rebate_amount', label: t('total.report_lottery.rebate_amount') },
      { field: 'result', label: t('total.report_lottery.result'), color: true },
      { field: 'win_lose', label: t('total.report_lottery.win_lose'), color: true },
      { field: 'prize', label: t('total.report_lottery.prize') }
    ],
    'report-funds': [
      { field: 'deposit_amount', label: t('total.report_funds.deposit_amount') },
      { field: 'withdrawal_amount', label: t('total.report_funds.withdrawal_amount') },
      { field: 'charge_fee', label: t('total.report_funds.charge_fee') },
      { field: 'agent_commission', label: t('total.report_funds.agent_commission') },
      { field: 'promotion', label: t('total.report_funds.promotion') },
      { field: 'third_rebate', label: t('total.report_funds.third_rebate') },
      { field: 'third_activity_amount', label: t('total.report_funds.third_activity_amount') }
    ],
    'report-third': [
      { field: 't_bet_times', label: t('total.report_third.bet_times') },
      { field: 'username', label: t('total.report_third.bettors'), type: 'unique' },
      { field: 't_bet_amount', label: t('total.report_third.bet_amount') },
      { field: 't_turnover', label: t('total.report_third.turnover') },
      { field: 't_prize', label: t('total.report_third.prize') },
      { field: 't_win_lose', label: t('total.report_third.win_lose'), color: true }
    ]
  }
  return fields[endpoint]
}

/** Hash → endpoint mapping */
export const HASH_TO_ENDPOINT = {
  '#/users': 'members',
  '#/invite-list': 'invites',
  '#/report-lottery': 'report-lottery',
  '#/report-funds': 'report-funds',
  '#/report-provider': 'report-third',
  '#/deposit-list': 'deposits',
  '#/withdrawal-history': 'withdrawals',
  '#/bet-list': 'bets',
  '#/bet-third-party': 'bet-orders',
  '#/rebate-list': 'rebate',
  '#/settings-sync': 'members'
}
