import createAction from './createAction';

let _callStub: Function = null;

export function call(action, ...args) {
  return _callStub
    ? _callStub.apply(null, [ action, ...args ])
    : createAction(action).apply(null, args);
}

export function setCallStub(callStub) {
  _callStub = callStub;
}
