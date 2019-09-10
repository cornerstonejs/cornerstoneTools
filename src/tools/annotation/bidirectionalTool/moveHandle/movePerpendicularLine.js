import external from './../../../../externalModules.js';
import getDistance from './getDistance.js';
import getLineVector from './getLineVector.js';
import getBaseData from './getBaseData.js';

function isFixedEnd(baseData) {
  const { fixedPoint, perpendicularEnd } = baseData;

  return fixedPoint === perpendicularEnd;
}

function getMultiplier(baseData) {
  return isFixedEnd(baseData) ? -1 : 1;
}

function getMovingPoint(baseData) {
  const { perpendicularEnd, perpendicularStart } = baseData;

  return isFixedEnd(baseData) ? perpendicularStart : perpendicularEnd;
}

function getHelperLine(baseData, proposedPoint, vector) {
  const { cps, rps } = baseData;

  // Create a helper line to find the intesection point in the long line
  const highNumber = Number.MAX_SAFE_INTEGER;

  // Get the multiplier
  const multiplier = getMultiplier(baseData);

  return {
    start: proposedPoint,
    end: {
      x: proposedPoint.x + vector.y * highNumber * rps * multiplier,
      y: proposedPoint.y + vector.x * highNumber * cps * multiplier * -1,
    },
  };
}

function updateLine(baseData, mid, helperLine, vector) {
  const { cps, rps, fixedPoint, distanceToFixed } = baseData;

  // Get the multiplier
  const multiplier = getMultiplier(baseData);

  // Define the moving point
  const movingPoint = getMovingPoint(baseData);

  // Change the position of the perpendicular line handles
  movingPoint.x = helperLine.start.x;
  movingPoint.y = helperLine.start.y;
  fixedPoint.x = mid.x + vector.y * distanceToFixed * rps * multiplier;
  fixedPoint.y = mid.y + vector.x * distanceToFixed * cps * multiplier * -1;
}

// Move perpendicular line handles
export default function(proposedPoint, data, eventData, fixedPoint) {
  const { lineSegment } = external.cornerstoneMath;
  const baseData = getBaseData(data, eventData, fixedPoint);
  const { cps, rps, start, end, longLine, intersection } = baseData;

  const longLineLength = getDistance(cps, rps, start, end);

  // Stop here if the long line has no length
  if (longLineLength === 0) {
    return false;
  }

  // Inclination of the perpendicular line
  const vector = getLineVector(cps, rps, start, intersection);

  // Get a helper line to calculate the intersection
  const helperLine = getHelperLine(baseData, proposedPoint, vector);

  // Find the new intersection in the long line
  const newIntersection = lineSegment.intersectLine(longLine, helperLine);

  // Stop the flow here if there's no intersection point between lines
  if (!newIntersection) {
    return false;
  }

  // Change the position of the perpendicular line handles
  updateLine(baseData, newIntersection, helperLine, vector);

  return true;
}
