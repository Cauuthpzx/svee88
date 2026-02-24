import axios from 'axios'
import { getToken, clearToken } from '../utils/index.js'
import { ROUTES } from '../constants/index.js'

const http = axios.create({
  baseURL: '',
  timeout: 10000
})

http.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

http.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      clearToken()
      location.hash = ROUTES.LOGIN
    }
    return Promise.reject(error)
  }
)

export default http
