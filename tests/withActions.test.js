import React from 'react';
import { withActions } from 'withActions';
import jsdom from 'mocha-jsdom';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import { setStore } from 'index';
import { call } from 'index';

const mockStore = configureStore([]);
const store     = mockStore({});

setStore(store);

describe('withActions', () => {
  jsdom();

  let wrapper;

  const actions = {
    loadUsers   : spy(),
    loadUserByPk: spy(),
    login       : () => {
      call(actions.loadUserByPk, 1, 2);
    }
  };

  const MyComponent = ({ loadUsers, login }) =>
    <div>
      <button className="firstButton" onClick={loadUsers}>Click here</button>
      <button className="secondButton" onClick={login}>Click here</button>
    </div>;

  before(() => {
    const ConnectedComponent = withActions(actions)(MyComponent);

    wrapper = mount(
      <Provider store={store}>
        <ConnectedComponent />
      </Provider>
    );
  });

  it('should pass actions to wrapped component', () => {
    let mountedProps = wrapper.find(MyComponent).props();
    expect(typeof mountedProps.loadUsers).to.equal('function');
    expect(mountedProps.loadUsers._wrappedAction).to.equal(actions.loadUsers);
  });

  it('should call action fn with store as last arg', () => {
    wrapper.find('button.firstButton').simulate('click');
    expect(actions.loadUsers.called).to.equal(true);
    expect(actions.loadUsers.getCall(0).args[ 1 ]).to.equal(store);
  });

  it('should call an action from another action with store as last arg', () => {
    wrapper.find('button.secondButton').simulate('click');
    expect(actions.loadUserByPk.called).to.equal(true);
    expect(actions.loadUserByPk.getCall(0).args[ 0 ]).to.equal(1);
    expect(actions.loadUserByPk.getCall(0).args[ 1 ]).to.equal(2);
    expect(actions.loadUserByPk.getCall(0).args[ 2 ]).to.equal(store);
  });
});
