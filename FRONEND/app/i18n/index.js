/**
 * i18n Engine — instant language switching (VI / EN / ZH).
 *
 * - t(key, params?) → synchronous string lookup
 * - setLang(code) → switch + persist + notify
 * - onLangChange(fn) → observer, returns unsubscribe
 * - initI18n() → read localStorage, set html[lang]
 */

import vi from './locales/vi.js'
import en from './locales/en.js'
import zh from './locales/zh.js'

const LOCALES = { vi, en, zh }
const STORAGE_KEY = 'hub-lang'
const DEFAULT_LANG = 'vi'

let currentLang = DEFAULT_LANG
const listeners = new Set()

export const LANG_OPTIONS = [
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'en', label: 'English' },
  { code: 'zh', label: '中文' }
]

export function t(key, params) {
  const locale = LOCALES[currentLang] || LOCALES[DEFAULT_LANG]
  let str = locale[key] ?? LOCALES[DEFAULT_LANG][key] ?? key
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      str = str.replaceAll(`{${k}}`, v)
    }
  }
  return str
}

export function getLang() {
  return currentLang
}

export function setLang(code) {
  if (!LOCALES[code] || code === currentLang) return
  currentLang = code
  localStorage.setItem(STORAGE_KEY, code)
  document.documentElement.lang = code
  listeners.forEach((fn) => fn(code))
}

export function onLangChange(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function initI18n() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved && LOCALES[saved]) {
    currentLang = saved
  }
  document.documentElement.lang = currentLang
}
