import getDirectionMultiplier from './getDirectionMultiplier';

function createPoint(x, y) {
  return {
    x,
    y,
  };
}

describe('getDirectionMultiplier.js', () => {
  it('has positive direction multiplier', () => {
    const fixedPoint = createPoint(0, 0);
    const perpendicularEnd = createPoint(1, 1);
    const multiplier = getDirectionMultiplier(fixedPoint, perpendicularEnd);

    expect(multiplier).toEqual(1);
  });

  it('has negative direction multiplier', () => {
    const fixedPoint = createPoint(0, 0);
    const perpendicularEnd = fixedPoint;
    const multiplier = getDirectionMultiplier(fixedPoint, perpendicularEnd);

    expect(multiplier).toEqual(-1);
  });
});
