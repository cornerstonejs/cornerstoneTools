import external from './../../../../externalModules.js';
import getDistance from './getDistance.js';

// Move long line handle
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
  const newLineLength = getDistance(cps, rps, fixedPoint, proposedPoint);

  // Stop here if the handle tries to move before the intersection point
  if (newLineLength <= originalDistance) {
    return false;
  }

  // Calculate the new intersection point
  const k = originalDistance / newLineLength;
  const newIntersection = {
    x: fixedPoint.x + (proposedPoint.x - fixedPoint.x) * k,
    y: fixedPoint.y + (proposedPoint.y - fixedPoint.y) * k,
  };

  // Get the original distance from perpendicular handles to intersection
  const distancePS = getDistance(cps, rps, perpendicularStart, intersection);
  const distancePE = getDistance(cps, rps, perpendicularEnd, intersection);

  // Inclination of the perpendicular line
  const dx = (fixedPoint.x - newIntersection.x) * cps;
  const dy = (fixedPoint.y - newIntersection.y) * rps;
  const length = Math.sqrt(dx * dx + dy * dy);
  const vectorX = dx / length;
  const vectorY = dy / length;

  // Define the mid points and the multipliers
  const midX = newIntersection.x;
  const midY = newIntersection.y;
  const mult1 = fixedPoint === start ? 1 : -1;
  const mult2 = mult1 * -1;

  // Calculate and set the new position of the perpendicular handles
  perpendicularStart.x = midX + vectorY * distancePS * rps * mult1;
  perpendicularStart.y = midY + vectorX * distancePS * cps * mult2;
  perpendicularEnd.x = midX + vectorY * distancePE * rps * mult2;
  perpendicularEnd.y = midY + vectorX * distancePE * cps * mult1;

  return true;
}
