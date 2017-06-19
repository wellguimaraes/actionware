# Actionware
Redux with less boilerplate, side-effects under control and action statuses in a single pack:
- no need to dispatch actions
- get rid of strings to identify actions types
- error status for every action with no extra code
- loading status for every async action (yep, no extra code!)

\* Since it's a little bit confusing to have _action types_, _action creators_ and _actions_, with **Actionware**, you have just _actions_ which are actually simple named functions.

# API
- **setStore**(store: object): void
- **withActions**(actions: object): function(wrapperComponent: Component)
- **call**(action: function, ...args)
- **createReducer**(initialState: object, handlers: []): function
- **isLoading**(action: function): bool
- **getError**(action: function): object
- **on**(...action: function|string): Array<string>
- **onError**(action: function): string
- **onLoading**(action: function): string
- **addSuccessListener**(listener: function({ action, args, payload }))
- **addErrorListener**(listener: function({ action, args, payload }))
- **addLoadingListener**(listener: function({ action, args, payload }))

# Use it

##### After creating you Redux store and before using actions:

```js
import { setStore } from 'actionware';

setStore(myAppStore);
```

##### Simple actions:
```js
export const incrementCounter = () => {}
```

##### Async actions:
```js
// Actions can return Promises (async)
export async function loadUsers(arg1, arg2, argN, store) { // the last arg is always the store
  const response = await fetch('/my/api/users');
  
  // whatever you return will be the action payload 
  return response.json();   
}

// Optional success handler
loadUsers.onSuccess = ({ args, payload, store }) => {
  // ...
}

// Optional error handler
loadUsers.onError = ({ args, error }) => {
  // ...
}
```

##### If you're not inside a component, use call to invoke any action: 
```js
import { call } from 'actionware';

export async function anotherAction() {
  // ...
  await call(loadUsers, arg1, arg2, argN);
}
```

##### Injecting actions into components as props:
```js
import { withActions } from 'actionware';
import { loadUsers, incrementCounter } from 'path/to/actions';

class MyConnectedComponent extends Component {
  // ...
}

const actions = { loadUsers, incrementCounter };

export default withActions(actions)(MyConnectedComponent);
```

##### Reducers:
```js
import { createReducer, on, onError, onLoading } from 'actionware';
import { loadUsers, incrementCounter } from 'path/to/actions';

const initialState = { users: [], count: 0 };

export default createReducer(initialState, [
  on(incrementCounter), 
  (state) => {
    return { 
      ...state, 
      count: state.count + 1
    };  
  },
  
  on(loadUsers), (state, users) => {
    return { ...state, users };
  },
  
  // Actionware handles errors and loading statuses,
  // but if you need to do something else...

  onError(loadUsers), 
  (state, error, ...args) => {
    return {
      ...state,
      //...
    }
  },
  
  onLoading(loadUsers), 
  (state, isLoading) => {
    return {
      ...state,
      //...
    }
  }
]);
```

##### Add actionware reducer to your root reducer:
```js
import { combineReducers } from 'redux';
import { actionwareReducer as actionware } from 'actionware';
import users from 'path/to/usersReducer';

const rootReducer = combineReducers({
  users,
  actionware
});
```

##### Now you have loading and failure statuses for all your actions:
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
    //...
    loading: isLoading(loadUsers),
    error  : getError(loadUsers)
  };
}

const actions = { loadUsers };

export default connect(mapStateToProps)(
  withActions(actions)(MyComponent)
)
```

##### Add global listeners:
```js
import { 
  addSuccessListener, 
  addErrorListener, 
  addLoadingListener 
} from 'actionware';

// Here's where the optional action name may be useful

addSuccessListener((action, payload, ...args) => {
  console.log(action.actionName);
});

addErrorListener((action, error, ...args) => {
  console.log(action.actionName);
});

addLoadingListener((action, isLoading, ...args) => {
  console.log(action.actionName);
});
```
