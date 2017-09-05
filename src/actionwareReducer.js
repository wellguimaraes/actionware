import { saveState } from './stateKeeper'
import { BUSY_TYPE_SUFFIX, ERROR_TYPE_SUFFIX } from './constants'
import { TrackedAction } from './types'

export function actionwareReducer(state = {}, action) {
  const type: string = action.type
  const payload: any = action.payload
  const trackedAction: TrackedAction = action.trackedAction

  if (!trackedAction) return state

  let nextState = state

  if (type.endsWith(ERROR_TYPE_SUFFIX))
    nextState = {
      ...state,
      [trackedAction._errorType]: payload,
      [trackedAction._busyType]: false
    }
  else if (type.endsWith(BUSY_TYPE_SUFFIX))
    nextState = {
      ...state,
      [trackedAction._errorType]: null,
      [trackedAction._busyType]: true
    }
  else
    nextState = {
      ...state,
      [trackedAction._errorType]: null,
      [trackedAction._busyType]: false
    }

  saveState(nextState)

  return nextState
}
