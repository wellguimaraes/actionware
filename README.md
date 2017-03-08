# Actionware
Less boilerplate with Redux: 
- get rid of strings to identify actions
- loading and error states for every action with no extra code.

#### Requirements
Actionware is intended to be used with __Redux__ and __Redux-Thunk__.

# API
- `createAction([actionName], action, [errorHandler])`
  1. **actionName**: string *(optional)*
  2. **action**: function(...args, dispatch)
  3. **errorHandler**: function({ args, error }) *(optional)*
- `createReducer(initialState: any, reducers: object)`
- `addSuccessListener(listener: function({ action, args, payload }))`
- `addErrorListener(listener: function({ action, args, payload }))`
- `addLoadingListener(listener: function({ action, args, payload }))`

# Use it

##### Action creators (with async/await syntax):
```js
import { createAction } from 'actionware';

export const loadUsers = createAction(
  'optionalActionName',
  
  // dispatch fn is available if you need it
  async (arg1, argN, dispatch) => {
    
    const response = await fetch('/my/api/users');
    const users    = response.json();
    
    // whatever you return, will be the action payload
    return users;
    
  },
  
  // optional error handler
  ({ args, error }) => {
    // ...
  }
)
```

##### Action creators (with Promises):
```js
import { createAction } from 'actionware';

export const loadUsers = createAction(
  'optionalActionName',
  
  // dispatch fn is available if you need it
  (arg1, argN, dispatch) => {
    
    // whatever you return in the Promise, 
    // will be the action payload
    return fetch('/my/api/users')
      .then(response => {
        const users = response.json();
        return users;
      });
  },
  
  // optional error handler
  ({ args, error }) => {
    // ...
  }
)
```

##### Reducers:
```js
import { createReducer } from 'actionware';
import { loadUsers }     from 'path/to/actionCreators';

const initialState = { users: [] };

export default createReducer(initialState, {
  [loadUsers] (state, payload) {
    return { 
      ...state,
      users: payload
    };
  },
  
  // Actionware handle errors and loading statuses,
  // but if you need to do something else,
  // the payload here is the error
  [loadUsers.error] (state, payload) {
    return {
      ...state,
      //...
    }
  },
  
  // Payload is a boolean indicating if the action is loading
  [loadUsers.loading] (state, payload) {
    return {
      ...state,
      //...
    }
  },
});
```

##### Add actionware reducer to your root reducer:
```js
import { combineReducers }   from 'redux';
import { actionwareReducer } from 'actionware';
import userReducer           from 'path/to/usersReducer';

export default combineReducers({
  users     : userReducer,
  actionware: actionwareReducer
});
```

##### Now you have loading and failure statuses for all your actions:
```js
import { loadUsers } from 'path/to/actionCreators';

function mapStateToProps(state) {
  return {
    loading: state.actionware[loadUsers.loading],
    error  : state.actionware[loadUsers.error]
  }
}
```

##### Add event listeners:
```js
import { 
  addSuccessListener, 
  addErrorListener, 
  addLoadingListener 
} from 'actionware';

// Here's where the optional action name may be useful

addSuccessListener(({ action, args, payload }) => {
  console.log(action.name);
});

addErrorListener(({ action, args, error }) => {
  console.log(action.name);
});

addLoadingListener(({ action, args }) => {
  console.log(action.name);
});
```
