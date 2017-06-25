# <img src='https://raw.githubusercontent.com/wellguimaraes/actionware/master/assets/logo.png' height='100'>

[![Build Status](https://travis-ci.org/wellguimaraes/actionware.svg?branch=master)](https://travis-ci.org/wellguimaraes/actionware)
[![Code Climate](https://codeclimate.com/github/wellguimaraes/actionware/badges/gpa.svg)](https://codeclimate.com/github/wellguimaraes/actionware)
[![MIT Licence](https://badges.frapsoft.com/os/mit/mit.png?v=103)](https://opensource.org/licenses/mit-license.php)

Use [Redux](http://redux.js.org/) with less boilerplate, simpler concepts and get actions statuses in a single shot:

- no more strings to identify actions types
- just actions**¹** and reducers (no more action creators and action types)
- actions automatically dispatch their result
- error status for every action with no extra code
- busy status for every async action (yep, no extra code!)

<small>**¹** With Actionware, **actions** have a different meaning. Check usage section to better understand.</small>

## Setup

#### Install it
```
npm i actionware --save
```

#### After creating your Redux store, let Actionware know your store instance:
```js
import { setStore } from 'actionware';

setStore(myAppStore);
```

#### Add actionware reducer to your root reducer:
In order to make Redux store reacts to **busy** and **error** status changes, 
make sure you add the Actionware reducer into your root reducer. 
```js
import { combineReducers } from 'redux';
import { actionwareReducer } from 'actionware';

const rootReducer = combineReducers({ 
  actionware: actionwareReducer,
  // your reducers
});
```

## Usage

#### Simple actions
```js
export function incrementCounter() { }
```

#### Async actions
Whatever you return will be the action payload 

```js
// Note that the store is always the last arg
export async function loadUsers(arg1, arg2, argN, store) {
  const response = await fetch('/my/api/users');
  return response.json();
}
```

#### Invoke any action 
Using `call` is the way to invoke an action and let Actionware handle
the execution lifecycle (managing error and busy statuses, listeners, etc).
```js
import { call } from 'actionware';

call(loadUsers, arg1, arg2, argN);
```

#### Reducers:
```js
import { createReducer } from 'actionware';
import { loadUsers, persistUser, incrementCounter } from 'path/to/actions';

const initialState = { users: [], count: 0 };

export default createReducer(initialState)
  .on(loadUsers, (state, users) => ({ ...state, users }))
  .on(incrementCounter, (state) => ({ ...state, counter: state.counter + 1 }))
  
  // Bind legacy action types
  .on('OLD_ACTION_TYPE' , (state, payload) => { /* return new state */ })
  
  // Bind multiple actions to the same handler
  .on(
    anAction,
    orAnotherAction,
    (state, payload) => { /* return new state */ })
  
  // Actionware handles errors and busy statuses,
  // but if you need to do something else
  
  .onError(loadUsers, (state, error, ...args) => { /* return new state */ })
  .onBusy(loadUsers, (state, isBusy) => { /* return new state */ });
```

#### Busy and failure statuses for all your actions:
```js
import { getError, isBusy } from 'actionware';
import { loadUsers } from 'path/to/userActions';

// Whenever needed...
isBusy(loadUsers);
getError(loadUsers);
```

#### Use listeners to manage side effects:
Note that busy listeners are called when busy status changes. 
```js
import { addSuccessListener, addErrorListener, addBusyListener } from 'actionware';
import { createUser } from 'path/to/actions';

// global success listener
addSuccessListener((action, payload, ...args) => eventTracker.register(action.name));

// per action success listener
addSuccessListener(createUser, (user, ...args) => history.push(`/users/${user.id}`));

// error listeners
addErrorListener((action, error, ...args) => { /* ... */ });
addErrorListener(createUser, (error, ...args) => { /* ... */ });

// busy listeners
addBusyListener((action, isBusy, ...args) => { /* ... */ });
addBusyListener(createUser, (isBusy, ...args) => { /* ... */ });
```

#### Interaction-dependent flows
When you have "complex" flows that depend on some interaction to start or continue,
you can use `next` to wait for some action completion in this fashion:
```js
import { call, next } from 'actionware';
import { login, showTip, acknowledgeTip } from 'path/to/actions';

export async function appEducationFlow() {
  // Wait for the next successful login
  await next(login); 
  
  call(showTip, 'headerButtons');
  await next(acknowledgeTip);
  
  history.redirect('/some/route');
  
  call(showTip, 'sideMenu');
  await next(acknowledgeTip);
}

// At some point, start the flow
appEducationFlow();
```

## Usage with React
 
#### Inject actions and status into components as props
By using `withActions` to wrap a component, actions are injected into it as props 
and can be invoked without using `call`. 
```js
import * as React from 'react';
import { connect } from 'react-redux';
import { withActions, isBusy, getError } from 'actionware';
import { loadUsers } from 'path/to/actions';

class MyConnectedComponent extends Component {
  componentDidMount() {
    this.props.loadUsers();    
  }
  
  render() {
    const { loading, error } = this.props;
    
    if (loading) return (<div>Loading...</div>);
    if (error) return (<div>Failed to load users...</div>);
    
    return (
      <div>
        {users.map(it => <User key={it.id} {...it} />)}
      </div>
    );
  }
}

const actions = { loadUsers };

const mapStateToProps = ({ company }) => ({
  users   : company.users,
  loading : isBusy(loadUsers),
  error   : getError(loadUsers)
});

export default connect(mapStateToProps)(
  withActions(actions)(MyConnectedComponent)
);
```

## Testing

#### Mock `call` and `next` functions
While testing, you're able to replace the `call` and `next` functions by custom 
spy/stub to simplify tests.
```js
import { mockCallWith, mockNextWith } from 'actionware';

const callSpy = sinon.spy();
const nextStub = sinon.stub().returns(Promise.resolve());

mockCallWith(callSpy);
mockNextWith(nextStub);

// Get back to default behavior
mockCallWith(null); 
mockNextWith(null); 
```

#### Reducers
For testing reducers, you can do the following:

```js
import { successType } from 'actionware';
import { loadUsers } from 'path/to/userActions';
import usersReducer from 'path/to/usersReducer';

describe('usersReducer', () => {
  describe('on loadUsers', () => {
    it('should replace the "users" array with the loaded users', () => {
      const currentState = { users: [ ] }; 
      const loadedUsers = [ 'John Doe', 'Joane Doe', 'Steve Gates' ];

      // Call reducer with currentState and a regular Redux action       
      const newState = usersReducer(
        currentState, 
        { type: successType(loadUsers), payload: loadedUsers }
      );
      
      expect(newState.items).to.equals(loadedUsers);
    });  
  });
});
```

## API

#### Setup  
- **setStore**(store: object): void

#### Most used
- **withActions**(actions: object): Function(wrappedComponent: Component)
- **isBusy**(action: Function): bool
- **getError**(action: Function): object
- **call**(action: Function, ...args)
- **next**(action: Function)
- **createReducer**(initialState: object, handlers: []): Function

#### Listeners

###### Global
- **addSuccessListener**(listener: (action, payload, ...args) => void)
- **addErrorListener**(listener: (action, error, ...args) => void)
- **addBusyListener**(listener: (action, isBusy, ...args) => void)

###### Per action
- **addSuccessListener**(action: Function, listener: (payload, ...args) => void)
- **addErrorListener**(action: Function, listener: (error, ...args) => void)
- **addBusyListener**(action: Function, listener: (isBusy, ...args) => void)

#### Test helpers
- **mockCallWith**(fakeCall: Function)
- **mockNextWith**(fakeNext: Function)
- **successType**(action: Function)
- **errorType**(action: Function)
- **busyType**(action: Function)

## License
[MIT](LICENSE) &copy; Wellington Guimaraes