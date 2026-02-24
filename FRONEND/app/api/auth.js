import http from './http.js'
import { API } from '../constants/index.js'

export const authApi = {
  login: (username, password) => {
    const formData = new URLSearchParams()
    formData.append('username', username)
    formData.append('password', password)
    return http.post(API.LOGIN, formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
  },

  register: (data) => http.post(API.REGISTER, data),

  refresh: () => http.post(API.REFRESH),

  logout: () => http.post(API.LOGOUT),

  getMe: () => http.get(API.USER_ME)
}
