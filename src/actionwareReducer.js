import { prefix } from './constants';
import { setActionState } from 'actionState';

export default function(state = {}, { type, payload }) {
  if (type.indexOf(prefix) === -1)
    return state;

  const [ generatedName, eventType ] = type.split('_');

  let nextState = state;

  switch (eventType) {
    case 'error':
      nextState = {
        ...state,
        [generatedName + '_error']  : payload,
        [generatedName + '_loading']: false
      };
      break;

    case 'loading':
      nextState = {
        ...state,
        [generatedName + '_error']  : false,
        [generatedName + '_loading']: true
      };
      break;

    default:
      nextState = {
        ...state,
        [generatedName + '_error']  : false,
        [generatedName + '_loading']: false
      };
      break;
  }

  setActionState(nextState);

  return nextState;
}