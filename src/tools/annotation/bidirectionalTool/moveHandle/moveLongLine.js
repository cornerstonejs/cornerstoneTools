import getDistance from './getDistance.js';
import getLineVector from './getLineVector.js';
import getBaseData from './getBaseData.js';

// Move long line handle
export default function(proposedPoint, data, eventData, fixedPoint) {
  const {
    cps,
    rps,
    start,
    perpendicularEnd,
    perpendicularStart,
    intersection,
    distanceToFixed,
  } = getBaseData(data, eventData, fixedPoint);

  const newLineLength = getDistance(cps, rps, fixedPoint, proposedPoint);

  // Stop here if the handle tries to move before the intersection point
  if (newLineLength <= distanceToFixed) {
    return false;
  }

  // Calculate the new intersection point
  const k = distanceToFixed / newLineLength;
  const newIntersection = {
    x: fixedPoint.x + (proposedPoint.x - fixedPoint.x) * k,
    y: fixedPoint.y + (proposedPoint.y - fixedPoint.y) * k,
  };

  // Get the original distance from perpendicular handles to intersection
  const distancePS = getDistance(cps, rps, perpendicularStart, intersection);
  const distancePE = getDistance(cps, rps, perpendicularEnd, intersection);

  // Inclination of the perpendicular line
  const vector = getLineVector(cps, rps, fixedPoint, newIntersection);

  // Define the mid points and the multipliers
  const midX = newIntersection.x;
  const midY = newIntersection.y;
  const mult1 = fixedPoint === start ? 1 : -1;
  const mult2 = mult1 * -1;

  // Calculate and set the new position of the perpendicular handles
  perpendicularStart.x = midX + vector.y * distancePS * rps * mult1;
  perpendicularStart.y = midY + vector.x * distancePS * cps * mult2;
  perpendicularEnd.x = midX + vector.y * distancePE * rps * mult2;
  perpendicularEnd.y = midY + vector.x * distancePE * cps * mult1;

  return true;
}
