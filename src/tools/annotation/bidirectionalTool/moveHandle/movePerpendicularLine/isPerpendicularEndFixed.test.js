import isPerpendicularEndFixed from './isPerpendicularEndFixed';

function createPoint(x, y) {
  return {
    x,
    y,
  };
}

describe('isPerpendicularEndFixed.js', () => {
  it('perpendicular end point is the fixed point', () => {
    const perpendicularEnd = createPoint(1, 1);
    const fixedPoint = perpendicularEnd;

    const isFixed = isPerpendicularEndFixed(fixedPoint, perpendicularEnd);

    expect(isFixed).toEqual(true);
  });

  it('perpendicular end point is not the fixed point', () => {
    const perpendicularEnd = createPoint(1, 1);
    const fixedPoint = createPoint(2, 2);

    const isFixed = isPerpendicularEndFixed(fixedPoint, perpendicularEnd);

    expect(isFixed).toEqual(false);
  });
});
