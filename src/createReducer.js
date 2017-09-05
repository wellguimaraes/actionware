import { busyType, errorType, successType } from './createAction'
import { Reducer } from './types'
import { BUSY_TYPE_SUFFIX, CANCELLATION_TYPE_SUFFIX, ERROR_TYPE_SUFFIX } from './constants'

function addHandler(reducer: Reducer, handlers, typifier, ...args) {
  if (args.length < 2)
    throw new Error('You should provide at least an action and a handler')

  const handler = args[ args.length - 1 ]
  const types = args.slice(0, args.length - 1)

  if (typeof handler !== 'function')
    throw new Error('Handler should be a function')

  types.forEach(it => {
    switch (typeof it) {
      case 'string':
        handlers[ it ] = handler
        break

      case 'function':
        handlers[ typifier(it) ] = handler
        break

      default:
        throw new Error('Invalid action/action type')
    }
  })

  return reducer
}

export function createReducer(initialState: any = {}): Reducer {
  const handlers = {}

  const reducer = function (state = initialState, { type, payload, args }) {
    if (handlers.hasOwnProperty(type)) {
      const handler = handlers[ type ]

      if (type.endsWith(BUSY_TYPE_SUFFIX))
        return handler.apply(null, [ state, ...args ])

      if (type.endsWith(ERROR_TYPE_SUFFIX) || type.endsWith(CANCELLATION_TYPE_SUFFIX))
        return handler.apply(null, [ state, payload, ...args ])

      return handler(state, payload)
    } else {
      return state
    }
  }

  reducer.on = addHandler.bind(null, reducer, handlers, successType)
  reducer.onError = addHandler.bind(null, reducer, handlers, errorType)
  reducer.before = addHandler.bind(null, reducer, handlers, busyType)

  return reducer
}