import { TOKEN_KEY } from '../constants/index.js'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (v) => localStorage.setItem(TOKEN_KEY, v)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

export const debounce = (fn, ms = 300) => {
  let t
  return (...args) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...args), ms)
  }
}

export const throttle = (fn, ms = 100) => {
  let last = 0
  return (...args) => {
    const now = Date.now()
    if (now - last < ms) return
    last = now
    fn(...args)
  }
}

export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}
