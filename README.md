# Actionware
Less boilerplate with Redux + loading and error states for every action with no extra code.

# Use it

Action creators:
```js
import { createAction } from 'actionware';

export const loadUsers = createAction(
  'loadUsers', // this name is optional
  
  // if you need, dispatch fn is available as the last arg
  async (arg1, ..., argN, dispatch) => {
  
    // call the api and do something...
    // you can throw exceptions and actionware will handle them
  
    // whatever you return, will be the action payload
    return users;
    
  }
)
```


Reducers:
```js
import { createReducer } from 'actionware';
import { loadUsers } from 'path/to/actionCreators';

const initialState = { users: [] };

export default createReducer(initialState, {
  [loadUsers] (state, payload) {
    return { 
      ...state,
      users: payload
    };
  }
});
```

Add actionware reducer to your root reducer:
```js
import { combineReducers } from 'redux';
import { actionwareReducer } from 'actionware';
import userReducer from 'path/to/usersReducer';

export default combineReducers({
  users     : userReducer,
  actionware: actionwareReducer
});
```

Now you have loading and failure statuses for all your actions:
```js
import { loadUsers } from 'path/to/actionCreators';

// Some React component code...

function mapStateToProps(state) {
  return {
    loading: state.actionware[loadUsers.loading],
    error  : state.actionware[loadUsers.error]
  }
}

export default connect(mapStateToProps)(SomeContainer);
```
