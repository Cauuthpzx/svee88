const state = {
  user: null
}

const listeners = {}

const emit = (key) => {
  if (listeners[key]) {
    listeners[key].forEach((fn) => fn(state[key]))
  }
}

export const store = {
  get: (key) => state[key],
  set: (key, value) => {
    state[key] = value
    emit(key)
  },
  on: (key, fn) => {
    if (!listeners[key]) listeners[key] = []
    listeners[key].push(fn)
    return () => {
      listeners[key] = listeners[key].filter((f) => f !== fn)
    }
  },
  reset: () => {
    state.user = null
    emit('user')
  }
}
