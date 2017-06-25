import { Action } from './types';

let _waiterMock: Function = null;

export function mockNextWith(waiterMock?: Function) {
  _waiterMock = waiterMock;
}

export function addWaiter(action: Action, promiseCallbacks) {
  action._waiters = action._waiters || [];
  action._waiters.push(promiseCallbacks);
}

export function resolveWaiters(action: Action, payload: any) {
  const waiters = action._waiters || [];
  waiters.forEach(it => it.resolve(payload));
  action._waiters = [];
}

export function rejectWaiters(action: Action, error: Error) {
  const waiters = action._waiters || [];
  waiters.forEach(it => it.reject(error));
  action._waiters = [];
}

export function next(action: Action) {
  if (_waiterMock)
    return _waiterMock(action);

  return new Promise((resolve, reject) => {
    addWaiter(action, { resolve, reject });
  });
}

