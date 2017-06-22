import createAction from './createAction';

function toArrayOfTypes(types) {
  return Array.isArray(types) ? types : [types];
}

function getActionTypes(types): string[] {
  return toArrayOfTypes(types).map(
    it =>
      typeof it === 'string' ? it : createAction(it)._wrappedAction._successType
  );
}

/**
 * Create a reducer function based on a initial state and given handlers
 *
 * @param initialState
 * @param handlers      should be an array with an even number of items with every two
 *                      subsequent items being action type and action handler respectively
 *
 * @returns reducer function
 */
export default function(initialState: any, handlers: any[]) {
  if (!initialState) {
    throw new Error('Initial state should be provided');
  }

  if (!handlers || !Array.isArray(handlers)) {
    throw new Error('Handlers array should be provided');
  }

  const isValidActionType = actionType => {
    const types = toArrayOfTypes(actionType);
    return (
      types.length &&
      types.every(it => ['string', 'function'].indexOf(typeof it) > -1)
    );
  };

  const isValidHandler = (it, i) =>
    i % 2 === 0 ? isValidActionType(it) : typeof it === 'function';

  if (
    handlers.length < 2 ||
    handlers.length % 2 === 1 ||
    !handlers.every(isValidHandler)
  ) {
    throw new Error('Handlers array is not in the correct format');
  }

  let pendingTypes: string[] = null;

  const reducerHandlers = handlers.reduce((handlersMap, curr, i) => {
    if (i % 2 === 0) {
      pendingTypes = getActionTypes(curr);
    } else {
      pendingTypes.forEach(key => (handlersMap[key] = curr));
    }

    return handlersMap;
  }, {});

  return function(state = initialState, { type, payload }) {
    if (reducerHandlers.hasOwnProperty(type)) {
      const handler = reducerHandlers[type];
      return payload && payload.actionwareError
        ? handler.apply(null, [state, payload.error, ...payload.args])
        : handler(state, payload);
    } else {
      return state;
    }
  };
}
