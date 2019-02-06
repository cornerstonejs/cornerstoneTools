import calculateEllipseStatistics from './calculateEllipseStatistics.js';

describe('calculateEllipseStatistics.js', () => {
  // prettier-ignore
  const fakePixels = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
                    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
                    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
                    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
                    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
                    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
                    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
                    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
                    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
                    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const fakeEllipseBounds = {
    top: 0,
    left: 0,
    height: 10,
    width: 10,
  };

  test('result contains expected object properties', () => {
    const result = calculateEllipseStatistics(fakePixels, fakeEllipseBounds);

    expect(Object.keys(result).sort()).toEqual(
      ['count', 'mean', 'variance', 'stdDev', 'min', 'max'].sort()
    );
  });

  it('only uses pixel values inside ellipse in calculation', () => {
    const fakeEllipseBounds = {
      top: 0,
      left: 0,
      height: 3,
      width: 3,
    };

    // prettier-ignore
    const fakePixels = [100, 100, 100,
                        100, 4, 5,
                        100, 3, 6];

    const result = calculateEllipseStatistics(fakePixels, fakeEllipseBounds);

    expect(result.count).toEqual(4);
    expect(result.max).toEqual(6);
    expect(result.mean).toEqual(4.5);
    expect(result.min).toEqual(3);
    expect(result.stdDev.toFixed(2)).toEqual('1.12');
    expect(result.variance).toEqual(1.25);
  });
});
