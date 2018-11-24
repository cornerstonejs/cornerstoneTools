// SUT
import getDefault from './getDefault.js';

describe('util: getDefault.js', () => {
  it('returns the provided value instead of the default', () => {
    const value = 10;
    const defaultValue = 55;

    const returnValue = getDefault(value, defaultValue);

    expect(returnValue).toEqual(value);
  });

  it('returns a falsey value instead of the default when a falsey value is provided', () => {
    const falseyValue = 0;
    const defaultValue = 55;

    const returnValue = getDefault(falseyValue, defaultValue);

    expect(returnValue).toEqual(falseyValue);
  });

  it('returns the default value when the provided value is undefined', () => {
    const defaultValue = 55;

    const returnValue = getDefault(undefined, defaultValue);

    expect(returnValue).toEqual(defaultValue);
  });
});
