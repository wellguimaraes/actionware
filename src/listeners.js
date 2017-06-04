export const successListeners = [];
export const errorListeners   = [];
export const loadingListeners = [];

export function addSuccessListener(fn) {
  successListeners.push(fn);
}

export function addErrorListener(fn) {
  errorListeners.push(fn);
}

export function addLoadingListener(fn) {
  loadingListeners.push(fn);
}