import { call } from 'call';
import { getStore } from 'storeKeeper';
import { mockCallWith } from 'call';

describe('call', () => {
  afterEach(() => {
    mockCallWith(null);
  });

  it('should create tracked action with given function', () => {
    const fn = function() {};
    call(fn);
    expect(typeof fn._trackedAction).to.equal('function');
  });

  it('should invoke given action with given args and store as last arg', () => {
    const store = getStore();
    const fn = spy();
    call(fn, 1, 'a', 3);
    expect(fn.getCall(0).args).to.deep.equal([ 1, 'a', 3, store ]);
  });

  it('should use call mock instead of invoking tracked action', () => {
    let callMock = spy();
    mockCallWith(callMock);
    const fn = spy();
    call(fn, 1, 'a', 3);

    expect(fn.called).to.be.false;
    expect(callMock.getCall(0).args).to.deep.equal([ fn, 1, 'a', 3 ]);
  });
});