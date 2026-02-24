const state = {
  user: null
}

export const store = {
  get: (key) => state[key],
  set: (key, value) => { state[key] = value }
}
