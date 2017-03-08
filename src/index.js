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

export function createAction() {

  let actionName, action, onError;

  if (typeof arguments[ 0 ] === 'string')
    [ actionName, action, onError ] = arguments;
  else
    [ action, onError ] = arguments;

  const successEvent = prefix + Math.random().toString(36).replace('0.', '');
  const errorEvent   = `${successEvent}_error`;
  const loadingEvent = `${successEvent}_loading`;

  const smartAction = function() {
    const args = arguments;

    return dispatch => {

      const handleError = (error) => {
        onError && onError({ actionName, args, error });
        errorListeners.forEach(fn => fn({ actionName, args, error }));
        dispatch({
          type   : errorEvent,
          payload: { error, actionName }
        });
      };

      try {
        loadingListeners.forEach(fn => fn({ actionName, args }));
        dispatch({ type: loadingEvent, payload: true });

        const actionResponse  = action && action.apply(null, [ ...args, dispatch ]);
        const responsePromise = Promise.resolve(actionResponse);

        return responsePromise.then(
          (payload) => {
            dispatch({ type: successEvent, payload });
            successListeners.forEach(fn => fn({ actionName, args, payload }));
          },
          handleError
        );
      } catch (error) {
        handleError(error);
      }

    };
  };

  smartAction.toString = () => successEvent;
  smartAction.success  = successEvent;
  smartAction.error    = errorEvent;
  smartAction.loading  = loadingEvent;

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

export function createReducer(initialState = {}, handlers) {
  return function(state = initialState, { type, payload }) {
    return handlers.hasOwnProperty(type)
      ? handlers[ type ](state, payload)
      : state;
  }
}