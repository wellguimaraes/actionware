export default function(initialState, handlers) {
  let resolvedHandlers = null;

  return function(state = initialState, { type, payload }) {
    if (!resolvedHandlers) {
      if (type.startsWith('@@redux'))
        return initialState;

      resolvedHandlers = handlers();
    }

    return resolvedHandlers.hasOwnProperty(type)
      ? resolvedHandlers[ type ](state, payload)
      : state;
  }
}