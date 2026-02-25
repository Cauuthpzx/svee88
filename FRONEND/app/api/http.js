import axios from 'axios'
import { getToken, setToken, clearToken } from '../utils/index.js'
import { ROUTES, REFRESH_API } from '../constants/index.js'

const MAX_RETRIES = 3
const RETRY_BASE_MS = 1000

const http = axios.create({
  baseURL: '',
  timeout: 10000
})

http.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let refreshPromise = null

const tryRefresh = async () => {
  if (refreshPromise) return refreshPromise
  refreshPromise = http.post(REFRESH_API, null, {
    _skipAuthRetry: true,
    _noRetry: true
  }).then((res) => {
    // Store the new JWT for Authorization header fallback
    setToken(res?.access_token || '1')
    return true
  }).catch(() => false).finally(() => {
    refreshPromise = null
  })
  return refreshPromise
}

const isNetworkError = (error) =>
  !error.response && (error.code === 'ECONNABORTED' || error.message === 'Network Error')

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

http.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const config = error.config

    if (isNetworkError(error) && !config?._noRetry) {
      config._retryCount = config._retryCount || 0
      if (config._retryCount < MAX_RETRIES) {
        config._retryCount++
        await wait(RETRY_BASE_MS * Math.pow(2, config._retryCount - 1))
        return http(config)
      }
    }

    if (error.response?.status === 401 && !config?._skipAuthRetry) {
      config._skipAuthRetry = true
      const refreshed = await tryRefresh()
      if (refreshed) {
        // No need to set Authorization header — browser sends HttpOnly cookie automatically
        return http(config)
      }
      clearToken()
      location.hash = ROUTES.LOGIN
    }

    return Promise.reject(error)
  }
)

export default http
