import createAction from './createAction';
export { addSuccessListener } from './listeners'
export { addErrorListener } from './listeners'
export { addLoadingListener } from './listeners'
export actionwareReducer from './actionwareReducer';
export createReducer from './createReducer';
export connect from './connect';
export default from './createActions';

let _store = null;

export function setStore(store) {
  _store = store;
}

export function getStore() {
  if (_store === null)
    throw new Error('Store has not been set');

  return _store;
}

export function call(action, ...args) {
  return createAction(action).apply(null, args);
}

export function error(action) {
  return createAction(action).error;
}

export function loading(action) {
  return createAction(action).loading;
}