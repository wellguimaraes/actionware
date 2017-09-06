import { saveState } from './stateKeeper'
import { TrackedAction } from './types'
import { BUSY_TYPE, ERROR_TYPE } from './constants'

export function actionwareReducer(state = {}, reduxAction) {
  const payload: any = reduxAction.payload
  const actionwareType: string = reduxAction._actionwareType
  const trackedAction: TrackedAction = reduxAction._trackedAction

  if (!trackedAction) return state

  let nextState = state

  switch (actionwareType) {
    case ERROR_TYPE:
      nextState = {
        ...state,
        [trackedAction._errorType]: payload,
        [trackedAction._busyType]: false
      }
      break

    case BUSY_TYPE:
      nextState = {
        ...state,
        [trackedAction._errorType]: null,
        [trackedAction._busyType]: true
      }
      break

    default:
      nextState = {
        ...state,
        [trackedAction._errorType]: null,
        [trackedAction._busyType]: false
      }
      break
  }

  saveState(nextState)

  return nextState
}
