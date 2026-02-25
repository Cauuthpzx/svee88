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

export const getToken = () => getCookie('logged_in') || localStorage.getItem(TOKEN_KEY)
export const setToken = (v) => {
  document.cookie = 'logged_in=1; path=/; SameSite=Lax'
  localStorage.setItem(TOKEN_KEY, v)
}
export const clearToken = () => {
  document.cookie = 'logged_in=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
  localStorage.removeItem(TOKEN_KEY)
}

export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

const ESC_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }

export const escapeHtml = (str) => {
  if (str == null) return ''
  return String(str).replace(/[&<>"']/g, (c) => ESC_MAP[c])
}

export const debounce = (fn, ms = DEBOUNCE_MS) => {
  let t
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms) }
}

export const throttle = (fn, ms = THROTTLE_MS) => {
  let last = 0
  return (...args) => {
    const now = Date.now()
    if (now - last < ms) return
    last = now
    fn(...args)
  }
}
