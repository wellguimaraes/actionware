import { Store } from './types'

let _store: Store = null

export function setStore(store: Store) {
  _store = store
}

export function getStore(): Store {
  if (_store === null) throw new Error('Store has not been set')
  return _store
}