/**
 * Data Table — Column configs, search fields, endpoint metadata.
 * Factory functions call t() at render time for i18n support.
 */

import { t } from '../../i18n/index.js'
import { LOTTERY_OPTIONS, PLATFORM_OPTIONS } from './options.js'

/** Agent column — prepended to all endpoint configs */
const agentCol = () => ({ field: '_agent_name', title: t('col.agent'), minWidth: 110 })

/** Column configs — field names match upstream exactly */
export function getEndpointCols(endpoint) {
  const cols = {
    members: [
      agentCol(),
      { field: 'username', title: t('col.members.username'), minWidth: 130 },
      { field: 'type_format', title: t('col.members.type_format'), minWidth: 100 },
      { field: 'parent_user', title: t('col.members.parent_user'), minWidth: 130 },
      { field: 'money', title: t('col.members.money'), minWidth: 120 },
      { field: 'deposit_count', title: t('col.members.deposit_count'), minWidth: 90 },
      { field: 'withdrawal_count', title: t('col.members.withdrawal_count'), minWidth: 90 },
      { field: 'deposit_amount', title: t('col.members.deposit_amount'), minWidth: 110 },
      { field: 'withdrawal_amount', title: t('col.members.withdrawal_amount'), minWidth: 110 },
      { field: 'login_time', title: t('col.members.login_time'), minWidth: 150 },
      { field: 'register_time', title: t('col.members.register_time'), minWidth: 150 },
      { field: 'status_format', title: t('col.members.status_format'), minWidth: 90 }
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
      { field: 'operate', title: t('col.invites.operate'), width: 280, templet: (d) => {
        const code = d.invite_code || ''
        const id = d.id || ''
        const base = (d._agent_base_url || '').replace(/\/+$/, '')
        return `<div class="invite-actions">
          <button class="layui-btn layui-btn-xs invite-copy-btn" data-code="${code}">${t('btn.copy_link')}</button>
          <button class="layui-btn layui-btn-xs layui-btn-normal invite-setting-btn" data-id="${id}" data-base="${base}">${t('btn.view_settings')}</button>
          <button class="layui-btn layui-btn-xs layui-btn-warm invite-qr-btn" data-id="${id}" data-base="${base}">${t('btn.qr_code')}</button>
        </div>`
      }}
    ],
    bets: [
      agentCol(),
      { field: 'serial_no', title: t('col.bets.serial_no'), width: 200 },
      { field: 'username', title: t('col.bets.username'), width: 150 },
      { field: 'create_time', title: t('col.bets.create_time'), width: 160 },
      { field: 'lottery_name', title: t('col.bets.lottery_name'), minWidth: 150 },
      { field: 'play_type_name', title: t('col.bets.play_type_name'), minWidth: 150 },
      { field: 'play_name', title: t('col.bets.play_name'), minWidth: 150 },
      { field: 'issue', title: t('col.bets.issue'), minWidth: 150 },
      { field: 'content', title: t('col.bets.content'), minWidth: 150 },
      { field: 'money', title: t('col.bets.money'), minWidth: 150 },
      { field: 'rebate_amount', title: t('col.bets.rebate_amount'), minWidth: 150 },
      { field: 'result', title: t('col.bets.result'), minWidth: 150 },
      { field: 'status_text', title: t('col.bets.status_text'), width: 100 }
    ],
    'bet-orders': [
      agentCol(),
      { field: 'serial_no', title: t('col.bet_orders.serial_no'), width: 250 },
      { field: 'platform_id_name', title: t('col.bet_orders.platform_id_name'), width: 150 },
      { field: 'platform_username', title: t('col.bet_orders.platform_username'), width: 150 },
      { field: 'c_name', title: t('col.bet_orders.c_name'), width: 150 },
      { field: 'game_name', title: t('col.bet_orders.game_name'), width: 150 },
      { field: 'bet_amount', title: t('col.bet_orders.bet_amount'), width: 150 },
      { field: 'turnover', title: t('col.bet_orders.turnover'), width: 150 },
      { field: 'prize', title: t('col.bet_orders.prize'), width: 150 },
      { field: 'win_lose', title: t('col.bet_orders.win_lose'), width: 150 },
      { field: 'bet_time', title: t('col.bet_orders.bet_time'), width: 160 }
    ],
    'report-lottery': [
      agentCol(),
      { field: 'username', title: t('col.report_lottery.username'), width: 150 },
      { field: 'user_parent_format', title: t('col.report_lottery.user_parent_format'), width: 150 },
      { field: 'bet_count', title: t('col.report_lottery.bet_count'), minWidth: 150 },
      { field: 'bet_amount', title: t('col.report_lottery.bet_amount'), minWidth: 150 },
      { field: 'valid_amount', title: t('col.report_lottery.valid_amount'), minWidth: 160 },
      { field: 'rebate_amount', title: t('col.report_lottery.rebate_amount'), minWidth: 150 },
      { field: 'result', title: t('col.report_lottery.result'), minWidth: 150 },
      { field: 'win_lose', title: t('col.report_lottery.win_lose'), minWidth: 180 },
      { field: 'prize', title: t('col.report_lottery.prize'), minWidth: 150 },
      { field: 'lottery_name', title: t('col.report_lottery.lottery_name'), width: 160 }
    ],
    'report-funds': [
      agentCol(),
      { field: 'username', title: t('col.report_funds.username'), width: 150 },
      { field: 'user_parent_format', title: t('col.report_funds.user_parent_format'), width: 150 },
      { field: 'deposit_count', title: t('col.report_funds.deposit_count'), width: 160 },
      { field: 'deposit_amount', title: t('col.report_funds.deposit_amount'), minWidth: 150, sort: true },
      { field: 'withdrawal_count', title: t('col.report_funds.withdrawal_count'), minWidth: 150 },
      { field: 'withdrawal_amount', title: t('col.report_funds.withdrawal_amount'), minWidth: 160 },
      { field: 'charge_fee', title: t('col.report_funds.charge_fee'), minWidth: 150 },
      { field: 'agent_commission', title: t('col.report_funds.agent_commission'), minWidth: 150 },
      { field: 'promotion', title: t('col.report_funds.promotion'), minWidth: 150 },
      { field: 'third_rebate', title: t('col.report_funds.third_rebate'), minWidth: 150 },
      { field: 'third_activity_amount', title: t('col.report_funds.third_activity_amount'), minWidth: 150 },
      { field: 'date', title: t('col.report_funds.date'), minWidth: 160 }
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
      { field: 'serial_no', title: t('col.withdrawals.serial_no'), width: 180 },
      { field: 'create_time', title: t('col.withdrawals.create_time'), width: 160 },
      { field: 'username', title: t('col.withdrawals.username') },
      { field: 'user_parent_format', title: t('col.withdrawals.user_parent_format') },
      { field: 'amount', title: t('col.withdrawals.amount') },
      { field: 'user_fee', title: t('col.withdrawals.user_fee') },
      { field: 'true_amount', title: t('col.withdrawals.true_amount') },
      { field: 'status_format', title: t('col.withdrawals.status_format') }
    ],
    rebate: [
      { field: 'odds_11', title: 'Play Type', minWidth: 160 },
      { field: 'odds_10', title: 'Rebate 10', minWidth: 100 },
      { field: 'odds_9', title: 'Rebate 9', minWidth: 100 },
      { field: 'odds_8', title: 'Rebate 8', minWidth: 100 },
      { field: 'odds_7', title: 'Rebate 7', minWidth: 100 },
      { field: 'odds_6', title: 'Rebate 6', minWidth: 100 },
      { field: 'odds_5', title: 'Rebate 5', minWidth: 100 },
      { field: 'odds_4', title: 'Rebate 4', minWidth: 100 },
      { field: 'odds_3', title: 'Rebate 3', minWidth: 100 },
      { field: 'odds_2', title: 'Rebate 2', minWidth: 100 },
      { field: 'odds_1', title: 'Rebate 1', minWidth: 100 }
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
