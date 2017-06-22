import getActionName from './getActionName';
import { Action, ReduxStore, TrackedAction } from './types';
import { errorListeners } from './listeners';
import { loadingListeners } from './listeners';
import { successListeners } from './listeners';
import { prefix } from './constants';
import { getStore } from './';
import { errorTypeSuffix } from './constants';
import { loadingTypeSuffix } from './constants';

export default function(action: Action): TrackedAction {
  if (typeof action !== 'function') {
    throw new Error('Action must be a function');
  }

  if (action._trackedAction) {
    return action._trackedAction;
  }

  const uniqueName = getActionName(prefix, action.name, action);

  action._successType = uniqueName;
  action._errorType = uniqueName + errorTypeSuffix;
  action._loadingType = uniqueName + loadingTypeSuffix;
  action.toString = () => uniqueName;

  const trackedAction: TrackedAction = function(...args) {
    let store: ReduxStore = getStore();

    // Handle errors upon action execution
    const handleError = (error: Error) => {
      if (typeof action.onError === 'function')
        action.onError.apply(null, [error, ...args]);

      errorListeners.forEach(fn => fn.apply(null, [action, error, ...args]));
      store.dispatch({
        action,
        type: action._errorType,
        payload: { error, args, actionwareError: true }
      });
    };

    try {
      // call global loading listeners
      const actionResponse = action.apply(null, [...args, store]);
      const isAsync = actionResponse instanceof Promise;
      const payloadPromise = Promise.resolve(actionResponse);

      if (isAsync) {
        // dispatch loading action
        store.dispatch({ action, type: action._loadingType, payload: true });
        loadingListeners.forEach(fn => fn.apply(null, [action, true, ...args]));
      }

      // prettier-ignore
      return payloadPromise.then(
        payload => {
          // dispatch success actions
          store.dispatch({ action, type: action._successType, payload });

          if (typeof action.onSuccess === 'function')
            action.onSuccess.apply(null, [ payload, ...args, store ]);

          // call global success listeners
          successListeners.forEach(fn => fn.apply(null, [ action, payload, ...args ]));
          loadingListeners.forEach(fn => fn.apply(null, [ action, false, ...args ]));
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

  action._trackedAction = trackedAction;
  trackedAction._wrappedAction = action;

  return trackedAction;
}
