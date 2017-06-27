import React from 'react';
import createActions from './createActions';

function getDisplayName(wrappedComponent) {
  const wrapperName = wrappedComponent.displayName || wrappedComponent.name || 'Component';
  return `withActions(${wrapperName})`;
}

export function withActions(actions = {}) {
  const trackedActions = createActions(actions);

  return (WrappedComponent: any) => {
    const withActions = (props: object) => <WrappedComponent {...props} {...trackedActions} />;
    withActions.displayName = getDisplayName(WrappedComponent);
    return withActions;
  };
}
