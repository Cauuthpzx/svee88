import { THEME_KEY } from '../constants/index.js'

const getPreferred = () =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

const apply = (mode) => {
  document.documentElement.classList.toggle('dark', mode === 'dark')
  const icon = document.getElementById('themeIcon')
  if (icon) {
    icon.className = mode === 'dark'
      ? 'hub-icon hub-icon-sun'
      : 'hub-icon hub-icon-moon'
  }
}

export const initTheme = () => {
  apply(localStorage.getItem(THEME_KEY) || getPreferred())
}

export const toggleTheme = () => {
  const next = document.documentElement.classList.contains('dark') ? 'light' : 'dark'
  localStorage.setItem(THEME_KEY, next)
  apply(next)
}
