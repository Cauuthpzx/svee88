/**
 * Upstream Sync Helpers — fetchAllPages, fetchDateChunked
 */

import { stripSensitive } from './upstream-client.js'

/**
 * Fetch ALL records from a paginated table endpoint.
 *
 * @param {Function} listFn - One of the .list() functions
 * @param {object} filters - Filter params (without page/limit)
 * @param {object} [options]
 * @param {number} [options.pageSize=50]
 * @param {boolean} [options.sensitive=false] - Strip password/salt fields
 * @returns {Promise<{data: Array, totalData: object|null}>}
 */
export async function fetchAllPages(listFn, filters = {}, { pageSize = 50, maxPages = Infinity, sensitive = false } = {}) {
  const allData = []
  let page = 1
  let totalCount = Infinity
  let totalData = null

  while (allData.length < totalCount && page <= maxPages) {
    const res = await listFn({ ...filters, page, limit: pageSize })

    if (res.code !== 0 || !Array.isArray(res.data)) break

    totalCount = res.count
    allData.push(...res.data)
    if (res.total_data && !totalData) totalData = res.total_data

    if (res.data.length < pageSize) break
    page++
  }

  const cleaned = sensitive ? stripSensitive(allData) : allData
  return { data: cleaned, totalData }
}

/**
 * Fetch data from endpoints with a MAX 7-day date range.
 *
 * @param {Function} listFn
 * @param {string} startDate - "YYYY-MM-DD"
 * @param {string} endDate - "YYYY-MM-DD"
 * @param {object} filters
 * @param {object} [options]
 * @param {number} [options.pageSize=50]
 * @param {boolean} [options.datetime=false]
 * @param {string} [options.dateParam='create_time']
 * @returns {Promise<Array>}
 */
export async function fetchDateChunked(listFn, startDate, endDate, filters = {}, { pageSize = 50, datetime = false, dateParam = 'create_time' } = {}) {
  const allData = []
  const start = new Date(startDate)
  const end = new Date(endDate)
  const MAX_DAYS = 6

  let chunkStart = new Date(start)
  while (chunkStart <= end) {
    const chunkEnd = new Date(chunkStart)
    chunkEnd.setDate(chunkEnd.getDate() + MAX_DAYS)
    if (chunkEnd > end) chunkEnd.setTime(end.getTime())

    const fmt = (d) => d.toISOString().slice(0, 10)
    const dateValue = datetime
      ? `${fmt(chunkStart)} 00:00:00|${fmt(chunkEnd)} 23:59:59`
      : `${fmt(chunkStart)}|${fmt(chunkEnd)}`

    const { data } = await fetchAllPages(listFn, { ...filters, [dateParam]: dateValue }, { pageSize })
    allData.push(...data)

    chunkStart.setDate(chunkStart.getDate() + MAX_DAYS + 1)
  }

  return allData
}

