import getActionName from './getActionName';
import { Action } from './types';
import { ReduxStore } from './types';
import { TrackedAction } from './types';
import { NAME_PREFIX } from './constants';
import { ERROR_TYPE_SUFFIX } from './constants';
import { LOADING_TYPE_SUFFIX } from './constants';
import { getStore } from './storeKeeper';
import { rejectWaiters } from './next';
import { resolveWaiters } from './next';
import { notifyErrorListeners } from './listeners';
import { notifyLoadingListeners } from './listeners';
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
  const loadingType = uniqueName + LOADING_TYPE_SUFFIX;

  const trackedAction: TrackedAction = function(...args) {
    let store: ReduxStore = getStore();

    // Handle errors upon action execution
    const handleError = (error: Error) => {
      if (typeof action.onError === 'function')
        action.onError.apply(null, [error, ...args]);

      store.dispatch({
        trackedAction,
        type: errorType,
        payload: { error, args, actionwareError: true }
      });

      notifyErrorListeners(action, error, args);
      rejectWaiters(action);
    };

    try {
      // call global loading listeners
      const actionResponse = action.apply(null, [...args, store]);
      const isAsync = actionResponse instanceof Promise;
      const payloadPromise = Promise.resolve(actionResponse);

      if (isAsync) {
        // dispatch loading action
        store.dispatch({ trackedAction, type: loadingType, payload: true });
        notifyLoadingListeners(action, true, args);
      }

      // prettier-ignore
      return payloadPromise.then(
        payload => {
          // dispatch success actions
          store.dispatch({ trackedAction, type: successType, payload });

          if (typeof action.onSuccess === 'function')
            action.onSuccess.apply(null, [ payload, ...args, store ]);

          // call global success listeners
          notifySuccessListeners(action, payload, args);
          notifyLoadingListeners(action, false, args);
          resolveWaiters(action);
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
  trackedAction._loadingType = loadingType;
  trackedAction._errorType = errorType;

  return trackedAction;
}

export function errorType(action: Action) {
  return createAction(action)._errorType;
}

export function successType(action: Action) {
  return createAction(action)._successType;
}

export function loadingType(action: Action) {
  return createAction(action)._loadingType;
}
