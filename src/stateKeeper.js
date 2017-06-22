import createAction from './createAction';

let currentState = {};

export function saveState(newState) {
  currentState = newState;
}

export function isLoading(action) {
  return currentState[createAction(action)._wrappedAction._loadingType] || false;
}

export function getError(action) {
  return currentState[createAction(action)._wrappedAction._errorType] || null;
}