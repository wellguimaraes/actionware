# Actionware
Use Redux with less boilerplate:
- get rid of strings to identify actions
- loading and error states for every action with no extra code.

# API
- **setStore**(store: object): void
- **connect**(mapStateToProps: func, actions: object): function(wrapperComponent: Component)
- **call**(action: function, ...args)
- **createReducer**(initialState: object, handlers: []): function
- **loading**(action: function): string
- **error**(action: function): string
- **addSuccessListener**(listener: function({ action, args, payload }))
- **addErrorListener**(listener: function({ action, args, payload }))
- **addLoadingListener**(listener: function({ action, args, payload }))

# Use it

##### After creating you Redux store and before using actions:

```js
import * as actionware from 'actionware';

// ...

actionware.setStore(myAppStore);
```

##### Actions:
```js
import { call } from 'actionware';

// Simple action
export const incrementCounter = () => {}

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

export async function anotherAction() {
  // from an action, use call to invoke any other action 
  await call(loadUsers, arg1, arg2, argN);
}
```

##### Injecting actions into components as props:
```js
import { connect } from 'actionware';
import { loadUsers, incrementCounter } from 'path/to/actions';

class MyConnectedComponent extends Component {
  // ...
}

const mapStateToProps = (state) => state;
const actions = { loadUsers, incrementCounter };

// IMPORTANT: this is not the connect fn from 'react-redux'
export default connect(mapStateToProps, actions)(MyConnectedComponent);

```

##### Reducers:
```js
import { createReducer, error, loading } from 'actionware';
import { loadUsers, incrementCounter } from 'path/to/actions';

const initialState = { users: [], count: 0 };

export default createReducer(initialState, [
  incrementCounter, (state) => {
    return { 
      ...state, 
      count: state.count + 1
    };  
  },
  
  loadUsers, (state, users) => {
    return { ...state, users };
  },
  
  // Actionware handles errors and loading statuses,
  // but if you need to do something else...

  error(loadUsers), (state, error, ...args) => {
    return {
      ...state,
      //...
    }
  },
  
  loading(loadUsers), (state, isLoading) => {
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
import { error, loading } from 'actionware';
import { loadUsers } from 'path/to/actions';

// whenever you need some action loading/error states, just map them
function mapStateToProps({ actionware }) {
  return {
    loading: actionware[loading(loadUsers)],
    error  : actionware[error(loadUsers)]
  };
}
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
