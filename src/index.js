import createAction from './createAction';
import { getActionState } from './actionState';
export { addSuccessListener } from './listeners';
export { addErrorListener } from './listeners';
export { addLoadingListener } from './listeners';
export actionwareReducer from './actionwareReducer';
export createReducer from './createReducer';
export withActions from './withActions';
export default from './createActions';

let _store = null;

export function setStore(store) {
  _store = store;
}

export function getStore() {
  if (_store === null) throw new Error('Store has not been set');

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

export function on(...actions) {
  return actions.map(action =>
    typeof action === 'string'
      ? action
      : createAction(action).success
  );
}

export function onLoading(action) {
  return loading(action);
}

export function onError(action) {
  return error(action);
}

export function isLoading(action) {
  return getActionState()[ loading(action) ] || false;
}

export function getError(action) {
  return getActionState()[ error(action) ] || null;
}
