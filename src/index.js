const prefix = 'actionware:';

export function createAction(action = () => {}) {

  const randomName         = Math.random().toString(36).replace('0.', '');
  const smartActionName    = prefix + randomName;
  const smartActionError   = `${smartActionName}_error`;
  const smartActionLoading = `${smartActionName}_loading`;

  const smartAction = function() {
    const args = arguments;

    return dispatch => {
      try {
        dispatch({ type: smartActionLoading, payload: true });

        const actionResponse  = action.apply(null, [ ...args, dispatch ]);
        const responsePromise = actionResponse instanceof Promise
          ? actionResponse
          : Promise.resolve(actionResponse);

        responsePromise.then(
          (payload) => dispatch({ type: smartActionName, payload }),
          (err) => dispatch({ type: smartActionError, payload: err })
        );

      } catch (err) {
        dispatch({ type: smartActionError, payload: err });
      }
    };
  };

  smartAction.toString = () => smartActionName;
  smartAction.error    = smartActionError;
  smartAction.loading  = smartActionLoading;

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
        [actionName + '_error']  : payload,
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

export function createReducer(initialState, handlers) {
  return (state = initialState, action) =>
    handlers.hasOwnProperty(action.type)
      ? handlers[ action.type ](state, action)
      : state;
}