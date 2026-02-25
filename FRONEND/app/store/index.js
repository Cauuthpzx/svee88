/**
 * Simple pub-sub state store.
 * @module store
 */

const state = { user: null }
const listeners = {}

const emit = (key) => {
  if (listeners[key]) {
    listeners[key].forEach((fn) => fn(state[key]))
  }
}

export const store = {
  /**
   * Get a value from the store.
   * @param {string} key
   * @returns {*}
   */
  get: (key) => state[key],

  /**
   * Set a value and notify all listeners for that key.
   * @param {string} key
   * @param {*} value
   */
  set: (key, value) => {
    state[key] = value
    emit(key)
  },

  /**
   * Subscribe to changes on a key.
   * @param {string} key
   * @param {Function} fn - Called with the new value
   * @returns {Function} Unsubscribe function
   */
  on: (key, fn) => {
    if (!listeners[key]) listeners[key] = []
    listeners[key].push(fn)
    return () => {
      listeners[key] = listeners[key].filter((f) => f !== fn)
    }
  },

  /** Reset all state to defaults and notify listeners. */
  reset: () => {
    state.user = null
    emit('user')
  }
}
