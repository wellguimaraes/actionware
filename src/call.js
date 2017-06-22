import createAction from './createAction';

let _callMock: Function = null;

export function call(action, ...args) {
  return _callMock
    ? _callMock.apply(null, [ action, ...args ])
    : createAction(action).apply(null, args);
}

export function mockCallsWith(callStub?: Function) {
  _callMock = callStub;
}
