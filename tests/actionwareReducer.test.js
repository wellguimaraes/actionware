import createAction from '../src/createAction'
import { actionwareReducer } from '../src/actionwareReducer'
import { BUSY_TYPE_SUFFIX, ERROR_TYPE_SUFFIX } from '../src/constants'
import { getError, isBusy } from '../src/stateKeeper'

describe('ActionwareReducer', () => {
  const wrappedAction = function () {}
  const trackedAction = createAction(wrappedAction)

  it('should return previous state if no trackedAction is provided', () => {
    const previousState = {}
    const newState = actionwareReducer(previousState, { type: 'lorem', payload: 1 })
    expect(newState).to.equal(previousState)
  })

  it('should save new state', () => {
    const action = { type: 'success', trackedAction }
    actionwareReducer({}, action)

    expect(getError(wrappedAction)).to.equal(null)
    expect(isBusy(wrappedAction)).to.equal(false)
  })

  describe('on error event', () => {
    const action = { type: ERROR_TYPE_SUFFIX, payload: new Error('err'), trackedAction }
    const newState = actionwareReducer({}, action)

    it('should set error state to the given payload', () => {
      expect(newState[ trackedAction._errorType ]).to.instanceOf(Error)
    })

    it('should set busy state to false', () => {
      expect(newState[ trackedAction._busyType ]).to.equal(false)
    })
  })

  describe('on busy event', () => {
    const action = { type: BUSY_TYPE_SUFFIX, trackedAction }
    const newState = actionwareReducer({}, action)

    it('should set error state to null', () => {
      expect(newState[ trackedAction._errorType ]).to.be.null
    })

    it('should set busy state to true', () => {
      expect(newState[ trackedAction._busyType ]).to.equal(true)
    })
  })

  describe('on success event', () => {
    const action = { type: 'success', trackedAction }
    const newState = actionwareReducer({}, action)

    it('should set error state to null', () => {
      expect(newState[ trackedAction._errorType ]).to.be.null
    })

    it('should set busy state to false', () => {
      expect(newState[ trackedAction._busyType ]).to.equal(false)
    })
  })
})