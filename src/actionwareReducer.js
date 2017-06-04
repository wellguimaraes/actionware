import { prefix } from './constants';

export default function(state = {}, { type, payload }) {
  if (type.indexOf(prefix) === -1) {
    return state;
  }

  const [ generatedName, eventType ] = type.split('_');

  switch (eventType) {
    case 'error':
      return {
        ...state,
        [generatedName + '_error']  : payload,
        [generatedName + '_loading']: false,
      };

    case 'loading':
      return {
        ...state,
        [generatedName + '_error']  : false,
        [generatedName + '_loading']: true,
      };

    default:
      return {
        ...state,
        [generatedName + '_error']  : false,
        [generatedName + '_loading']: false,
      };
  }
}