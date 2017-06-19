import React from 'react';
import createActions from './createActions';

function getDisplayName(WrappedComponent) {
  const wrapperName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  return `withActions(${wrapperName})`;
}

export default function(actions = {}) {
  const smartActions = createActions(actions);

  return WrappedComponent => {
    const withActions       = props => <WrappedComponent {...props} {...smartActions} />;
    withActions.displayName = getDisplayName(WrappedComponent);
    return withActions;
  };
}
