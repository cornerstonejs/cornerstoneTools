import getMovingPoint from './getMovingPoint';

function createPoint(x, y) {
  return {
    x,
    y,
  };
}

describe('getMovingPoint.js', () => {
  it('moving point is end point', () => {
    const perpendicularStart = createPoint(0, 0);
    const perpendicularEnd = createPoint(1, 1);
    const fixedPoint = perpendicularStart;

    const movingPoint = getMovingPoint(
      fixedPoint,
      perpendicularStart,
      perpendicularEnd
    );

    expect(movingPoint).toEqual(perpendicularEnd);
  });

  it('moving point is start point', () => {
    const perpendicularStart = createPoint(0, 0);
    const perpendicularEnd = createPoint(1, 1);
    const fixedPoint = perpendicularEnd;

    const movingPoint = getMovingPoint(
      fixedPoint,
      perpendicularStart,
      perpendicularEnd
    );

    expect(movingPoint).toEqual(perpendicularStart);
  });
});
