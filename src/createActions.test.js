import { createActions } from '../src'
import { expect } from 'chai'

describe('createActions', () => {
  it('should throw an error when argument is not an object', () => {
    expect(createActions.bind(null, 1)).to.throw()
  })

  it('should return a new object with actions created for the given keys', () => {
    let pureActions = {
      alpha: () => 1,
      bravo: () => 1
    }

    const actions = createActions(pureActions)

    expect(actions).not.to.equal(pureActions)
    expect(typeof actions).to.equal('object')
    expect(typeof actions.alpha).to.equal('function')
    expect(typeof actions.bravo).to.equal('function')
  })
})
