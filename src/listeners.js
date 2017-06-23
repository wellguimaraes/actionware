import { Action } from './types';

const successListeners = [];
const errorListeners = [];
const loadingListeners = [];

export function addSuccessListener(
  fn: (action: Action, payload: any, ...args: any[]) => void
) {
  successListeners.push(fn);
}

export function addErrorListener(
  fn: (action: Action, error: Error, ...args: any[]) => void
) {
  errorListeners.push(fn);
}

export function addLoadingListener(
  fn: (action: Action, isLoading: boolean, ...args: any[]) => void
) {
  loadingListeners.push(fn);
}

export function notifyErrorListeners(action, error, args) {
  errorListeners.forEach(fn => fn.apply(null, [action, error, ...args]));
}

export function notifyLoadingListeners(action, isLoading, args) {
  loadingListeners.forEach(fn => fn.apply(null, [action, isLoading, ...args]));
}

export function notifySuccessListeners(action, payload, args) {
  successListeners.forEach(fn => fn.apply(null, [action, payload, ...args]));
}
