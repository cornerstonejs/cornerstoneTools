import updatePerpendicularLine from './updatePerpendicularLine';

function createPoint(x, y) {
  return {
    x,
    y,
  };
}

describe('updatePerpendicularLine.js', () => {
  it('line has points in expected position', () => {
    const columnPixelSpacing = 1;
    const rowPixelSpacing = 0.5;
    const start = createPoint(2, 3);
    const perpendicularStart = createPoint(1, 0);
    const perpendicularEnd = createPoint(2, 8);
    const fixedPoint = perpendicularStart;
    const intersection = createPoint(4, 4);
    const mid = createPoint(5, 5);

    const baseData = {
      columnPixelSpacing,
      rowPixelSpacing,
      start,
      perpendicularStart,
      perpendicularEnd,
      intersection,
      fixedPoint,
    };

    const newLine = updatePerpendicularLine(baseData, mid);

    expect(newLine.start.x).toBeCloseTo(6.910938354123028);
    expect(newLine.start.y).toBeCloseTo(-1.1150027331936894);
    expect(newLine.end.x).toBeCloseTo(3.500936622008277);
    expect(newLine.end.y).toBeCloseTo(9.797002809573513);
  });
});
