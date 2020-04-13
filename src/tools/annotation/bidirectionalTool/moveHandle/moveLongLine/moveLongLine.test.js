import moveLongLine from './moveLongLine';

jest.mock('./../../../../../externalModules.js', () => {
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

describe('moveLongLine.js', () => {
  it('long line is moved and perpendicular line position is updated', () => {
    const proposedPoint = createPoint(12, 6);

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
        columnPixelSpacing: 1,
        rowPixelSpacing: 0.5,
      },
    };

    const fixedPoint = measurementData.handles.start;

    const result = moveLongLine(
      proposedPoint,
      measurementData,
      eventData,
      fixedPoint
    );

    // Expect line to be moved successfully
    expect(result).toEqual(true);

    // Expect perpendicular lines position to be updated
    expect(perpendicularStart.x).toBeCloseTo(3.9031375531257786);
    expect(perpendicularStart.y).toBeCloseTo(6.657455355319679);
    expect(perpendicularEnd.x).toBeCloseTo(4.069228512833258);
    expect(perpendicularEnd.y).toBeCloseTo(2.671272322340161);
  });

  it('long line is moved and perpendicular line position stays the same', () => {
    const proposedPoint = createPoint(-4, 4);

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
        columnPixelSpacing: 1,
        rowPixelSpacing: 2,
      },
    };

    const fixedPoint = measurementData.handles.end;

    const result = moveLongLine(
      proposedPoint,
      measurementData,
      eventData,
      fixedPoint
    );

    // Expect line to be moved successfully
    expect(result).toEqual(true);

    // Expect perpendicular lines position to be updated
    expect(perpendicularStart.x).toEqual(4);
    expect(perpendicularStart.y).toEqual(6);
    expect(perpendicularEnd.x).toEqual(4);
    expect(perpendicularEnd.y).toEqual(2);
  });

  it('long line is not moved (proposed point is before intersection point)', () => {
    const proposedPoint = createPoint(3, 6);

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
        columnPixelSpacing: 1,
        rowPixelSpacing: 0.5,
      },
    };

    const fixedPoint = measurementData.handles.start;

    const result = moveLongLine(
      proposedPoint,
      measurementData,
      eventData,
      fixedPoint
    );

    // Expect line to not be moved
    expect(result).toEqual(false);
  });
});
