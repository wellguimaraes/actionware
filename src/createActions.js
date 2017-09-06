import { call } from './call'

export default function (actions) {
  if (typeof actions !== 'object')
    throw new Error('actions argument should be an object')

  return Object
    .keys(actions)
    .reduce((acc, actionName) => {
      acc[ actionName ] = call.bind(null, actions[ actionName ])
      return acc
    }, {})
}
