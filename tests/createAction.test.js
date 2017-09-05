import createAction from '../src/createAction'
import { getStore, setStore } from '../src/storeKeeper'

describe('createAction', () => {
  it('should throw an error if given action is not a function', () => {
    expect(createAction.bind(null, 'a')).to.throw
    expect(createAction.bind(null, {})).to.throw
    expect(createAction.bind(null, 1)).to.throw
  })

  it('should return a tracked action', () => {
    const action = function () {}
    const trackedAction = createAction(action)
    expect(typeof trackedAction).to.equal('function')
  })

  describe('tracked action', () => {
    it('should be different from given action', () => {
      const action = function () {}
      const trackedAction = createAction(action)
      expect(trackedAction).not.to.equal(action)
    })

    it('should be the same for same given actions', () => {
      const action = function () {}
      const trackedAction1 = createAction(action)
      const trackedAction2 = createAction(action)
      expect(trackedAction1).to.equal(trackedAction2)
    })

    it('should have _successType, _errorType and _busyType', () => {
      const action = function () {}
      const trackedAction = createAction(action)
      expect(trackedAction._successType).to.be.ok
      expect(trackedAction._errorType).to.be.ok
      expect(trackedAction._busyType).to.be.ok
    })

    it('should call given action with the same args + store', () => {
      const action = spy()
      const trackedAction = createAction(action)
      const store = getStore()
      trackedAction(1, 'a', 3)
      expect(action.getCall(0).args).to.deep.equal([ 1, 'a', 3, store ])
    })

    it('should dispatch success event when action executed successfully', () => {
      const action = spy()
      const dispatch = spy()
      const trackedAction = createAction(action)
      setStore({ dispatch, getState: spy() })

      trackedAction(1, 'a', 3)

      expect(dispatch.called).to.be.true
      expect(dispatch.getCall(1).args[ 0 ].type).to.equal(trackedAction._successType)
    })

    it('should dispatch busy event before action is executed', () => {
      const action = spy(async () => Promise.resolve(1))
      const dispatch = spy()
      const trackedAction = createAction(action)

      setStore({ dispatch, getState: spy() })

      trackedAction(1, 'a', 3)

      expect(action.called).to.be.true
      expect(dispatch.calledBefore(action)).to.be.true
      expect(dispatch.getCall(0).args[ 0 ].type).to.equal(trackedAction._busyType)
    })

    it('should dispatch success event when asynchronous action executed successfully', async () => {
      const action = async () => Promise.resolve(23)
      const dispatch = spy()
      const trackedAction = createAction(action)
      setStore({ dispatch, getState: spy() })

      const result = await trackedAction(1, 'a', 3)

      expect(result).to.equal(23)
      expect(dispatch.called).to.be.true
      expect(dispatch.getCall(1).args[ 0 ].type).to.equal(trackedAction._successType)
    })
  })

})