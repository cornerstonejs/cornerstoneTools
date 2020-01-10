import lineHasLength from './lineHasLength';

function createPoint(x, y) {
  return {
    x,
    y,
  };
}

function createLine(start, end) {
  return {
    start,
    end,
  };
}

describe('lineHasLength.js', () => {
  it('positive line has length', () => {
    const columnPixelSpacing = 1;
    const rowPixelSpacing = 0.5;
    const start = createPoint(1, 1);
    const end = createPoint(5, 5);
    const line = createLine(start, end);

    const hasLength = lineHasLength(columnPixelSpacing, rowPixelSpacing, line);

    expect(hasLength).toEqual(true);
  });

  it('negative line has length', () => {
    const columnPixelSpacing = 0.2;
    const rowPixelSpacing = 0.8;
    const start = createPoint(5, 8);
    const end = createPoint(3, 1);
    const line = createLine(start, end);

    const hasLength = lineHasLength(columnPixelSpacing, rowPixelSpacing, line);

    expect(hasLength).toEqual(true);
  });

  it('line with same points coordinates has not length', () => {
    const columnPixelSpacing = 2;
    const rowPixelSpacing = 0.1;
    const start = createPoint(3, 9);
    const end = createPoint(3, 9);
    const line = createLine(start, end);

    const hasLength = lineHasLength(columnPixelSpacing, rowPixelSpacing, line);

    expect(hasLength).toEqual(false);
  });
});
