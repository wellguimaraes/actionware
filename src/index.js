import createAction from './createAction';

export { getError, isLoading } from './stateKeeper';
export { addSuccessListener } from './listeners';
export { addErrorListener } from './listeners';
export { addLoadingListener } from './listeners';

export actionwareReducer from './actionwareReducer';
export withActions from './withActions';
export createReducer from './createReducer';

let _store = null;
let _callStub: Function = null;

export function setStore(store) {
  _store = store;
}

export function getStore() {
  if (_store === null) throw new Error('Store has not been set');
  return _store;
}

export function call(action, ...args) {
  return _callStub
    ? _callStub.apply(null, [action, ...args])
    : createAction(action).apply(null, args);
}

//
// Reducer creation helpers
//
export function on(...actions) {
  return actions.map(
    action =>
      typeof action === 'string'
        ? action
        : createAction(action)._wrappedAction._successType
  );
}

export function onLoading(action) {
  return createAction(action)._wrappedAction._loadingType;
}

export function onError(action) {
  return createAction(action)._wrappedAction._errorType;
}

//
// Test helpers
//
export function setCallStub(callStub) {
  _callStub = callStub;
}
