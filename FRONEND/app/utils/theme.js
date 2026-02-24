const STORAGE_KEY = 'color-scheme'

const getPreferred = () =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

const apply = (mode) => {
  document.documentElement.classList.toggle('dark', mode === 'dark')
  const icon = document.getElementById('themeIcon')
  if (icon) {
    icon.className = mode === 'dark'
      ? 'layui-icon layui-icon-light'
      : 'layui-icon layui-icon-moon'
  }
}

export const initTheme = () => {
  apply(localStorage.getItem(STORAGE_KEY) || getPreferred())
}

export const toggleTheme = () => {
  const next = document.documentElement.classList.contains('dark') ? 'light' : 'dark'
  localStorage.setItem(STORAGE_KEY, next)
  apply(next)
}
