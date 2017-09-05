import { createReducer } from '../src/createReducer'
import { successType } from '../src/createAction'

describe('createReducer', () => {
  it('should return a function', () => {
    const reducer = createReducer({})
    expect(typeof reducer).to.equal('function')
  })

  it('returned function should call proper function based on given action type', () => {
    const loadUserByPk = () => {}
    const loadAllUsers = () => {}
    const handler = spy()

    const reducer = createReducer({})
      .on(
        loadUserByPk,
        loadAllUsers,
        handler
      )

    reducer({}, { type: successType(loadUserByPk) })
    reducer({}, { type: successType(loadAllUsers) })
    reducer({}, { type: 'loremIpsumDolor' })

    expect(handler.calledTwice).to.equal(true)
  })

  describe('reducer', () => {
    const loadUserByPk = () => {}

    const reducer = createReducer({})
      .on(loadUserByPk, (state, ignore) => ({ ...state, x: 1 }))
      .on('anotherActionName', (state, ignore) => ({ ...state, x: 2 }))

    const currentState = { x: 0 }

    it('should return previous state when no type handler is available', () => {
      const newState = reducer(currentState, { type: 'nonExistingActionName' })
      expect(newState).to.equal(currentState)
      expect(newState.x).to.equal(0)
    })

    it('should return a new state according to respective type handler (function)', () => {
      const newState = reducer(currentState, { type: loadUserByPk._trackedAction._successType })
      expect(newState).not.to.equal(currentState)
      expect(newState.x).to.equal(1)
    })

    it('should return a new state according to respective type handler (string)', () => {
      const newState = reducer(currentState, { type: 'anotherActionName' })
      expect(newState).not.to.equal(currentState)
      expect(newState.x).to.equal(2)
    })
  })
})
