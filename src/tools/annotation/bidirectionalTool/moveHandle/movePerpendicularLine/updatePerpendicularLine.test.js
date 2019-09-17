import external from './../../../../../externalModules.js';
import updatePerpendicularLine from './updatePerpendicularLine';
import getHelperLine from './getHelperLine';
import getLineVector from '../../utils/getLineVector';
import getDistanceWithPixelSpacing from '../../utils/getDistanceWithPixelSpacing.js';

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

function createLine(start, end) {
  return {
    start,
    end,
  };
}

describe('updatePerpendicularLine.js', () => {
  it('line has points in expected position', () => {
    const { lineSegment } = external.cornerstoneMath;
    const columnPixelSpacing = 1;
    const rowPixelSpacing = 0.5;
    const start = createPoint(0, 4);
    const end = createPoint(8, 4);
    const perpendicularStart = createPoint(4, 6);
    const perpendicularEnd = createPoint(4, 2);
    const longLine = createLine(start, end);
    const fixedPoint = perpendicularStart;
    const intersection = createPoint(4, 4);
    const proposedPoint = createPoint(4, 1);
    const distanceToFixed = getDistanceWithPixelSpacing(
      columnPixelSpacing,
      rowPixelSpacing,
      fixedPoint,
      intersection
    );

    const baseData = {
      columnPixelSpacing,
      rowPixelSpacing,
      start,
      perpendicularStart,
      perpendicularEnd,
      intersection,
      fixedPoint,
      distanceToFixed,
    };

    const vector = getLineVector(
      columnPixelSpacing,
      rowPixelSpacing,
      start,
      intersection
    );

    const helperLine = getHelperLine(baseData, proposedPoint, vector);
    const mid = lineSegment.intersectLine(longLine, helperLine);

    const newLine = updatePerpendicularLine(baseData, mid, helperLine, vector);

    console.log(mid, vector);

    expect(newLine.start.x).toEqual(4);
    expect(newLine.start.y).toEqual(6);
    expect(newLine.end.x).toEqual(4);
    expect(newLine.end.y).toEqual(1);
  });
});
