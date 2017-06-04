export default function(initialState, handlers) {
  let resolvedHandlers = null;

  return function(state = initialState, { type, payload }) {
    if (!resolvedHandlers)
      resolvedHandlers = handlers();

    return resolvedHandlers.hasOwnProperty(type)
      ? resolvedHandlers[ type ](state, payload)
      : state;
  }
}