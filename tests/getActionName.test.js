import getActionName from 'getActionName';

describe('getActionName', () => {
  it('should return action name with prefix', () => {
    const actionName  = getActionName('lorem:', 'ipsum', () => {})
    const actionName2 = getActionName('lorem:', 'ipsum', () => {});

    expect(actionName).to.equal('lorem:ipsum');
    expect(actionName2).to.equal('lorem:ipsum_2');
  });

  it('should return the same when trying to get name for the same function and name', () => {
    let fn            = () => {};
    const actionName  = getActionName('lorem:', 'ipsum', fn);
    const actionName2 = getActionName('lorem:', 'ipsum', fn);

    expect(actionName).to.equal(actionName2);
  });

  it('should return different names for different functions with the same name', () => {
    let fn1           = () => {};
    let fn2           = () => {};
    const actionName  = getActionName('lorem:', 'ipsum', fn1);
    const actionName2 = getActionName('lorem:', 'ipsum', fn2);

    expect(actionName).not.to.equal(actionName2);
  });
});
