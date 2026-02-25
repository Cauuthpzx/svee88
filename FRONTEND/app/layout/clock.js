/**
 * Header clock — real-time 12h clock with AM/PM and date display.
 * @module layout/clock
 */

const pad = (n) => String(n).padStart(2, '0')

const updateClock = () => {
  const now = new Date()
  const h = now.getHours()
  const h12 = h % 12 || 12
  const ampm = h < 12 ? 'AM' : 'PM'
  const time = `${pad(h12)}:${pad(now.getMinutes())}:${pad(now.getSeconds())}  ${ampm}`
  const date = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`
  const timeEl = document.getElementById('clock-display')
  const dateEl = document.getElementById('clock-date')
  if (timeEl) timeEl.textContent = time
  if (dateEl) dateEl.textContent = date
}

/**
 * Start the header clock. Updates every second.
 * @returns {{ stop: Function }} Call stop() to clear the interval
 */
export const startClock = () => {
  updateClock()
  const timer = setInterval(updateClock, 1000)
  return { stop: () => clearInterval(timer) }
}
