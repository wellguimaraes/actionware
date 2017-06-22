import { prefix } from './constants';
import { saveState } from './stateKeeper';
import { errorTypeSuffix } from './constants';
import { loadingTypeSuffix } from './constants';

export default function(state = {}, { type, payload, action = null }) {
  if (type.indexOf(prefix) === -1) return state;

  let nextState = state;

  if (type.endsWith(errorTypeSuffix))
    nextState = {
      ...state,
      [action._errorType]  : payload,
      [action._loadingType]: false
    };
  else if (type.endsWith(loadingTypeSuffix))
    nextState = {
      ...state,
      [action._errorType]  : false,
      [action._loadingType]: true
    };
  else
    nextState = {
      ...state,
      [action._errorType]  : false,
      [action._loadingType]: false
    };

  saveState(nextState);

  return nextState;
}
