import external from '../../../../externalModules.js';
import getDistance from './getDistance.js';

export default function getBaseData(data, eventData, fixedPoint) {
  const { lineSegment } = external.cornerstoneMath;
  const { start, end, perpendicularStart, perpendicularEnd } = data.handles;
  const cps = eventData.image.columnPixelSpacing || 1;
  const rps = eventData.image.rowPixelSpacing || 1;

  const longLine = {
    start,
    end,
  };

  const intersection = lineSegment.intersectLine(longLine, {
    start: perpendicularStart,
    end: perpendicularEnd,
  });

  const distanceToFixed = getDistance(cps, rps, fixedPoint, intersection);

  return {
    cps,
    rps,
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
