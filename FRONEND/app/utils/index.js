import { TOKEN_KEY, DEBOUNCE_MS, THROTTLE_MS } from '../constants/index.js'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (v) => localStorage.setItem(TOKEN_KEY, v)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

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
