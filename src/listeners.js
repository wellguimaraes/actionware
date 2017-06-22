import { Action } from './types';

export const successListeners: Array<(action: Action, payload: any, ...args: any[]) => void> = [];
export const errorListeners: Array<(action: Action, error: Error, ...args: any[]) => void> = [];
export const loadingListeners: Array<(action: Action, isLoading: boolean, ...args: any[]) => void> = [];

export function addSuccessListener(fn: (action: Action, payload: any, ...args: any[]) => void) {
  successListeners.push(fn);
}

export function addErrorListener(fn: (action: Action, error: Error, ...args: any[]) => void) {
  errorListeners.push(fn);
}

export function addLoadingListener(fn: (action: Action, isLoading: boolean, ...args: any[]) => void) {
  loadingListeners.push(fn);
}