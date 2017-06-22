import { NAME_PREFIX } from './constants';
import { saveState } from './stateKeeper';
import { ERROR_TYPE_SUFFIX } from './constants';
import { LOADING_TYPE_SUFFIX } from './constants';

export default function(state = {}, { type, payload, trackedAction = null }) {
  if (type.indexOf(NAME_PREFIX) === -1) return state;

  let nextState = state;

  if (type.endsWith(ERROR_TYPE_SUFFIX))
    nextState = {
      ...state,
      [trackedAction._errorType]  : payload,
      [trackedAction._loadingType]: false
    };
  else if (type.endsWith(LOADING_TYPE_SUFFIX))
    nextState = {
      ...state,
      [trackedAction._errorType]  : false,
      [trackedAction._loadingType]: true
    };
  else
    nextState = {
      ...state,
      [trackedAction._errorType]  : false,
      [trackedAction._loadingType]: false
    };

  saveState(nextState);

  return nextState;
}
