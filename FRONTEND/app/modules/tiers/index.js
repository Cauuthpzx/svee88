import { API } from '../../constants/index.js'
import { escapeHtml, getToken } from '../../utils/index.js'
import { t } from '../../i18n/index.js'

const template = () => `
  <div class="layui-card">
    <div class="layui-card-header">${t('tiers.title')}</div>
    <div class="layui-card-body">
      <table id="tierTable" lay-filter="tierTable"></table>
    </div>
  </div>
`

const loadTiers = () => {
  layui.use('table', function (table) {
    table.render({
      elem: '#tierTable',
      url: API.TIERS,
      headers: { Authorization: `Bearer ${getToken()}` },
      parseData: (res) => ({
        code: 0,
        count: Array.isArray(res.data || res) ? (res.data || res).length : 0,
        data: Array.isArray(res.data || res) ? (res.data || res) : []
      }),
      request: { pageName: 'page', limitName: 'items_per_page' },
      cols: [[
        { field: 'name', title: t('col.tiers.name'), width: 200, templet: (d) => escapeHtml(d.name) },
        { field: 'created_at', title: t('col.tiers.created_at'), width: 160 }
      ]],
      page: false,
      skin: 'line',
      even: true
    })
  })
}

export const render = (hash, container) => {
  const el = container || document.getElementById('main-content')
  el.innerHTML = template()
  loadTiers()
}

export const destroy = () => {}
