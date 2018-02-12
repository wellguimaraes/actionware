import { ERROR_TYPE } from './constants'
import { getStore } from './config'
import { Store } from './types'
import createAction from './createAction'

export function clearError(action) {
  const store: Store = getStore()
  const trackedAction = createAction(action)._trackedAction

  store.dispatch({
    _actionwareType: ERROR_TYPE,
    _trackedAction: trackedAction,
    type: trackedAction._errorType,
    payload: null
  })
}