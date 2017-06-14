import createAction from 'createAction';

function getActionType(descriptor) {
  switch (typeof descriptor) {
    case 'function':
      if (!descriptor.hasOwnProperty('_actionware'))
        createAction(descriptor);

      return descriptor.success;

    case 'string':
      return descriptor;
  }
}

export default function(initialState, handlers) {
  if (!initialState)
    throw new Error('Initial state should be provided');

  if (!handlers || !Array.isArray(handlers))
    throw new Error('Handlers array should be provided');

  let isInvalidHandler = (it, i) => i % 2 === 0
    ? ![ 'string', 'function' ].includes(typeof it)
    : typeof it !== 'function';

  if (handlers.length < 2 || handlers.some(isInvalidHandler))
    throw new Error('Handlers array is not in the correct format');

  let pendingKey = null;

  const handlerMap = handlers.reduce((prev, curr, i) => {
    if (i % 2 === 0)
      pendingKey = getActionType(curr);
    else
      prev[ pendingKey ] = curr;

    return prev;
  }, {});

  return function(state = initialState, { type, payload }) {
    return handlerMap.hasOwnProperty(type)
      ? handlerMap[ type ](state, payload)
      : state;
  }
}