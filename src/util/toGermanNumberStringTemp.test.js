import toGermanNumberStringTemp from './toGermanNumberStringTemp';

describe('util: toGermanNumberStringTemp.js', () => {
  it('returns a comma separated number string', () => {
    const value = 10.23;

    const returnValue = toGermanNumberStringTemp(value);

    expect(returnValue).toEqual('10,23');
  });

  it('returns a number string with groups of three digits separated by whitespace', () => {
    const value = 1234567;

    const returnValue = toGermanNumberStringTemp(value);

    expect(returnValue).toEqual('1 234 567,00');
  });

  it('returns a comma separated number string with three digit groupings', () => {
    const value = 12345.67;

    const returnValue = toGermanNumberStringTemp(value);

    expect(returnValue).toEqual('12 345,67');
  });
});
