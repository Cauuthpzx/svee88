/**
 * Shared mutable state for the data-table module.
 * All sub-modules read/write through this single object so that
 * splitting files does not introduce stale-reference bugs.
 * @module data-table/state
 */

export const moduleState = {
  /** @type {string|null} Current data endpoint key */
  currentEndpoint: null,
  /** @type {string|null} Current route hash */
  currentHash: null,
  /** @type {boolean} User requested abort of sync operations */
  syncAbort: false,
  /** @type {boolean} SWR silent refresh in progress */
  swrReloading: false,
  /** @type {Object} Current search/filter params for SWR */
  swrCurrentWhere: {},
  /** @type {number} Current table page */
  swrPage: 1,
  /** @type {number} Current table page size */
  swrLimit: 10,
  /** @type {Function|null} Unsubscribe from i18n language change */
  unsubLang: null
}

/**
 * Reset all state to initial values. Called by `destroy()`.
 */
export const resetState = () => {
  moduleState.currentEndpoint = null
  moduleState.currentHash = null
  moduleState.syncAbort = true
  moduleState.swrReloading = false
  moduleState.swrCurrentWhere = {}
  moduleState.swrPage = 1
  moduleState.swrLimit = 10
  if (moduleState.unsubLang) {
    moduleState.unsubLang()
    moduleState.unsubLang = null
  }
}
