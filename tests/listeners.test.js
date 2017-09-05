import { call, onError, onSuccess } from '../src'

describe('listeners', () => {

  describe('success listeners', () => {

    it('should call an action success listener when action succeeds', () => {

      const action = () => {}
      const actionSuccessHandler = spy()

      onSuccess(action, actionSuccessHandler)

      call(action)

      expect(actionSuccessHandler.called).equals(true)
    })

    it('should call a global success listener when action succeeds', () => {

      const action = () => {}
      const actionSuccessHandler = spy()

      onSuccess(actionSuccessHandler)

      call(action)

      expect(actionSuccessHandler.called).equals(true)
    })

    it('should call a global success listener with action, payload and args', () => {

      const actionFn = () => 4
      const actionSuccessHandler = spy()

      onSuccess(actionSuccessHandler)

      call(actionFn, 1, 2, 3)

      const { payload, args, action } = actionSuccessHandler.getCall(0).args[ 0 ]

      expect(args).deep.equal([ 1, 2, 3 ])
      expect(action).equals(actionFn)
      expect(payload).equals(4)
    })

    it('should NOT call an action success listener when action fails', () => {

      const action = () => { throw new Error('ErrorMessage') }
      const actionSuccessHandler = spy()

      onSuccess(action, actionSuccessHandler)

      expect(call.bind(null, action)).to.throw()
      expect(actionSuccessHandler.called).equals(false)
    })

    it('should NOT call a global success listener when action fails', () => {

      const action = () => { throw new Error('ErrorMessage') }
      const actionSuccessHandler = spy()

      onSuccess(actionSuccessHandler)

      expect(call.bind(null, action)).to.throw()
      expect(actionSuccessHandler.called).equals(false)
    })

    it('should NOT call an action success listener when action is cancelled', (done) => {
      const actionSuccessHandler = spy()
      const action = () => new Promise((resolve) => setTimeout(() => {
        resolve()
        expect(actionSuccessHandler.called).equals(false)
        done()
      }, 20))

      onSuccess(action, actionSuccessHandler)
      call(action).cancel()
    })

    it('should NOT call a global success listener when action is cancelled', (done) => {
      const actionSuccessHandler = spy()
      const action = () => new Promise((resolve) => setTimeout(() => {
        resolve()
        expect(actionSuccessHandler.called).equals(false)
        done()
      }, 20))

      onSuccess(actionSuccessHandler)
      call(action).cancel()
    })

  })

  describe('error listeners', () => {

    it('should call an action error listener when action fails', () => {
      const action = () => { throw new Error('Error') }
      const actionErrorHandler = spy()

      onError(action, actionErrorHandler)

      expect(call.bind(null, action)).to.throw()
      expect(actionErrorHandler.called).equals(true)
    })

    it('should call a global error listener when action fails', () => {
      const action = () => { throw new Error('Error') }
      const actionErrorHandler = spy()

      onError(actionErrorHandler)

      expect(call.bind(null, action)).to.throw()
      expect(actionErrorHandler.called).equals(true)
    })

    it('should call a global error listener with error and args', () => {
      const someError = new Error('someErrorMessage')
      const action = () => { throw someError }
      const errorSuccessHandler = spy()

      onError(errorSuccessHandler)

      expect(call.bind(null, action, 1, 2, 3)).to.throw()

      const { args, error } = errorSuccessHandler.getCall(0).args[0]

      expect(args).deep.equal([ 1, 2, 3 ])
      expect(error).equals(someError)
    })

    it('should NOT call an action error listener when action succeeds', () => {

      const action = () => { }
      const actionErrorHandler = spy()

      onError(action, actionErrorHandler)

      call(action)
      expect(actionErrorHandler.called).equals(false)
    })

    it('should NOT call a global error listener when action succeeds', () => {

      const action = () => { }
      const actionErrorHandler = spy()

      onError(actionErrorHandler)

      call(action)

      expect(actionErrorHandler.called).equals(false)
    })

    it('should NOT call an action error listener when action is cancelled', (done) => {
      const actionErrorHandler = spy()
      const action = () => new Promise((resolve) => setTimeout(() => {
        resolve()
        expect(actionErrorHandler.called).equals(false)
        done()
      }, 20))

      onSuccess(action, actionErrorHandler)
      call(action).cancel()
    })

    it('should NOT call a global error listener when action is cancelled', (done) => {
      const actionErrorHandler = spy()
      const action = () => new Promise((resolve) => setTimeout(() => {
        resolve()
        expect(actionErrorHandler.called).equals(false)
        done()
      }, 20))

      onError(actionErrorHandler)
      call(action).cancel()
    })

  })
})