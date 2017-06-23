import { Action } from 'types';

let _waiterMock: Function = null;

export function mockNextWith(waiterMock?: Function) {
  _waiterMock = waiterMock;
}

export function addWaiter(action: Action, promiseCallbacks) {
  action._waiters = action._waiters || [];
  action._waiters.push(promiseCallbacks);
}

export function resolveWaiters(action) {
  const waiters = action._waiters;
  waiters.forEach(it => it.resolve());
  action._waiters = [];
}

export function rejectWaiters(action) {
  const waiters = action._waiters;
  waiters.forEach(it => it.reject());
  action._waiters = [];
}

export function next(action) {
  if (_waiterMock)
    return _waiterMock(action);

  return new Promise((resolve, reject) => {
    addWaiter(action, { resolve, reject });
  });
}

