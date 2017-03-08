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

  // Process args
  let customName, action, onError;

  if (typeof arguments[ 0 ] === 'string')
    [ customName, action, onError ] = arguments;
  else
    [ action, onError ] = arguments;


  // Validate args
  if (action && typeof action !== 'function')
    throw new Error('Action must be a function');

  if (onError && typeof onError !== 'function')
    throw new Error('ErrorHandler must be a function');


  const generatedName = prefix + Math.random().toString(36).replace('0.', '');
  const successAction = generatedName;
  const errorAction   = `${successAction}_error`;
  const loadingAction = `${successAction}_loading`;


  const smartAction = function() {
    const args = arguments;

    return dispatch => {

      const handleError = (error) => {
        // call action error handler if available
        if (onError) onError({ args, error });

        // call global error listeners
        errorListeners.forEach(fn => fn({ action: smartAction, args, error }));

        // dispatch error action
        dispatch({ type: errorAction, payload: error });
      };

      try {
        // call global loading listeners
        if (action)
          loadingListeners.forEach(fn => fn({ action: smartAction, args }));

        // dispatch loading action
        if (action)
          dispatch({ type: loadingAction, payload: true });

        const actionResponse  = action && action.apply(null, [ ...args, dispatch ]);
        const responsePromise = Promise.resolve(actionResponse);

        return responsePromise.then(
          (payload) => {
            // dispatch success actions
            dispatch({ type: successAction, payload });

            // call global success listeners
            successListeners.forEach(fn => fn({ action: smartAction, args, payload }));
          },
          handleError
        );
      } catch (error) {
        handleError(error);
      }
    };
  };

  // override action.toString() to return success action type
  smartAction.toString = () => successAction;
  smartAction.success  = successAction;
  smartAction.error    = errorAction;
  smartAction.loading  = loadingAction;

  Object.defineProperty(smartAction, 'name', {
    value   : customName || generatedName,
    writable: false
  });

  return smartAction;
}

export function actionwareReducer(state = {}, { type, payload }) {
  if (type.indexOf(prefix) == -1)
    return state;

  const [ generatedName, eventType ] = type.split('_');

  switch (eventType) {
    case 'error':
      return {
        ...state,
        [generatedName + '_error']  : payload,
        [generatedName + '_loading']: false
      };

    case 'loading':
      return {
        ...state,
        [generatedName + '_error']  : false,
        [generatedName + '_loading']: true
      };

    default:
      return {
        ...state,
        [generatedName + '_error']  : false,
        [generatedName + '_loading']: false
      };
  }
}

export function createReducer(initialState, handlers) {
  return function(state = initialState, { type, payload }) {
    return handlers.hasOwnProperty(type)
      ? handlers[ type ](state, payload)
      : state;
  }
}