let _store = null;

export function setStore(store) {
  _store = store;
}

export function getStore() {
  if (_store === null) throw new Error('Store has not been set');
  return _store;
}