import React from 'react';
import { connect } from 'react-redux';
import createActions from './createActions';

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

export default function(mapStateToProps, actions) {
  const smartActions = createActions(actions);
  return WrappedComponent => {
    const withProps = props =>
      <WrappedComponent {...props} {...smartActions} />;

    withProps.displayName = getDisplayName(WrappedComponent);

    return connect(mapStateToProps)(withProps);
  };
}
