import getActionName from './getActionName'
import { Action, Store, TrackedAction } from './types'
import { rejectWaiters, resolveWaiters } from './next'
import { getBusySuffix, getCancelSuffix, getDefaultPrefix, getErrorSuffix, getStore } from './config'
import { BUSY_TYPE, CANCEL_TYPE, ERROR_TYPE, SUCCESS_TYPE } from './constants'
import {
  notifyBeforeListeners,
  notifyCancellationListeners,
  notifyErrorListeners,
  notifySuccessListeners
} from './listeners'

export default function createAction(action: Action): TrackedAction {
  if (typeof action !== 'function')
    throw new Error('Action must be a function')

  if (action._trackedAction)
    return action._trackedAction

  const trackedAction = function (...args) {

    const store: Store = getStore()
    const handleError = handleActionError.bind(null, action, args)
    const extras = {}
    const actionContext = { setExtra: (values) => Object.assign(extras, values) }

    try {

      handleActionBusy(action, args)

      const actionResponse = action.apply(actionContext, [ ...args, store ])
      const isAsync = actionResponse instanceof Promise

      if (isAsync) {
        let cancelled = false
        let cancellable = true

        const cancellableResponse = actionResponse.then(
          payload => {
            cancellable = false
            return !cancelled
              ? handleActionSuccess(action, payload, args)
              : null
          },
          err => {
            cancellable = false
            return !cancelled
              ? Promise.reject(handleError(err))
              : null
          }
        )

        cancellableResponse.cancel = () => {
          if (!cancellable)
            throw new Error(
              'Action is not executing anymore, therefore can\'t be cancelled.\n' +
              'Check \'canBeCancelled\' prop to verify whether an action ' +
              'call can be cancelled or not.'
            )

          cancelled = true
          cancellable = false
          handleActionCancellation(action, args, extras)

          return { args, extras }
        }

        Object.defineProperty(cancellableResponse, 'canBeCancelled', {
          enumerable: true,
          get: () => cancellable
        })

        return cancellableResponse
      }

      return handleActionSuccess(action, actionResponse, args)

    } catch (err) {

      handleError(err)
      throw err

    }
  }

  const actionName = getActionName(action._prefix || getDefaultPrefix(), action.name, action)

  trackedAction._successType = actionName
  trackedAction._busyType = actionName + getBusySuffix()
  trackedAction._errorType = actionName + getErrorSuffix()
  trackedAction._cancellationType = actionName + getCancelSuffix()

  action._trackedAction = trackedAction

  return trackedAction
}

export function handleActionSuccess(action: Action, payload, args) {
  const store: Store = getStore()

  store.dispatch({
    _actionwareType: SUCCESS_TYPE,
    _trackedAction: action._trackedAction,
    type: action._trackedAction._successType,
    payload
  })

  notifySuccessListeners({ action, payload, args })
  resolveWaiters(action, payload)

  return payload
}

export function handleActionBusy(action: Action, args) {
  const store: Store = getStore()

  store.dispatch({
    _actionwareType: BUSY_TYPE,
    _trackedAction: action._trackedAction,
    type: action._trackedAction._busyType,
    payload: null, // Payload prop must be set
    args
  })

  notifyBeforeListeners({ action, args })
}

export function handleActionError(action: Action, args, error: Error) {
  const store: Store = getStore()

  store.dispatch({
    _actionwareType: ERROR_TYPE,
    _trackedAction: action._trackedAction,
    type: action._trackedAction._errorType,
    payload: error,
    args
  })

  notifyErrorListeners({ action, error, args })
  rejectWaiters(action, error)

  return error
}

export function handleActionCancellation(action: Action, args, extras) {
  const store: Store = getStore()

  store.dispatch({
    _actionwareType: CANCEL_TYPE,
    _trackedAction: action._trackedAction,
    type: action._trackedAction._cancellationType,
    payload: extras,
    args
  })

  notifyCancellationListeners({ action, args, extras })
}

export function errorType(action: Action) {
  return createAction(action)._errorType
}

export function successType(action: Action) {
  return createAction(action)._successType
}

export function busyType(action: Action) {
  return createAction(action)._busyType
}

export function cancellationType(action: Action) {
  return createAction(action)._cancellationType
}
