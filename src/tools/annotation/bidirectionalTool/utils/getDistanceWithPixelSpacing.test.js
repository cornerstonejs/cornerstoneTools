import getDistanceWithPixelSpacing from './getDistanceWithPixelSpacing';

function createPoint(x, y) {
  return {
    x,
    y,
  };
}

describe('getDistanceWithPixelSpacing.js', () => {
  it('distance for positive line', () => {
    const columnPixelSpacing = 1;
    const rowPixelSpacing = 0.5;

    const startPoint = createPoint(2, 4);
    const endPoint = createPoint(4, 8);

    const distance = getDistanceWithPixelSpacing(
      columnPixelSpacing,
      rowPixelSpacing,
      startPoint,
      endPoint
    );

    expect(distance).toEqual(5.656854249492381);
  });

  it('distance for negative line', () => {
    const columnPixelSpacing = 1;
    const rowPixelSpacing = 0.5;

    const startPoint = createPoint(10, 10);
    const endPoint = createPoint(0, 0);

    const distance = getDistanceWithPixelSpacing(
      columnPixelSpacing,
      rowPixelSpacing,
      startPoint,
      endPoint
    );

    expect(distance).toEqual(22.360679774997898);
  });

  it('distance for line with no length', () => {
    const columnPixelSpacing = 2;
    const rowPixelSpacing = 0.5;

    const startPoint = createPoint(5, 7);
    const endPoint = createPoint(5, 7);

    const distance = getDistanceWithPixelSpacing(
      columnPixelSpacing,
      rowPixelSpacing,
      startPoint,
      endPoint
    );

    expect(distance).toEqual(0);
  });
});
