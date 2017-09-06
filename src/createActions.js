import { call } from './call'
import { getDefaultPrefix } from './config'

/**
 * Create tracked actions object, where every key is a tracked action
 *
 * @param prefix optional action events prefix
 * @param actions
 * @returns {*}
 */
export function createActions(prefix: string | object, actions) {
  if (prefix && !actions) {
    actions = prefix
    prefix = getDefaultPrefix()
  }

  if (typeof actions !== 'object')
    throw new Error('actions argument should be an object')

  return Object
    .keys(actions)
    .reduce((acc, actionName) => {
      const action = actions[ actionName ]
      action._prefix = prefix
      acc[ actionName ] = call.bind(null, action)
      return acc
    }, {})
}
