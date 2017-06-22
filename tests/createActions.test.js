import createActions from 'createActions';

describe('createActions', () => {
  it('should throw an error when argument is not an object', () => {
    expect(createActions.bind(null, 1)).to.throw();
  });

  it('should return a new object with actions created for the given keys', () => {
    let pureActions = {
      a: () => 1,
      b: () => 1,
    };

    const actions = createActions(pureActions);

    expect(actions).not.to.equal(pureActions);
    expect(typeof actions).to.equal('object');
    expect(typeof actions.a).to.equal('function');
    expect(typeof actions.b).to.equal('function');
  });
});
