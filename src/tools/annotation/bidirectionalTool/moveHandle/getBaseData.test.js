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
    expect(result.start).toMatchObject(start);
    expect(result.end).toMatchObject(end);
    expect(result.perpendicularStart).toMatchObject(perpendicularStart);
    expect(result.perpendicularEnd).toMatchObject(perpendicularEnd);
    expect(result.longLine.start).toMatchObject(start);
    expect(result.longLine.end).toMatchObject(end);
    expect(result.intersection.x).toEqual(4);
    expect(result.intersection.y).toEqual(4);
    expect(result.distanceToFixed).toEqual(2);
    expect(result.fixedPoint).toMatchObject(fixedPoint);
  });

  it('ensure that baseData object is returned with default row and column pixel spacing', () => {
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
    expect(result.start).toMatchObject(start);
    expect(result.end).toMatchObject(end);
    expect(result.perpendicularStart).toMatchObject(perpendicularStart);
    expect(result.perpendicularEnd).toMatchObject(perpendicularEnd);
    expect(result.longLine.start).toMatchObject(start);
    expect(result.longLine.end).toMatchObject(end);
    expect(result.intersection.x).toEqual(4);
    expect(result.intersection.y).toEqual(4);
    expect(result.distanceToFixed).toEqual(4);
    expect(result.fixedPoint).toMatchObject(fixedPoint);
  });
});
