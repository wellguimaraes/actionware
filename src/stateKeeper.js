import createAction from './createAction'
import { Action } from './types'

let currentState = {}

export function saveState(newState) {
  currentState = newState
}

export function isBusy(action: Action): boolean {
  return currentState[ createAction(action)._busyType ] || false
}

export function getError(action: Action) {
  return currentState[ createAction(action)._errorType ] || null
}