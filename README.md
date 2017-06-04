# Actionware
Less boilerplate with Redux: 
- get rid of strings to identify actions
- loading and error states for every action with no extra code.

#### Requirements
Actionware is intended to be used with __Redux__ and __Redux-Thunk__.

# API
- **createActions**(actions: object)    
- **createReducer**(initialState: any, reducers: object)
- **addSuccessListener**(listener: function({ action, args, payload }))
- **addErrorListener**(listener: function({ action, args, payload }))
- **addLoadingListener**(listener: function({ action, args, payload }))

# Use it

##### Action creators (with async/await syntax):
```js
// Functions can return Promises (async)
export async function loadUsers(arg1, argN, dispatch, getState) {
  const response = await fetch('/my/api/users');
  const users    = response.json();
  
  // whatever you return will be the action payload
  return users;    
};

// Optional error handler
loadUsers.onError = ({ args, error }) => {
  console.error(error);
}
```

##### Using react-redux to inject action creators as props:
```js
import connect from 'react-redux/lib/components/connect';
import actionware from 'actionware';

class MyConnectedComponent extends Component {
  // ...
}

const mapStateToProps = (state) => {
  
}

const actions = actionware({
  loadUsers,
});

export default connect(mapStateToProps, actions)(MyConnectedComponent)

```

const actions = createActions{}


##### Reducers:
```js
import { createReducer } from 'actionware';
import { loadUsers, incrementCounter } from 'path/to/actionCreators';

const initialState = { users: [], count: 0 };

export default createReducer(initialState, {
  [incrementCounter] (state) {
    return { 
      ...state, 
      count: state.count++ 
    };  
  },
  
  [loadUsers] (state, payload) {
    return { 
      ...state,
      users: payload
    };
  },
  
  // Actionware handles errors and loading statuses,
  // but if you need to do something else,
  // the payload here is the error caught
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

// whenever you need some action loading/error states, just map them
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
  console.log(action.actionName);
});

addErrorListener(({ action, args, error }) => {
  console.log(action.actionName);
});

addLoadingListener(({ action, args }) => {
  console.log(action.actionName);
});
```
