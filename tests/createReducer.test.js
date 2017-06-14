import createReducer from 'createReducer';

describe('createReducer', () => {
  it('should throw an exception if no initial state is provided', () => {
    expect(createReducer).to.throw();
  });

  it('should throw an exception if no handlers or invalid handlers type is provided', () => {
    expect(createReducer.bind(null, {})).to.throw();
    expect(createReducer.bind(null, {}, {})).to.throw();
    expect(createReducer.bind(null, {}, [])).to.throw();
    expect(createReducer.bind(null, {}, [ 'a', 'b' ])).to.throw();
    expect(createReducer.bind(null, {}, [ [], () => {} ])).to.throw();
    expect(createReducer.bind(null, {}, [ 1, () => {} ])).to.throw();
  });

  it('should not throw if arguments are in the correct format', () => {
    const loadUserByPk = function() {};

    let handlers = [
      loadUserByPk,
      (state, ignore) => {
        return state;
      },

      'anotherActionName',
      (state, ignore) => {
        return state;
      },
    ];

    expect(createReducer.bind(null, {}, handlers)).not.to.throw();
  });

  it('should return a function', () => {
    const loadUserByPk = () => {};

    const reducer = createReducer({}, [
      loadUserByPk,
      (state, ignore) => {
        return state;
      },

      'anotherActionName',
      (state, ignore) => {
        return state;
      },
    ]);

    expect(typeof reducer).to.equal('function');
  });

  it('should createAction with a fn descriptor', () => {
    const loadUserByPk = () => {};

    const reducer = createReducer({}, [
      loadUserByPk,
      (state, ignore) => {
        return state;
      },
    ]);

    expect(loadUserByPk.success).to.equal(loadUserByPk.toString());
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
      },
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
