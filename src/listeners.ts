import { Action } from "./types";
import { busyType } from "./createAction";
import { errorType } from "./createAction";
import { successType } from "./createAction";

const globalSuccessListeners: Array<Function> = [];
const globalErrorListeners: Array<Function> = [];
const globalBusyListeners: Array<Function> = [];
const individualListeners = {};

function addListener(globalListeners: Array<Function>, typifier: Function, ...args) {
  let action: Action;
  let listener: Function;

  switch (args.length) {
    case 1:
      listener = args[ 0 ];
      break;

    case 2:
      action = args[ 0 ];
      listener = args[ 1 ];
      break;

    default:
      throw new Error('Invalid number of arguments');
  }

  if (!action) {
    globalListeners.push(listener);
  } else {
    const actionType = typifier(action);

    if (!individualListeners.hasOwnProperty(actionType))
      individualListeners[ actionType ] = [];

    individualListeners[ actionType ].push(listener);
  }
}

function notifyListeners(globalListeners: Array<Function>, typifier: Function, action: Action, payload: any, args: Array<any>) {
  let actionType = typifier(action);

  globalListeners.forEach(fn => fn.apply(null, [ action, payload, ...args ]));

  if (individualListeners.hasOwnProperty(actionType)) {
    individualListeners[ actionType ].forEach(fn => fn.apply(null, [ payload, ...args ]));
  }
}

export const addSuccessListener = addListener.bind(null, globalSuccessListeners, successType);
export const addBusyListener = addListener.bind(null, globalBusyListeners, busyType);
export const addErrorListener = addListener.bind(null, globalErrorListeners, errorType);
export const notifySuccessListeners = notifyListeners.bind(null, globalSuccessListeners, successType);
export const notifyBusyListeners = notifyListeners.bind(null, globalBusyListeners, successType);
export const notifyErrorListeners = notifyListeners.bind(null, globalErrorListeners, successType);