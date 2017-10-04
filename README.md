# ![Actionware](assets/logo.png)

[![Build Status](https://travis-ci.org/wellguimaraes/actionware.svg?branch=master)](https://travis-ci.org/wellguimaraes/actionware)
[![Code Climate](https://codeclimate.com/github/wellguimaraes/actionware/badges/gpa.svg)](https://codeclimate.com/github/wellguimaraes/actionware)
[![Gitter chat](https://badges.gitter.im/gitterHQ/gitter.png)](https://gitter.im/actionwarejs)

[Redux](http://redux.js.org/) with less boilerplate, actions statuses and controlled side-effects in a single shot. 

- no more **action creators** and **action types**, just **actions¹** and **reducers**
- **actions** dispatch their result automatically
- **error status** for every action with no extra code
- **busy status** for every async action (yep, no extra code!)
- **cancellable** actions

<small>**¹** With Actionware, **actions** have a different meaning: they're just functions which execution generate events. 
See [usage](#usage) section to better understand.</small>

###### Extra power
Wanna have state selectors/getters in a decent way? Use it combined with **[Stateware](https://github.com/wellguimaraes/stateware)** lib.

## Setup

#### Install it
- Yarn: `yarn add actionware`
- NPM: `npm i actionware --save`

#### After creating your Redux store, let Actionware know your store instance. Optionally you
can define custom action types prefix and suffixes:
```js
import * as actionware from 'actionware';

actionware.setup({
  store,
  defaultPrefix, // default: 'actionware:'
  errorSuffix,   // default: ':error'
  cancelSuffix,  // default: ':cancel'
  busySuffix     // default: ':busy'
});
```

#### Add actionware reducer to your root reducer:
To make Redux store react to **busy** and **error** status changes, 
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
Use `call` to invoke an action and let Actionware handle
the execution lifecycle (managing error and busy statuses, notifying listeners, etc).
```js
import { call } from 'actionware';

call(loadUsers, arg1, arg2, argN);
```

#### Cancel an action execution
```js
import { call } from 'actionware';

const actionCall = call(loadUsers, arg1, arg2, argN);

actionCall.cancel()
```

To cancel inner calls or other async executions, use `setExtra` inside an async action 
to keep information needed and use them on a cancellation listener:
```js
import { call, onCancel} from 'actionware';
import api from './path/to/api';

// Don't use arrow functions here, 
// otherwise a context value can't be set
export async function someAction() {
  const apiCall = api.get('/some/endpoint')
  const anotherActionCall = call(anotherAction, 'someParam')
  
  this.setExtra({ apiCall })
  this.setExtra({ anotherActionCall }) // you can call it multiple times
    
  const apiResponse = await apiCall
  const anotherResponse = await anotherActionCall
  
  // ...
  
  return apiResponse.data
}

export async function anotherAction() {
  // ...
}

onCancel(someAction, ({ extras }) => {
  // Check if the action execution is still cancellable
  if (extras.anotherActionCall.canBeCancelled)
    extras.anotherActionCall.cancel()
    
  // Cancel the api call...
})
```

#### Reducers:
```js
import { createReducer } from 'actionware';
import { loadUsers, persistUser, incrementCounter } from 'path/to/actions';

const initialState = { users: [], count: 0 };

export default createReducer(initialState)
  .on(loadUsers, 
    (state, users) => ({ ...state, users }))
  
  .on(incrementCounter, 
    (state) => ({ ...state, counter: state.counter + 1 }))
  
  // Bind legacy action types
  .on('OLD_ACTION_TYPE',
    (state, payload) => { /* return new state */ })
  
  // Bind multiple actions to the same handler    
  .on(
    someAction, 
    anotherAction,
    (state, payload) => { /* return new state */ })
  
  // Actionware handles errors, cancellation and 'before' events,
  // but if you need to do something else
  
  .onError(persistUser, 
    (state, error, ...args) => { /* return new state */ })
    
  .onCancel(loadUsers, 
    (state, extras, ...args) => { /* return new state */ })
  
  .before(loadUsers, 
    (state, ...args) => { /* return new state */ });
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
import { onSuccess, onError, onCancel, before, beforeAll } from 'actionware';
import { createUser } from 'path/to/actions';

// global success listener
onSuccess(({ action, args, payload, store }) => eventTracker.register(action.name));

// per action success listener
onSuccess(createUser, ({ args, payload, store }) => history.push(`/users/${user.id}`));

// error listeners
onError(({ action, args, error }) => { /* ... */ });
onError(createUser, ({ args, error }) => { /* ... */ });

// cancellation listeners
onCancel(({ action, args, extras }) => { /* ... */ });
onCancel(createUser, ({ args, extras }) => { /* ... */ });

// before listeners 
// NOTE: 'beforeAll' is just an alias for 'before'
beforeAll(({ action, args, store}) => { /* ... */ });
before(createUser, ({ args, store }) => { /* ... */ });
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

const actions = { loadUsers };

const mapStateToProps = ({ company }) => ({
  users   : company.users,
  loading : isBusy(loadUsers),
  error   : getError(loadUsers)
});

@connect(mapStateToProps)
@withActions(actions)
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
        { users.map(it => <User key={it.id} {...it} />) }
      </div>
    );
  }
}

export default MyConnectedComponent
```

#### Without injecting actions as props
In case you prefer not injecting actions as props into your component, you can use `createActions` this way:
```js
import { createActions } from 'actionware'

const actions = createActions('optionalPrefix:', {
  someAction,
  anotherAction
})

const MyComponent = () => (
  <div>
    <button onClick={ actions.someAction }></button>
  </div>
)

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
- **setup**({ store, defaultPrefix?, errorSuffix?, busySuffix?, cancelSuffix? }): void

#### Most used
- **withActions**(actions: object): Function(wrappedComponent: Component)
- **createActions**(actions: object): object
- **isBusy**(action: Function): bool
- **getError**(action: Function): object
- **call**(action: Function, ...args)
- **next**(action: Function)
- **createReducer**(initialState: object, handlers: []): Function

#### Listeners

###### Global
- **onSuccess**(listener: ({ action, payload, args, store }) => void)
- **onError**(listener: ({ action, error, args, store }) => void)
- **beforeAll**(listener: ({ action, args, store}) => void)

###### Per action
- **onSuccess**(action: Function, listener: ({ payload, args, store }) => void)
- **onError**(action: Function, listener: ({ error, args, store }) => void)
- **before**(action: Function, listener: ({ args, store }) => void)

#### Test helpers
- **mockCallWith**(fakeCall: Function)
- **mockNextWith**(fakeNext: Function)
- **successType**(action: Function)
- **errorType**(action: Function)
- **busyType**(action: Function)

## License
[MIT](LICENSE) &copy; Wellington Guimaraes
