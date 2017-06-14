import createAction from './createAction';

export default function(actions) {
  if (typeof actions !== 'object')
    throw new TypeError('actions argument should be an object');

  const createdActions = {};

  Object.keys(actions).forEach(actionName => {
    createdActions[ actionName ] = createAction(actions[ actionName ]);
  });

  return createdActions;
}