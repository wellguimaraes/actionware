# <img src='https://raw.githubusercontent.com/wellguimaraes/actionware/master/assets/actionware-logo.png' height='60'>

Redux with less boilerplate, side-effects under control and action statuses in a single pack:
- no need to dispatch actions
- get rid of strings to identify actions types
- error status for every action with no extra code
- loading status for every async action (yep, no extra code!)

\* Since it's a little bit confusing to have _action types_, _action creators_ and _actions_, with **Actionware**, you have just _actions_ which are actually simple named functions.

# API

#### Setup  
- **setStore**(store: object): void

#### Most used
- **withActions**(actions: object): Function(wrappedComponent: Component)
- **isLoading**(action: Function): bool
- **getError**(action: Function): object
- **call**(action: Function, ...args)

#### Reducers related
- **createReducer**(initialState: object, handlers: []): function
- **on**(...actions: Function|string): Array<string>
- **onError**(action: Function): string
- **onLoading**(action: Function): string

#### Setting-up global listeners

- **addSuccessListener**(listener: Function(action, payload, ...args) => void)
- **addErrorListener**(listener: Function(action, error, ...args) => void)
- **addLoadingListener**(listener: Function(action, isLoading, ...args) => void)

#### Test helpers
- **mockCallsWith**(fakeCall: Function)
- **successType**(action: Function)
- **errorType**(action: Function)
- **loadingType**(action: Function)

# Use it

#### After creating you Redux store and before using actions:

```js
import { setStore } from 'actionware';

setStore(myAppStore);
```

#### Simple actions:
```js
export function incrementCounter() { }
```

#### Async actions:
```js
export async function loadUsers(arg1, arg2, argN, store) { // the last arg is always the store
  const response = await fetch('/my/api/users');
  
  // whatever you return will be the action payload 
  return response.json();
}
```

#### Optional per action success and error handlers:
```js
loadUsers.onSuccess = (payload, arg1, arg2, argN, store) => {
  // ...
}

loadUsers.onError = (error, arg1, arg2, argN) => {
  // ...
}
```

#### Injecting actions into components as props:
This way, action functions are handled by Actionware
```js
import { withActions } from 'actionware';
import { loadUsers } from 'path/to/actions';

class MyConnectedComponent extends Component {
  componentDidMount() {
    this.props.loadUsers();    
  }
}

export default withActions({ loadUsers })(MyConnectedComponent);
```

#### If you're not inside a component, use call to invoke any action: 
Using `call` is the way to invoke a function (action) and let Actionware handle
the its execution lifecycle (managing error and loading statuses, listeners, etc).
```js
import { call } from 'actionware';

export async function somewhereOverTheRainbow() {
  await call(loadUsers, arg1, arg2, argN);
}
```

#### Reducers:
```js
import { createReducer, on, onError, onLoading } from 'actionware';
import { loadUsers, incrementCounter } from 'path/to/actions';

const initialState = { users: [], count: 0 };

export default createReducer(initialState, [
  on(incrementCounter), 
  (state) => {
    // return new state
  },
  
  on(loadUsers), 
  (state, users) => {
    // return new state
  },
  
  // multiple actions using the same handler
  on(anAction, anotherAction), 
  (state, payload) => { 
    // return new state
  },
  
  //
  // Actionware handles errors and loading statuses,
  // but if you need to do something else...
  //
  
  onError(loadUsers), 
  (state, error, ...args) => {
    // return new state
  },
  
  onLoading(loadUsers), 
  (state, isLoading) => {
    // return new state
  }
]);
```

#### Add actionware reducer to your root reducer:
```js
import { combineReducers } from 'redux';
import { actionwareReducer as actionware } from 'actionware';
import users from 'path/to/usersReducer';

const rootReducer = combineReducers({ users, actionware });
```

#### Now you have loading and failure statuses for all your actions:
```js
import { connect } from 'react-redux'; 
import { getError, isLoading, withActions } from 'actionware';
import { loadUsers } from 'path/to/actions';

class MyComponent extends React.Component {
  // ...  
}

// whenever you need some action loading/error states, just map them
function mapStateToProps(state) {
  return {
    something : state.something,
    loading   : isLoading(loadUsers),
    error     : getError(loadUsers)
  };
}

export default connect(mapStateToProps)(
  withActions({ loadUsers })(MyComponent)
)
```

#### Add global listeners:
```js
import { 
  addSuccessListener, 
  addErrorListener, 
  addLoadingListener 
} from 'actionware';

addSuccessListener((action, payload, ...args) => {
  console.log(action.name);
});

addErrorListener((action, error, ...args) => {
  console.log(action.name);
});

addLoadingListener((action, isLoading, ...args) => {
  console.log(action.name);
});
```

# Testing

#### Mock `call` function
While testing, you're able to replace the `call` function by a custom spy/stub to 
check side-effect calls.
```js
import { mockCallsWith } from 'actionware';

const callSpy = sinon.spy();

mockCallsWith(callSpy);
mockCallsWith(null); // Whenever needed, get back to default behavior
```

#### Reducers
For testing reducers (created with `createReducers`), you can do the following:

```js
import { successType } from 'actionware';
import itemsReducer from 'path/to/itemsReducer';
import { loadItems } from 'path/to/itemsActions';

describe('itemsReducer', () => {
  describe('on loadItems', () => {
    it('should replace "items" by the loaded items array', () => {
      const currentState = { items: [ 'something'] }; 
      const loadedItems = [ 'lorem', 'ipsum', 'dolor' ];

      // Call reducer with currentState and a regular Redux action       
      const newState = itemsReducer(currentState, { 
        type: successType(loadItems), 
        payload: loadedItems
      });
      
      expect(newState.items).to.equals(loadedItems);
    });  
  });
});
```