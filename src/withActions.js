import React from 'react';
import createActions from './createActions';

// prettier-ignore
function getDisplayName(WrappedComponent) {
  const wrapperName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  return `withActions(${wrapperName})`;
}

// prettier-ignore
export default function(actions = {}) {
  const trackedActions = createActions(actions);

  return WrappedComponent => {
    const withActions = props => <WrappedComponent {...props} {...trackedActions} />;
    withActions.displayName = getDisplayName(WrappedComponent);
    return withActions;
  };
}
