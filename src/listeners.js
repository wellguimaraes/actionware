import { busyType, cancellationType, errorType, successType } from './createAction'
import { getStore } from './config'

const globalSuccessListeners: Array<Function> = []
const globalErrorListeners: Array<Function> = []
const globalBeforeListeners: Array<Function> = []
const globalCancellationListeners: Array<Function> = []
const individualListeners = {}

function getListenerAdder(globalListeners: Array<Function>, typifier: Function) {
  // Args can be either:
  // 1) action + handler: per action listener
  // 2) handler: global listener
  return (...args) => {

    switch (args.length) {
      // global listener
      case 1:
        globalListeners.push(args[ 0 ])
        break

      // action listener
      case 2:
        const listener = args[ 1 ]
        const actionType = typifier(args[ 0 ])

        if (!individualListeners.hasOwnProperty(actionType))
          individualListeners[ actionType ] = [ listener ]
        else
          individualListeners[ actionType ].push(listener)

        break

      default:
        // Invalid arguments
        throw new Error('Invalid number of arguments for listener')
    }

    // Make it possible to chain listeners setup
    //
    //  actionware
    //    .onSuccess(...)
    //    .onCancel(...)
    //    .onError(...)
    //    .before(...)
    //
    return {
      onSuccess,
      onCancel,
      onError,
      before
    }
  }
}

function getListenersNotifier(globalListeners: Array<Function>, typifier: Function) {
  return ({ action, payload, args, error, extras }) => {
    const store = getStore()
    const actionType = typifier(action)

    // Notify global listeners
    globalListeners.forEach(fn => fn.call(null, { action, payload, args, error, store, extras }))

    // Notify individual listeners
    if (individualListeners.hasOwnProperty(actionType)) {
      individualListeners[ actionType ].forEach(fn => fn.call(null, { action, payload, args, error, store, extras }))
    }
  }
}

export const onSuccess = getListenerAdder(globalSuccessListeners, successType)
export const before = getListenerAdder(globalBeforeListeners, busyType)
export const onError = getListenerAdder(globalErrorListeners, errorType)
export const onCancel = getListenerAdder(globalCancellationListeners, cancellationType)

export const notifySuccessListeners = getListenersNotifier(globalSuccessListeners, successType)
export const notifyBeforeListeners = getListenersNotifier(globalBeforeListeners, busyType)
export const notifyErrorListeners = getListenersNotifier(globalErrorListeners, errorType)
export const notifyCancellationListeners = getListenersNotifier(globalCancellationListeners, cancellationType)