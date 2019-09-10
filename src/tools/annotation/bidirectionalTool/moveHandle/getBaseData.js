import external from '../../../../externalModules.js';
import getDistance from './getDistanceWithPixelSpacing.js';

export default function getBaseData(data, eventData, fixedPoint) {
  const { lineSegment } = external.cornerstoneMath;
  const { start, end, perpendicularStart, perpendicularEnd } = data.handles;
  const { columnPixelSpacing = 1, rowPixelSpacing = 1 } = eventData.image;

  const longLine = {
    start,
    end,
  };

  const intersection = lineSegment.intersectLine(longLine, {
    start: perpendicularStart,
    end: perpendicularEnd,
  });

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
