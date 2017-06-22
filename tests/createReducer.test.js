import createReducer from 'createReducer';
import { on } from 'index';

describe('createReducer', () => {
  it('should throw an exception if no initial state is provided', () => {
    expect(createReducer).to.throw();
  });

  it('should throw an exception if no handlers or invalid handlers type is provided', () => {
    expect(createReducer.bind(null, {})).to.throw();
    expect(createReducer.bind(null, {}, {})).to.throw();
    expect(createReducer.bind(null, {}, [])).to.throw();
    expect(createReducer.bind(null, {}, [ 'a', 'b' ])).to.throw();
    expect(createReducer.bind(null, {}, [ 1, () => {} ])).to.throw();
    expect(createReducer.bind(null, {}, [ [], () => {} ])).to.throw();
    expect(createReducer.bind(null, {}, [ [ 1 ], () => {} ])).to.throw();
    expect(createReducer.bind(null, {}, [ 'a', () => {}, 'b' ])).to.throw();
  });

  it('should not throw if arguments are in the correct format', () => {
    const loadUserByPk = function() {};

    let handlers = [
      on(loadUserByPk),
      (state, ignore) => {
        return state;
      },

      on('anotherActionName'),
      (state, ignore) => {
        return state;
      }
    ];

    expect(createReducer.bind(null, {}, handlers)).not.to.throw();
  });

  it('should return a function', () => {
    const loadUserByPk = () => {};

    const reducer = createReducer({}, [
      on(loadUserByPk),
      (state, ignore) => {
        return state;
      },

      on('anotherActionName'),
      (state, ignore) => {
        return state;
      }
    ]);

    expect(typeof reducer).to.equal('function');
  });

  it('returned function should call proper function based on given action type', () => {
    const loadUserByPk = () => {};
    const loadAllUsers = () => {};
    const handler      = spy();

    const reducer = createReducer({}, [
      on(loadUserByPk, loadAllUsers), handler
    ]);

    reducer({}, { type: loadUserByPk.toString() });
    reducer({}, { type: loadAllUsers.toString() });
    reducer({}, { type: 'loremIpsumDolor' });

    expect(handler.calledTwice).to.equal(true);
  });

  it('should createAction with the fn descriptors', () => {
    const loadUserByPk = () => {};
    const loadAllUsers = () => {};

    createReducer({}, [
      on(loadAllUsers, loadUserByPk),
      (state, ignore) => {
        return state;
      }
    ]);

    expect(loadUserByPk._successType).to.equal(loadUserByPk.toString());
    expect(loadAllUsers._successType).to.equal(loadAllUsers.toString());
  });

  describe('reducer', () => {
    const loadUserByPk = () => {};

    const reducer = createReducer({}, [
      loadUserByPk,
      (state, ignore) => {
        return { ...state, x: 1 };
      },

      'anotherActionName',
      (state, ignore) => {
        return { ...state, x: 2 };
      }
    ]);

    const currentState = { x: 0 };

    it('should return previous state when no type handler is available', () => {
      const newState = reducer(currentState, { type: 'nonExistingActionName' });
      expect(newState).to.equal(currentState);
      expect(newState.x).to.equal(0);
    });

    it('should return a new state according to respective type handler (function)', () => {
      const newState = reducer(currentState, { type: loadUserByPk.toString() });
      expect(newState).not.to.equal(currentState);
      expect(newState.x).to.equal(1);
    });

    it('should return a new state according to respective type handler (string)', () => {
      const newState = reducer(currentState, { type: 'anotherActionName' });
      expect(newState).not.to.equal(currentState);
      expect(newState.x).to.equal(2);
    });
  });
});
