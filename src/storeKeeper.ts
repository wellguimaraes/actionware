import { Store } from "./types";

let _store: Store<any> = null;

export function setStore<S>(store: Store<S>) {
  _store = store;
}

export function getStore<S>(): Store<S> {
  if (_store === null) throw new Error('Store has not been set');
  return _store;
}