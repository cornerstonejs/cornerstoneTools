import getBaseData from './getBaseData';

jest.mock('./../../../../externalModules.js', () => {
  const intersectLine = () => ({
    x: 4,
    y: 4,
  });

  return {
    cornerstoneMath: {
      lineSegment: {
        intersectLine: jest.fn(intersectLine),
      },
    },
  };
});

function createPoint(x, y) {
  return {
    x,
    y,
  };
}

describe('getBaseData.js', () => {
  it('returns a baseData object with the correct values', () => {
    const start = createPoint(0, 4);
    const end = createPoint(8, 4);
    const perpendicularStart = createPoint(4, 6);
    const perpendicularEnd = createPoint(4, 2);

    const measurementData = {
      handles: {
        start,
        end,
        perpendicularStart,
        perpendicularEnd,
      },
    };

    const eventData = {
      image: {
        columnPixelSpacing: 3,
        rowPixelSpacing: 2,
      },
    };

    const fixedPoint = measurementData.handles.end;

    const result = getBaseData(measurementData, eventData, fixedPoint);

    expect(result.columnPixelSpacing).toEqual(3);
    expect(result.rowPixelSpacing).toEqual(2);
    expect(result.start.x).toEqual(0);
    expect(result.start.y).toEqual(4);
    expect(result.end.x).toEqual(8);
    expect(result.end.y).toEqual(4);
    expect(result.perpendicularStart.x).toEqual(4);
    expect(result.perpendicularStart.y).toEqual(6);
    expect(result.perpendicularEnd.x).toEqual(4);
    expect(result.perpendicularEnd.y).toEqual(2);
    expect(result.longLine.start.x).toEqual(0);
    expect(result.longLine.start.y).toEqual(4);
    expect(result.longLine.end.x).toEqual(8);
    expect(result.longLine.end.y).toEqual(4);
    expect(result.intersection.x).toEqual(4);
    expect(result.intersection.y).toEqual(4);
    expect(result.distanceToFixed).toEqual(2);
    expect(result.fixedPoint.x).toEqual(8);
    expect(result.fixedPoint.y).toEqual(4);
  });

  it('baseData object is returned with row and column pixel spacing defaulted to 1', () => {
    const start = createPoint(0, 4);
    const end = createPoint(8, 4);
    const perpendicularStart = createPoint(4, 6);
    const perpendicularEnd = createPoint(4, 2);

    const measurementData = {
      handles: {
        start,
        end,
        perpendicularStart,
        perpendicularEnd,
      },
    };

    const eventData = {
      image: {},
    };

    const fixedPoint = measurementData.handles.end;

    const result = getBaseData(measurementData, eventData, fixedPoint);

    expect(result.columnPixelSpacing).toEqual(1);
    expect(result.rowPixelSpacing).toEqual(1);
    expect(result.start.x).toEqual(0);
    expect(result.start.y).toEqual(4);
    expect(result.end.x).toEqual(8);
    expect(result.end.y).toEqual(4);
    expect(result.perpendicularStart.x).toEqual(4);
    expect(result.perpendicularStart.y).toEqual(6);
    expect(result.perpendicularEnd.x).toEqual(4);
    expect(result.perpendicularEnd.y).toEqual(2);
    expect(result.longLine.start.x).toEqual(0);
    expect(result.longLine.start.y).toEqual(4);
    expect(result.longLine.end.x).toEqual(8);
    expect(result.longLine.end.y).toEqual(4);
    expect(result.intersection.x).toEqual(4);
    expect(result.intersection.y).toEqual(4);
    expect(result.distanceToFixed).toEqual(4);
    expect(result.fixedPoint.x).toEqual(8);
    expect(result.fixedPoint.y).toEqual(4);
  });
});
