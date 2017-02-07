const prefix = 'actionware:';

const successListeners = [];
const errorListeners   = [];
const loadingListeners = [];

export function addSuccessListener(fn) {
  successListeners.push(fn);
}

export function addErrorListener(fn) {
  errorListeners.push(fn);
}

export function addLoadingListener(fn) {
  loadingListeners.push(fn);
}

export function createAction(actionName, action = () => {}, onError = () => {}) {

  const randomKey       = Math.random().toString(36).replace('0.', '');
  const successEventKey = prefix + randomKey;
  const errorEventKey   = `${successEventKey}_error`;
  const loadingEventKey = `${successEventKey}_loading`;

  const smartAction = function() {
    const args = arguments;

    return dispatch => {
      try {
        loadingListeners.forEach(fn => fn({ actionName, args }));
        dispatch({ type: loadingEventKey, payload: true });

        const actionResponse  = action.apply(null, [ ...args, dispatch ]);
        const responsePromise = actionResponse instanceof Promise
          ? actionResponse
          : Promise.resolve(actionResponse);

        return responsePromise.then(
          (payload) => {
            dispatch({ type: successEventKey, payload });
            successListeners.forEach(fn => fn({ actionName, args, payload }));
          },
          (error) => {
            onError({ actionName, args, error });
            errorListeners.forEach(fn => fn({ actionName, args, error }));
            dispatch({
              type   : errorEventKey,
              payload: { error, actionName }
            });
          }
        );
      } catch (error) {
        onError({ actionName, args, error });
        errorListeners.forEach(fn => fn({ actionName, args, error }));
        dispatch({ type: errorEventKey, payload: { error, actionName } });
      }
    };
  };

  smartAction.toString = () => successEventKey;
  smartAction.success  = successEventKey;
  smartAction.error    = errorEventKey;
  smartAction.loading  = loadingEventKey;

  return smartAction;
}

export function actionwareReducer(state = {}, { type, payload }) {
  if (type.indexOf(prefix) == -1)
    return state;

  const [ actionName, actionType ] = type.split('_');

  switch (actionType) {
    case 'error':
      return {
        ...state,
        [actionName + '_error']  : payload.error,
        [actionName + '_loading']: false
      };

    case 'loading':
      return {
        ...state,
        [actionName + '_error']  : false,
        [actionName + '_loading']: true
      };

    default:
      return {
        ...state,
        [actionName + '_error']  : false,
        [actionName + '_loading']: false
      };
  }
}