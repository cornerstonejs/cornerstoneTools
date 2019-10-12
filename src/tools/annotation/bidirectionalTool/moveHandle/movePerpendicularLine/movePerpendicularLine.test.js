import movePerpendicularLine from './movePerpendicularLine';

jest.mock('./../../../../../externalModules.js', () => {
  const intersectLine = (a, b) => {
    if (b.start.x === 3) {
      return {
        x: 3,
        y: 4,
      };
    } else if (b.start.y === 5) {
      return undefined;
    } else if (b.end.y === 4) {
      return {
        x: NaN,
        y: NaN,
      };
    }

    return {
      x: 4,
      y: 4,
    };
  };

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

describe('movePerpendicularLine.js', () => {
  it('perpendicular line is moved and the opposite handle position is updated', () => {
    const proposedPoint = createPoint(3, 1);

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

    const fixedPoint = measurementData.handles.perpendicularStart;

    const result = movePerpendicularLine(
      proposedPoint,
      measurementData,
      eventData,
      fixedPoint
    );

    // Expect line to be moved successfully
    expect(result).toEqual(true);

    // Expect perpendicular lines position to be updated
    expect(perpendicularStart.x).toEqual(3);
    expect(perpendicularStart.y).toEqual(6);
    expect(perpendicularEnd.x).toEqual(3);
    expect(perpendicularEnd.y).toEqual(1);
  });

  it('perpendicular line is moved and the opposite handle position stays the same', () => {
    const proposedPoint = createPoint(4, 7);

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

    const fixedPoint = measurementData.handles.perpendicularEnd;

    const result = movePerpendicularLine(
      proposedPoint,
      measurementData,
      eventData,
      fixedPoint
    );

    // Expect line to be moved successfully
    expect(result).toEqual(true);

    // Expect perpendicular lines position to be updated
    expect(perpendicularStart.x).toEqual(4);
    expect(perpendicularStart.y).toEqual(7);
    expect(perpendicularEnd.x).toEqual(4);
    expect(perpendicularEnd.y).toEqual(2);
  });

  it('perpendicular line is not moved (proposed point is before intersection point)', () => {
    const proposedPoint = createPoint(4, 5);

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

    const fixedPoint = measurementData.handles.perpendicularStart;

    const result = movePerpendicularLine(
      proposedPoint,
      measurementData,
      eventData,
      fixedPoint
    );

    // Expect line to not be moved
    expect(result).toEqual(false);
  });

  it('perpendicular line is not moved (long line has no length)', () => {
    const proposedPoint = createPoint(4, 5);

    const start = createPoint(4, 4);
    const end = createPoint(4, 4);
    const perpendicularStart = createPoint(4, 4);
    const perpendicularEnd = createPoint(4, 4);

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
        columnPixelSpacing: 4,
        rowPixelSpacing: 3,
      },
    };

    const fixedPoint = measurementData.handles.perpendicularStart;

    const result = movePerpendicularLine(
      proposedPoint,
      measurementData,
      eventData,
      fixedPoint
    );

    // Expect line to not be moved
    expect(result).toEqual(false);
  });
});
