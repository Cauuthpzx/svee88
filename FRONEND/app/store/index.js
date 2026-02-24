import { getToken } from '../utils/index.js'

const state = {
  user: null,
  token: getToken()
}

const listeners = {}

const emit = (key) => listeners[key]?.forEach((fn) => fn(state[key]))

export const store = {
  get: (key) => state[key],
  set: (key, value) => {
    state[key] = value
    emit(key)
  },
  on: (key, fn) => {
    listeners[key] = listeners[key] || []
    listeners[key].push(fn)
  }
}
