import getLineVector from './getLineVector';

function createPoint(x, y) {
  return {
    x,
    y,
  };
}

describe('getLineVector.js', () => {
  it('line vector for positive line', () => {
    const columnPixelSpacing = 1.4;
    const rowPixelSpacing = 0.2;

    const startPoint = createPoint(2, 4);
    const endPoint = createPoint(4, 8);

    const vector = getLineVector(
      columnPixelSpacing,
      rowPixelSpacing,
      startPoint,
      endPoint
    );

    expect(vector.x).toBeCloseTo(-0.9615239476408233);
    expect(vector.y).toBeCloseTo(-0.2747211278973781);
    expect(vector.length).toBeCloseTo(2.912043955712207);
  });

  it('line vector for negative line', () => {
    const columnPixelSpacing = 1.4;
    const rowPixelSpacing = 0.2;

    const startPoint = createPoint(5, 5);
    const endPoint = createPoint(1, 1);

    const vector = getLineVector(
      columnPixelSpacing,
      rowPixelSpacing,
      startPoint,
      endPoint
    );

    expect(vector.x).toBeCloseTo(0.9899494936611666);
    expect(vector.y).toBeCloseTo(0.14142135623730953);
    expect(vector.length).toBeCloseTo(5.65685424949238);
  });

  it('line vector for line with same point coordinates', () => {
    const columnPixelSpacing = 1;
    const rowPixelSpacing = 1;

    const startPoint = createPoint(4, 6);
    const endPoint = createPoint(4, 6);

    const vector = getLineVector(
      columnPixelSpacing,
      rowPixelSpacing,
      startPoint,
      endPoint
    );

    expect(vector.x).toEqual(NaN);
    expect(vector.y).toEqual(NaN);
    expect(vector.length).toEqual(0);
  });
});
