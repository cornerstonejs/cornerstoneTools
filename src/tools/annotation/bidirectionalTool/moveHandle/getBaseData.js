import external from '../../../../externalModules.js';
import getDistance from './getDistanceWithPixelSpacing.js';

function createLine(startPoint, endPoint) {
  return {
    start: startPoint,
    end: endPoint,
  };
}

export default function getBaseData(data, eventData, fixedPoint) {
  const { lineSegment } = external.cornerstoneMath;
  const { start, end, perpendicularStart, perpendicularEnd } = data.handles;
  const { columnPixelSpacing = 1, rowPixelSpacing = 1 } = eventData.image;

  const longLine = createLine(start, end);
  const perpendicularLine = createLine(perpendicularStart, perpendicularEnd);
  const intersection = lineSegment.intersectLine(longLine, perpendicularLine);

  const distanceToFixed = getDistance(
    columnPixelSpacing,
    rowPixelSpacing,
    fixedPoint,
    intersection
  );

  return {
    columnPixelSpacing,
    rowPixelSpacing,
    start,
    end,
    perpendicularStart,
    perpendicularEnd,
    longLine,
    intersection,
    distanceToFixed,
    fixedPoint,
  };
}
