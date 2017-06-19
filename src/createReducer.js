import createAction from './createAction';

function getTypesArray(types) {
  return Array.isArray(types) ? types : [ types ];
}

function getActionType(types) {
  return getTypesArray(types).map(
    it => (typeof it === 'string' ? it : createAction(it).success)
  );
}

export default function(initialState, handlers) {
  if (!initialState) throw new Error('Initial state should be provided');

  if (!handlers || !Array.isArray(handlers))
    throw new Error('Handlers array should be provided');

  const isValidActionType = actionType => {
    const types = getTypesArray(actionType);
    return (
      types.length &&
      types.every(it => [ 'string', 'function' ].includes(typeof it))
    );
  };

  const isValidHandler = (it, i) =>
    i % 2 === 0 ? isValidActionType(it) : typeof it === 'function';

  if (
    handlers.length < 2 ||
    handlers.length % 2 === 1 ||
    !handlers.every(isValidHandler)
  )
    throw new Error('Handlers array is not in the correct format');

  let pendingKeys = null;

  const handlerMap = handlers.reduce((map, curr, i) => {
    if (i % 2 === 0) pendingKeys = getActionType(curr);
    else pendingKeys.forEach(key => (map[ key ] = curr));

    return map;
  }, {});

  return function(state = initialState, { type, payload }) {
    if (handlerMap.hasOwnProperty(type)) {
      let handler = handlerMap[ type ];
      return payload && payload._actionwareError
        ? handler.apply(null, [ state, payload.error, ...payload.args ])
        : handler(state, payload);
    } else {
      return state;
    }
  };
}
