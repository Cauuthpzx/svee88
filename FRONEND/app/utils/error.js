import { MSG } from '../constants/index.js'

/**
 * Error classification — centralized error parsing.
 * All modules use this instead of custom error extraction.
 */

export const ErrorType = {
  NETWORK: 'network',
  AUTH: 'auth',
  VALIDATION: 'validation',
  BUSINESS: 'business',
  UNKNOWN: 'unknown'
}

export const classifyError = (error) => {
  if (!error?.response) return { type: ErrorType.NETWORK, message: MSG.NETWORK_ERROR }

  const status = error.response.status
  const data = error.response.data

  if (status === 401) return { type: ErrorType.AUTH, message: 'Phiên đăng nhập hết hạn' }
  if (status === 403) return { type: ErrorType.AUTH, message: 'Không có quyền truy cập' }

  if (status === 422) {
    const fieldErrors = data?.errors || data?.detail
    const msg = Array.isArray(fieldErrors)
      ? fieldErrors[0]?.msg || fieldErrors[0]?.message || MSG.SERVER_ERROR
      : MSG.SERVER_ERROR
    return { type: ErrorType.VALIDATION, message: msg, errors: fieldErrors }
  }

  if (data?.detail) {
    const msg = typeof data.detail === 'string'
      ? data.detail
      : Array.isArray(data.detail) ? (data.detail[0]?.msg || MSG.SERVER_ERROR) : MSG.SERVER_ERROR
    return { type: ErrorType.BUSINESS, message: msg }
  }

  if (data?.message) return { type: ErrorType.BUSINESS, message: data.message }

  return { type: ErrorType.UNKNOWN, message: MSG.SERVER_ERROR }
}

/**
 * Notification service — centralized UI error display via Layui layer.
 */
export const notify = {
  success: (msg) => {
    layui.use('layer', function (layer) { layer.msg(msg, { icon: 1 }) })
  },
  error: (msg) => {
    layui.use('layer', function (layer) { layer.msg(msg, { icon: 2 }) })
  },
  warn: (msg) => {
    layui.use('layer', function (layer) { layer.msg(msg, { icon: 0 }) })
  },
  info: (msg) => {
    layui.use('layer', function (layer) { layer.msg(msg, { icon: 6 }) })
  }
}

/**
 * Handle API error with classification + notification.
 * Replaces per-module getErrorMessage + layer.msg patterns.
 */
export const handleApiError = (error) => {
  const classified = classifyError(error)
  if (classified.type !== ErrorType.AUTH) {
    notify.error(classified.message)
  }
  return classified
}
