import getActionName from '../src/getActionName';

test('should return action name with prefix', () => {
  const actionName = getActionName('lorem:', 'ipsum', () => {})

  expect(actionName).toBe('lorem:ipsum0')
});

test('should return the same when trying to get name for the same function and name', () => {
  let fn = () => {};
  const actionName = getActionName('lorem:', 'ipsum', fn);
  const actionName2 = getActionName('lorem:', 'ipsum', fn);

  expect(actionName).toBe(actionName2);
});

test('should return different names for different functions with the same name', () => {
  let fn1 = () => {};
  let fn2 = () => {};
  const actionName = getActionName('lorem:', 'ipsum', fn1);
  const actionName2 = getActionName('lorem:', 'ipsum', fn2);

  expect(actionName).not.toBe(actionName2);
});