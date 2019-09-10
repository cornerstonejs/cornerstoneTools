import external from '../../../../externalModules.js';
import getDistance from './getDistance.js';

export default function getBaseData(data, eventData, fixedPoint) {
  const { lineSegment } = external.cornerstoneMath;
  const { start, end, perpendicularStart, perpendicularEnd } = data.handles;
  const { columnPixelSpacing, rowPixelSpacing } = eventData.image;
  const cps = columnPixelSpacing || 1;
  const rps = rowPixelSpacing || 1;

  const longLine = {
    start,
    end,
  };

  const perpendicularLine = {
    start: perpendicularStart,
    end: perpendicularEnd,
  };

  const intersection = lineSegment.intersectLine(longLine, perpendicularLine);
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
  };
}
