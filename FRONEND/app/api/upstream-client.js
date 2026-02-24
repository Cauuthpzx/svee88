/**
 * Upstream Axios Client
 *
 * Separate instance for the remote management system.
 * Justified: different baseURL, timeout, auth (PHPSESSID cookie vs Bearer token).
 */

import axios from 'axios'

const upstream = axios.create({
  baseURL: '',
  timeout: 30000,
  withCredentials: true,
  headers: { 'X-Requested-With': 'XMLHttpRequest' }
})

upstream.interceptors.response.use(
  (res) => res.data,
  (error) => Promise.reject(error)
)

export default upstream

/** Build URLSearchParams, skipping empty/null values */
export function formParams(obj) {
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(obj)) {
    if (v !== '' && v != null) p.append(k, v)
  }
  return p
}

const FORM_HEADER = { 'Content-Type': 'application/x-www-form-urlencoded' }

export function postForm(url, data = {}) {
  return upstream.post(url, formParams(data), { headers: FORM_HEADER })
}

export function postJson(url, data = {}) {
  return upstream.post(url, data)
}

const SENSITIVE_FIELDS = ['password', 'fund_password', 'salt']

export function stripSensitive(records) {
  return records.map((r) => {
    const clean = { ...r }
    for (const key of SENSITIVE_FIELDS) delete clean[key]
    return clean
  })
}
