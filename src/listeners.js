import { busyType } from './createAction';
import { errorType } from './createAction';
import { successType } from './createAction';

const globalSuccessListeners: Array<Function> = [];
const globalErrorListeners: Array<Function> = [];
const globalBusyListeners: Array<Function> = [];
const individualListeners = {};

function addListener(globalListeners: Array<Function>, typifier: Function, ...args) {
  switch (args.length) {
    // global listener
    case 1:
      globalListeners.push(args[ 0 ]);
      break;

    // action listener
    case 2:
      const listener = args[ 1 ];
      const actionType = typifier(args[ 0 ]);

      if (!individualListeners.hasOwnProperty(actionType))
        individualListeners[ actionType ] = [ listener ];
      else
        individualListeners[ actionType ].push(listener);

      break;

    default:
      // Invalid arguments
      throw new Error('Invalid number of arguments');
  }
}

function notifyListeners(globalListeners: Array<Function>, typifier: Function, action, payload, args: Array<any>) {
  const actionType = typifier(action);

  // Notify global listeners
  globalListeners.forEach(fn => fn.apply(null, [ action, payload, ...args ]));

  // Notify individual listeners
  if (individualListeners.hasOwnProperty(actionType)) {
    individualListeners[ actionType ].forEach(fn => fn.apply(null, [ payload, ...args ]));
  }
}

export const addSuccessListener = addListener.bind(null, globalSuccessListeners, successType);
export const addBusyListener = addListener.bind(null, globalBusyListeners, busyType);
export const addErrorListener = addListener.bind(null, globalErrorListeners, errorType);

export const notifySuccessListeners = notifyListeners.bind(null, globalSuccessListeners, successType);
export const notifyBusyListeners = notifyListeners.bind(null, globalBusyListeners, busyType);
export const notifyErrorListeners = notifyListeners.bind(null, globalErrorListeners, errorType);