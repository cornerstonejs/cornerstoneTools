import calculateEllipseStatistics from './calculateEllipseStatistics.js';

describe('calculateEllipseStatistics.js', () => {
  // prettier-ignore
  let fakePixels = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
                    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
                    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
                    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
                    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
                    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
                    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
                    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
                    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
                    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  let fakeEllipseBounds = {
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
});
