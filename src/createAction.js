import getActionName from './getActionName';
import { Action } from './types';
import { Store } from './types';
import { TrackedAction } from './types';
import { NAME_PREFIX } from './constants';
import { ERROR_TYPE_SUFFIX } from './constants';
import { BUSY_TYPE_SUFFIX } from './constants';
import { getStore } from './storeKeeper';
import { rejectWaiters } from './next';
import { resolveWaiters } from './next';
import { notifyErrorListeners } from './listeners';
import { notifyBusyListeners } from './listeners';
import { notifySuccessListeners } from './listeners';

export default function createAction(action: Action): TrackedAction {
  if (typeof action !== 'function')
    throw new Error('Action must be a function');

  if (action._trackedAction)
    return action._trackedAction;

  const trackedAction = function(...args) {

    const store: Store = getStore();
    const handleSuccess = handleActionSuccess.bind(null, action, args);
    const handleError = handleActionError.bind(null, action, args);
    const handleBusy = handleActionBusy.bind(null, action, args);

    try {
      const actionResponse = action.apply(null, [ ...args, store ]);
      const isAsync = actionResponse instanceof Promise;

      if (isAsync) {
        handleBusy();

        return actionResponse.then(
          handleSuccess,
          err => Promise.reject(handleError(err))
        );
      }

      return handleSuccess(actionResponse);

    } catch (error) {
      handleError(error);
      throw error;
    }
  };

  const actionName = getActionName(NAME_PREFIX, action.name, action);

  trackedAction._successType = actionName;
  trackedAction._busyType = actionName + BUSY_TYPE_SUFFIX;
  trackedAction._errorType = actionName + ERROR_TYPE_SUFFIX;

  action._trackedAction = trackedAction;

  return trackedAction;
}

export function handleActionSuccess(action: Action, args, payload) {
  const store: Store = getStore();

  store.dispatch({
    trackedAction: action._trackedAction,
    type: action._trackedAction._successType,
    payload
  });

  notifySuccessListeners(action, payload, args);
  notifyBusyListeners(action, false, args);
  resolveWaiters(action, payload);

  return payload;
}

export function handleActionBusy(action: Action, args) {
  const store: Store = getStore();

  store.dispatch({
    trackedAction: action._trackedAction,
    type: action._trackedAction._busyType,
    payload: true
  });

  notifyBusyListeners(action, true, args);
}

export function handleActionError(action: Action, args, error: Error) {
  const store: Store = getStore();

  const payload = { error, args, actionwareError: true };

  store.dispatch({
    trackedAction: action._trackedAction,
    type: action._trackedAction._errorType,
    payload
  });

  notifyErrorListeners(action, error, args);
  rejectWaiters(action, error);

  return error;
}

export function errorType(action: Action) {
  return createAction(action)._errorType;
}

export function successType(action: Action) {
  return createAction(action)._successType;
}

export function busyType(action: Action) {
  return createAction(action)._busyType;
}
