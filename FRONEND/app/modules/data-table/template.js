/**
 * Data-table HTML template — generates the full page markup.
 * @module data-table/template
 */

import { escapeHtml } from '../../utils/index.js'
import { t } from '../../i18n/index.js'
import {
  ENDPOINT_HAS_DATE, getEndpointSearch, HASH_TO_ICON, UPSTREAM_URL
} from './config.js'
import { syncToolPanel } from './sync-tool.js'

/**
 * Build the data-table page HTML for a given endpoint.
 * @param {string} title - Page title
 * @param {string} endpoint - Endpoint key (e.g. 'members', 'rebate')
 * @param {string} hash - Route hash (e.g. '#/users')
 * @returns {string} Full HTML string
 */
export const template = (title, endpoint, hash) => {
  const isSync = hash === '#/settings-sync'
  const hasDate = isSync ? false : ENDPOINT_HAS_DATE[endpoint]
  const searchFields = isSync ? [] : (getEndpointSearch(endpoint) || [])
  const showAgentFilter = !isSync && !!UPSTREAM_URL[endpoint]
  const isRebate = endpoint === 'rebate'
  const hasSearch = searchFields.length > 0 || hasDate || showAgentFilter || isRebate

  let searchInputs = ''
  searchFields.forEach((p) => {
    if (p.type === 'select' && p.options) {
      const opts = p.options.map((o) =>
        `<option value="${o.value}">${escapeHtml(o.text)}</option>`
      ).join('')
      const wClass = p.options.length > 10 ? 'data-input-lg' : 'data-input-sm'
      const searchAttr = p.options.length > 10 ? ' lay-search' : ''
      searchInputs += `
        <label>${escapeHtml(p.label)}</label>:
        <div class="layui-input-inline ${wClass}">
          <select name="${p.name}" lay-filter="search_${p.name}"${searchAttr}>${opts}</select>
        </div> `
    } else {
      searchInputs += `
        <label>${escapeHtml(p.label)}</label>:
        <div class="layui-input-inline data-input-md">
          <input type="text" name="${p.name}" placeholder="${escapeHtml(p.label)}" class="layui-input" autocomplete="off">
        </div> `
    }
  })

  return `
    <div class="data-panel">
      ${isSync ? syncToolPanel() : ''}

      ${hasSearch ? `
      <div class="layui-form data-toolbar">
        <fieldset class="layui-elem-field">
          <legend>${HASH_TO_ICON[hash] ? `<i class="hub-icon ${HASH_TO_ICON[hash]}"></i> ` : ''}${escapeHtml(title)}</legend>
          <div class="layui-field-box">
            <form class="layui-form" lay-filter="dataSearchForm">
              ${hasDate ? `
              <div class="layui-inline" id="data-date-wrap">
                <label>${t('search.date')}</label>:
                <div class="layui-input-inline data-date-input">
                  <input type="text" name="date" id="dataDateRange" placeholder="${t('date.start_end')}" class="layui-input" readonly autocomplete="off">
                </div>
                <div class="layui-input-inline data-quick-select">
                  <select id="quickDateSelect" lay-filter="quickDateSelect">
                    <option value="">${t('date.quick_select')}</option>
                    <option value="yesterday">${t('date.yesterday')}</option>
                    <option value="today">${t('date.today')}</option>
                    <option value="thisWeek">${t('date.this_week')}</option>
                    <option value="thisMonth">${t('date.this_month')}</option>
                    <option value="lastMonth">${t('date.last_month')}</option>
                  </select>
                </div>
              </div>
              ` : ''}
              ${showAgentFilter ? `
              <div class="layui-inline" id="data-agent-wrap">
                <label>${t('search.agent')}</label>:
                <div class="layui-input-inline data-input-sm">
                  <select name="agent_id" id="agentFilter" lay-filter="search_agent_id">
                    <option value="0">${t('opt.all_agents')}</option>
                  </select>
                </div>
              </div>
              ` : ''}
              ${isRebate ? `
              <div class="layui-inline" id="data-rebate-wrap">
                <label>${t('search.series')}</label>:
                <div class="layui-input-inline data-input-md">
                  <select id="rebateSeriesSelect" lay-filter="rebateSeriesSelect">
                    <option value="">${t('opt.loading')}</option>
                  </select>
                </div>
                <label>${t('search.game')}</label>:
                <div class="layui-input-inline data-input-md">
                  <select id="rebateGameSelect" lay-filter="rebateGameSelect">
                    <option value="">${t('opt.all')}</option>
                  </select>
                </div>
              </div>
              ` : ''}
              <div class="layui-inline" id="data-search-wrap">${searchInputs}</div>
              <div class="layui-inline">
                <button type="button" class="layui-btn" lay-submit lay-filter="doDataSearch">
                  <i class="hub-icon hub-icon-search"></i> ${t('btn.search')}
                </button>
              </div>
              <div class="layui-inline">
                <button type="button" class="layui-btn layui-btn-primary" id="dataResetBtn">
                  <i class="hub-icon hub-icon-refresh"></i> ${t('btn.reset')}
                </button>
              </div>
            </form>
          </div>
        </fieldset>
      </div>
      ` : ''}

      <table id="dataTable" lay-filter="dataTable"></table>

      <div id="data-total-wrap" class="data-total-wrap">
        <blockquote class="layui-elem-quote total-summary-quote" id="data-total-body">
          <i class="hub-icon hub-icon-chart"></i> <b>${t('table.summary')}</b>
        </blockquote>
      </div>
    </div>
  `
}
