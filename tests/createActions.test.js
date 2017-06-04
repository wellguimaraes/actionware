import { createActions } from '../src/index';

test('should throw an error when argument is not an object', () => {
  expect(createActions.bind(null, 1)).toThrow();
});

test('should return a new object with actions created for the given keys', () => {
  let pureActions = {
    a: () => 1,
    b: () => 1,
  };

  const actions = createActions(pureActions);

  expect(actions).not.toEqual(pureActions);
  expect(typeof actions).toEqual('object');
  expect(typeof actions.a).toBe('function');
  expect(typeof actions.b).toBe('function');
});

test('created actions should have actionName equals to the given key', () => {
  let pureActions = {
    a: () => 1,
    b: () => 1,
  };

  const actions = createActions(pureActions);

  expect(actions.a.actionName).toBe('a');
  expect(actions.b.actionName).toBe('b');
});