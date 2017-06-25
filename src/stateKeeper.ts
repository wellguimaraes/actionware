import createAction from './createAction';
import { Action } from "./types";

let currentState: any = {};

export function saveState(newState: any) {
  currentState = newState;
}

export function isBusy(action: Action) : boolean {
  return currentState[ createAction(action)._busyType ] || false;
}

export function getError(action: Action) : any {
  return currentState[ createAction(action)._errorType ] || null;
}