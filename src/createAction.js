import getActionName from './getActionName';
import { errorListeners } from './listeners';
import { loadingListeners } from './listeners';
import { successListeners } from './listeners';
import { prefix } from './constants';
import { getStore } from './';

export default function(action) {
  if (typeof action !== 'function')
    throw new Error('Action must be a function');

  if (action.hasOwnProperty('_actionware')) return action._actionware;

  const actionName    = action.name;
  const generatedName = getActionName(prefix, actionName, action);
  const successAction = generatedName;
  const errorAction   = `${generatedName}_error`;
  const loadingAction = `${generatedName}_loading`;

  const smartAction = function() {
    const args = arguments;

    let store = getStore();

    const { dispatch } = store;

    const handleError = error => {
      // call action error handler if available
      if (action.onError) action.onError.apply(null, [ error, ...args ]);

      // call global error listeners
      errorListeners.forEach(fn => fn.apply(null, [ smartAction, error, ...args ]));

      // dispatch error action
      dispatch({ type: errorAction, payload: { error, args, _actionwareError: true } });
    };

    try {
      // call global loading listeners

      const actionResponse  = action.apply(null, [ ...args, store ]);
      const isAsync         = actionResponse instanceof Promise;
      const responsePromise = Promise.resolve(actionResponse);

      if (isAsync) {
        // dispatch loading action
        dispatch({ type: loadingAction, payload: true });
        loadingListeners.forEach(fn => fn.apply(null, [ smartAction, true, ...args ]));
      }

      return responsePromise.then(
        payload => {
          // dispatch success actions
          dispatch({ type: successAction, payload });

          if (typeof action.onSuccess === 'function')
            action.onSuccess.apply(null, [ payload, ...args, store ]);

          // call global success listeners
          successListeners.forEach(fn => fn.apply(null, [ smartAction, payload, ...args ]));
          loadingListeners.forEach(fn => fn.apply(null, [ smartAction, false, ...args ]));
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

  action.toString    = () => successAction;
  action.success     = successAction;
  action.error       = errorAction;
  action.loading     = loadingAction;
  action._actionware = smartAction;

  smartAction.toString   = () => successAction;
  smartAction.success    = successAction;
  smartAction.error      = errorAction;
  smartAction.loading    = loadingAction;
  smartAction.actionName = actionName;
  smartAction.type       = 'actionware';

  return smartAction;
}
