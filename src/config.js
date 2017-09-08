import { Store } from './types'

let _store: Store = null
let _defaultPrefix: string = 'actionware:'
let _errorSuffix: string = ':error'
let _busySuffix: string = ':busy'
let _cancelSuffix: string = ':cancel'

export function setup({ store, defaultPrefix = 'actionware:', errorSuffix = ':error', busySuffix = ':busy', cancelSuffix = ':cancel' }) {
  _store = store
  _defaultPrefix = defaultPrefix
  _errorSuffix = errorSuffix
  _busySuffix = busySuffix
  _cancelSuffix = cancelSuffix
}

export function setStore(store) {
  _store = store
}

export function getStore(): Store {
  if (_store === null) throw new Error('Actionware: store has not been set')
  return _store
}

export function getDefaultPrefix(): string {
  return _defaultPrefix
}

export function getErrorSuffix(): string {
  return _errorSuffix
}

export function getBusySuffix(): string {
  return _busySuffix
}

export function getCancelSuffix(): string {
  return _cancelSuffix
}