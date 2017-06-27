import React from 'react';
import jsdom from 'mocha-jsdom';
import { mount } from 'enzyme';
import { withActions } from 'withActions';
import { Provider } from 'react-redux';
import { setStore } from 'storeKeeper';
import { call } from 'call';
import { getStore } from 'storeKeeper';

const store = { dispatch: spy(), getState: spy() };

setStore(store);

describe('withActions', () => {
  jsdom();

  let wrapper;

  const actions = {
    loadUsers: spy(),
    loadUserByPk: spy(),
    login: () => {
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
  });

  it('should call action fn with store as last arg', () => {
    const store = getStore();

    wrapper.find('button.firstButton').simulate('click');
    expect(actions.loadUsers.called).to.equal(true);
    expect(actions.loadUsers.getCall(0).args[ 1 ]).to.equal(store);
  });

  it('should call an action from another action with store as last arg', () => {
    const store = getStore();

    wrapper.find('button.secondButton').simulate('click');
    expect(actions.loadUserByPk.called).to.equal(true);
    expect(actions.loadUserByPk.getCall(0).args[ 0 ]).to.equal(1);
    expect(actions.loadUserByPk.getCall(0).args[ 1 ]).to.equal(2);
    expect(actions.loadUserByPk.getCall(0).args[ 2 ]).to.equal(store);
  });
});
