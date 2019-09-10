import external from './../../../../externalModules.js';
import getDistance from './getDistance.js';

// Move perpendicular line handles
export default function(proposedPoint, data, eventData, fixedPoint) {
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
  const originalDistance = getDistance(cps, rps, fixedPoint, intersection);

  const longLineLength = getDistance(cps, rps, start, end);

  // Stop here if the long line has no length
  if (longLineLength === 0) {
    return false;
  }

  // Inclination of the perpendicular line
  const dx = (start.x - intersection.x) * cps;
  const dy = (start.y - intersection.y) * rps;
  const length = Math.sqrt(dx * dx + dy * dy);
  const vectorX = dx / length;
  const vectorY = dy / length;

  // Define the direction multipliers
  const isFixedEnd = fixedPoint === perpendicularEnd;
  const mult1 = isFixedEnd ? 1 : -1;
  const mult2 = mult1 * -1;

  // Create a helper line to find the intesection point in the long line
  const newLine = {
    start: {
      x: proposedPoint.x,
      y: proposedPoint.y,
    },
    end: {
      x: proposedPoint.x + vectorY * Number.MAX_SAFE_INTEGER * rps * mult1,
      y: proposedPoint.y + vectorX * Number.MAX_SAFE_INTEGER * cps * mult2,
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
  fixedPoint.x = newIntersection.x + vectorY * originalDistance * rps * mult1;
  fixedPoint.y = newIntersection.y + vectorX * originalDistance * cps * mult2;

  return true;
}
