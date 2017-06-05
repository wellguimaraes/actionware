import getActionName from './getActionName';
import { errorListeners } from './listeners';
import { loadingListeners } from './listeners';
import { successListeners } from './listeners';
import { prefix } from './constants';

export default function(actionName, action) {
  if (action.invoke)
    return action.invoke;

  const generatedName = getActionName(prefix, actionName, action);
  const successAction = generatedName;
  const errorAction   = `${generatedName}_error`;
  const loadingAction = `${generatedName}_loading`;

  const smartAction = function() {
    const args = arguments;

    return (dispatch, getState) => {

      const handleError = (error) => {
        // call action error handler if available
        if (action.onError) {
          action.onError({ args, error });
        }

        // call global error listeners
        errorListeners.forEach(fn => fn({ action: smartAction, args, error }));

        // dispatch error action
        dispatch({ type: errorAction, payload: error });
      };

      try {
        // call global loading listeners
        if (action) {
          loadingListeners.forEach(fn => fn({ action: smartAction, args }));
        }

        // dispatch loading action
        if (action) {
          dispatch({ type: loadingAction, payload: true });
        }

        const actionResponse  = action && action.apply(action, [ ...args, dispatch, getState ]);
        const responsePromise = Promise.resolve(actionResponse);

        return responsePromise.then(
          (payload) => {
            // dispatch success actions
            dispatch({ type: successAction, payload });

            if (typeof action.onSuccess === 'function') {
              action.onSuccess.apply(null, { payload, args, dispatch });
            }

            // call global success listeners
            successListeners.forEach(fn => fn({ action: smartAction, args, payload }));
          },
          handleError,
        );
      } catch (error) {
        handleError(error);
      }
    };
  };

  action.toString = () => successAction;
  action.success  = successAction;
  action.error    = errorAction;
  action.loading  = loadingAction;
  action.invoke   = smartAction;

  smartAction.toString   = () => successAction;
  smartAction.success    = successAction;
  smartAction.error      = errorAction;
  smartAction.loading    = loadingAction;
  smartAction.actionName = actionName;

  return smartAction;
}