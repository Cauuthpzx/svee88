/**
 * Core utility functions — token management, validation, escaping, debounce/throttle.
 * @module utils
 */

import { TOKEN_KEY, DEBOUNCE_MS, THROTTLE_MS } from '../constants/index.js'

/**
 * Token functions use the `logged_in` cookie (non-HttpOnly) for auth state checks.
 * The actual access_token lives in an HttpOnly cookie set by the server — JS cannot
 * read it, and the browser sends it automatically on every same-origin request.
 */
const getCookie = (name) => {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'))
  return match ? match[1] : null
}

/** @returns {string|null} JWT token from localStorage, or auth state flag from cookie */
export const getToken = () => localStorage.getItem(TOKEN_KEY) || getCookie('logged_in')

/** @param {string} v - Token value to persist */
export const setToken = (v) => {
  document.cookie = 'logged_in=1; path=/; SameSite=Lax'
  localStorage.setItem(TOKEN_KEY, v)
}

/** Clear auth state from both cookie and localStorage. */
export const clearToken = () => {
  document.cookie = 'logged_in=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
  localStorage.removeItem(TOKEN_KEY)
}

/**
 * Validate an email address format.
 * @param {string} email
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

const ESC_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }

/**
 * Escape HTML special characters to prevent XSS.
 * @param {string} str - Raw string
 * @returns {string} Escaped string safe for innerHTML
 */
export const escapeHtml = (str) => {
  if (str == null) return ''
  return String(str).replace(/[&<>"']/g, (c) => ESC_MAP[c])
}

/**
 * Debounce a function — delays invocation until `ms` after the last call.
 * @param {Function} fn - Function to debounce
 * @param {number} [ms=DEBOUNCE_MS] - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (fn, ms = DEBOUNCE_MS) => {
  let t
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms) }
}

/**
 * Throttle a function — invokes at most once per `ms` milliseconds.
 * @param {Function} fn - Function to throttle
 * @param {number} [ms=THROTTLE_MS] - Minimum interval in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (fn, ms = THROTTLE_MS) => {
  let last = 0
  return (...args) => {
    const now = Date.now()
    if (now - last < ms) return
    last = now
    fn(...args)
  }
}
