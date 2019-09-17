import getDistanceToIntersection from './getDistanceToIntersection';

function createPoint(x, y) {
  return {
    x,
    y,
  };
}

describe('getDistanceToIntersection.js', () => {
  it('distance is positive', () => {
    const columnPixelSpacing = 1;
    const rowPixelSpacing = 0.5;
    const intersection = createPoint(1, 1);
    const point = createPoint(5, 5);

    const baseData = {
      columnPixelSpacing,
      rowPixelSpacing,
      intersection,
    };

    const distance = getDistanceToIntersection(baseData, point);

    expect(distance).toEqual(8.94427190999916);
  });

  it('distance is zero', () => {
    const columnPixelSpacing = 1;
    const rowPixelSpacing = 0.5;
    const intersection = createPoint(2, 7);
    const point = createPoint(2, 7);

    const baseData = {
      columnPixelSpacing,
      rowPixelSpacing,
      intersection,
    };

    const distance = getDistanceToIntersection(baseData, point);

    expect(distance).toEqual(0);
  });
});
