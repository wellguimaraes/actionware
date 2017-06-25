import * as React from 'react';
import createActions from './createActions';

// prettier-ignore
function getDisplayName(wrappedComponent: any) {
  const wrapperName = wrappedComponent.displayName || wrappedComponent.name || 'Component';
  return `withActions(${wrapperName})`;
}

// prettier-ignore
export function withActions(actions = {}) {
  const trackedActions = createActions(actions);

  return (WrappedComponent: any) => {
    const withActions: any = (props: object) => <WrappedComponent {...props} {...trackedActions} />;
    withActions.displayName = getDisplayName(WrappedComponent);
    return withActions;
  };
}
