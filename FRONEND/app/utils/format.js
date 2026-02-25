/**
 * Number & date formatting utilities.
 * @module utils/format
 */

/**
 * Format a number using Vietnamese locale (dot for thousands, comma for decimals).
 * @param {number} value - The number to format
 * @param {boolean} [isInteger=false] - Round to integer before formatting
 * @returns {string} Formatted string, e.g. "1.234.567" or "1.234,56"
 */
export const formatVN = (value, isInteger = false) => {
  if (isInteger) return Math.round(value).toLocaleString('vi-VN')
  return value.toLocaleString('vi-VN')
}

/**
 * Convert a Date to `YYYY-MM-DD` string.
 * @param {Date} d - Date object
 * @returns {string} e.g. "2025-01-15"
 */
export const formatDateStr = (d) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}
