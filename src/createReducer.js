import { successType, busyType, errorType } from './createAction';
import { Reducer } from "./types";

function addHandler(reducer: Reducer, handlers, typifier, ...args) {
  if (args.length < 2)
    throw new Error('You should provide at least an action and a handler');

  const types = args.slice(0, args.length - 1);
  const handler = args[ types.length ];

  if (typeof handler !== 'function')
    throw new Error('Handler should be a function');

  types.forEach(it => {
    switch (typeof it) {
      case 'string':
        handlers[ it ] = handler;
        break;

      case 'function':
        handlers[ typifier(it) ] = handler;
        break;

      default:
        throw new Error('Invalid action/action type');
    }
  });

  return reducer;
}

export function createReducer(initialState: any = {}): Reducer {
  const handlers = {};

  const reducer = function (state = initialState, {type, payload}) {
    if (handlers.hasOwnProperty(type)) {
      const handler = handlers[ type ];
      return payload && payload.actionwareError
        ? handler.apply(null, [ state, payload.error, ...payload.args ])
        : handler(state, payload);
    } else {
      return state;
    }
  };

  reducer.on = addHandler.bind(null, reducer, handlers, successType);
  reducer.onError = addHandler.bind(null, reducer, handlers, errorType);
  reducer.onBusy = addHandler.bind(null, reducer, handlers, busyType);

  return reducer;
}