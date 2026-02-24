import { TOKEN_KEY } from '../constants/index.js'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (v) => localStorage.setItem(TOKEN_KEY, v)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}
