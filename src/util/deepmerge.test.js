import deepmerge from './deepmerge.js';

describe('util/deepmerge.js', function() {
  it('should merge simple objects', function() {
    const a = {
      number1: 1,
    };
    const b = {
      number2: 2,
    };

    const mergedObject = deepmerge(a, b);

    expect(mergedObject).toMatchObject({
      number1: 1,
      number2: 2,
    });
  });

  it('should merge objects with more levels', function() {
    const a = {
      number1: 1,
      letters: {
        letterA: 'a',
        letterB: 'b',
      },
    };
    const b = {
      number2: 2,
      letters: {
        letterC: 'c',
        letterD: 'd',
      },
    };

    const mergedObject = deepmerge(a, b);

    expect(mergedObject).toMatchObject({
      number1: 1,
      number2: 2,
      letters: {
        letterA: 'a',
        letterB: 'b',
        letterC: 'c',
        letterD: 'd',
      },
    });
  });

  it('should merge simple array', function() {
    const a = ['a', 'b'];
    const b = ['c', 'd'];

    const mergedObject = deepmerge(a, b);

    expect(mergedObject).toMatchObject(['a', 'b', 'c', 'd']);
  });

  it('should merge objects containing array', function() {
    const a = {
      number1: 1,
      letters: ['a', 'b'],
    };
    const b = {
      number2: 2,
      letters: ['c'],
    };

    const mergedObject = deepmerge(a, b);

    expect(mergedObject).toMatchObject({
      number1: 1,
      number2: 2,
      letters: ['a', 'b', 'c'],
    });
  });

  it('should merge objects containing array with objects', function() {
    const a = {
      number1: 1,
      letters: [
        'a',
        {
          letterB: 'b',
          letterC: 'c',
        },
      ],
    };
    const b = {
      number2: 2,
      letters: [
        'd',
        {
          letterE: 'e',
        },
      ],
    };

    const mergedObject = deepmerge(a, b);

    expect(mergedObject).toMatchObject({
      number1: 1,
      number2: 2,
      letters: [
        'a',
        {
          letterB: 'b',
          letterC: 'c',
          letterE: 'e',
        },
        'd',
      ],
    });
  });
});
