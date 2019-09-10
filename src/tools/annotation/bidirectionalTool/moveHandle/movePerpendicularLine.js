import external from './../../../../externalModules.js';
import getDistance from './getDistance.js';
import getLineVector from './getLineVector.js';
import getBaseData from './getBaseData.js';

// Move perpendicular line handles
export default function(proposedPoint, data, eventData, fixedPoint) {
  const { lineSegment } = external.cornerstoneMath;
  const {
    cps,
    rps,
    start,
    end,
    perpendicularEnd,
    perpendicularStart,
    longLine,
    intersection,
    distanceToFixed,
  } = getBaseData(data, eventData, fixedPoint);

  const longLineLength = getDistance(cps, rps, start, end);

  // Stop here if the long line has no length
  if (longLineLength === 0) {
    return false;
  }

  // Inclination of the perpendicular line
  const vector = getLineVector(cps, rps, start, intersection);

  // Define the direction multipliers
  const isFixedEnd = fixedPoint === perpendicularEnd;
  const mult1 = isFixedEnd ? -1 : 1;
  const mult2 = mult1 * -1;

  // Create a helper line to find the intesection point in the long line
  const newLine = {
    start: proposedPoint,
    end: {
      x: proposedPoint.x + vector.y * Number.MAX_SAFE_INTEGER * rps * mult1,
      y: proposedPoint.y + vector.x * Number.MAX_SAFE_INTEGER * cps * mult2,
    },
  };

  // Find the new intersection in the long line
  const newIntersection = lineSegment.intersectLine(longLine, newLine);

  // Stop the flow here if there's no intersection point between lines
  if (!newIntersection) {
    return false;
  }

  // Define the moving point
  const movingPoint = isFixedEnd ? perpendicularStart : perpendicularEnd;

  // Change the position of the perpendicular line handles
  movingPoint.x = newLine.start.x;
  movingPoint.y = newLine.start.y;
  fixedPoint.x = newIntersection.x + vector.y * distanceToFixed * rps * mult1;
  fixedPoint.y = newIntersection.y + vector.x * distanceToFixed * cps * mult2;

  return true;
}
