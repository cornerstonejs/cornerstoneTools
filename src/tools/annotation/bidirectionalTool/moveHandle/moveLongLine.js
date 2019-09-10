import getDistance from './getDistance.js';
import getLineVector from './getLineVector.js';
import getBaseData from './getBaseData.js';

function updateLine(baseData, mid, data) {
  const { cps, rps, intersection, fixedPoint } = baseData;
  const { start, perpendicularStart, perpendicularEnd } = data.handles;

  // Get the original distance from perpendicular handles to intersection
  const distancePS = getDistance(cps, rps, perpendicularStart, intersection);
  const distancePE = getDistance(cps, rps, perpendicularEnd, intersection);

  // Inclination of the perpendicular line
  const vector = getLineVector(cps, rps, fixedPoint, mid);

  // Define the multiplier
  const multiplier = fixedPoint === start ? 1 : -1;

  // Calculate and set the new position of the perpendicular handles
  perpendicularStart.x = mid.x + vector.y * distancePS * rps * multiplier;
  perpendicularStart.y = mid.y + vector.x * distancePS * cps * multiplier * -1;
  perpendicularEnd.x = mid.x + vector.y * distancePE * rps * multiplier * -1;
  perpendicularEnd.y = mid.y + vector.x * distancePE * cps * multiplier;
}

// Move long line handle
export default function(proposedPoint, data, eventData, fixedPoint) {
  const baseData = getBaseData(data, eventData, fixedPoint);
  const { cps, rps, distanceToFixed } = baseData;

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

  // Calculate and set the new position of the perpendicular handles
  updateLine(baseData, newIntersection, data);

  return true;
}
