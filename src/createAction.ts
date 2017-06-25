import getActionName from './getActionName';
import { Action } from './types';
import { ActionData } from './types';
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
  if (typeof action !== 'function') {
    throw new Error('Action must be a function');
  }

  if (action._trackedAction) {
    return action._trackedAction;
  }

  const uniqueName = getActionName(NAME_PREFIX, action.name, action);
  const successType = uniqueName;
  const errorType = uniqueName + ERROR_TYPE_SUFFIX;
  const busyType = uniqueName + BUSY_TYPE_SUFFIX;

  const trackedAction = <TrackedAction>function (...args) {
    let store: Store<ActionData> = getStore<ActionData>();

    // Handle errors upon action execution
    const handleError = (error: Error) => {
      store.dispatch({
        trackedAction,
        type: errorType,
        payload: {error, args, actionwareError: true}
      });

      notifyErrorListeners(action, error, args);
      rejectWaiters(action, error);
    };

    try {
      // call global busy listeners
      const actionResponse = action.apply(null, [ ...args, store ]);
      const isAsync = actionResponse instanceof Promise;
      const payloadPromise = Promise.resolve(actionResponse);

      if (isAsync) {
        // dispatch busy action
        store.dispatch({trackedAction, type: busyType, payload: true});
        notifyBusyListeners(action, true, args);
      }

      // prettier-ignore
      return payloadPromise.then(
        payload => {
          // dispatch success actions
          store.dispatch({trackedAction, type: successType, payload});

          // call global success listeners
          notifySuccessListeners(action, payload, args);
          notifyBusyListeners(action, false, args);
          resolveWaiters(action, payload);
        },
        error => {
          handleError(error);
          return Promise.reject(error);
        }
      );
    } catch (error) {
      handleError(error);
      throw error;
    }
  };

  // The only change made in the action object
  action._trackedAction = trackedAction;

  trackedAction._wrappedAction = action;
  trackedAction._successType = successType;
  trackedAction._busyType = busyType;
  trackedAction._errorType = errorType;

  return trackedAction;
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
