export default function(initialState, handlers) {
  return function(state = initialState, { type, payload }) {
    return handlers.hasOwnProperty(type)
      ? handlers[ type ](state, payload)
      : state;
  }
}