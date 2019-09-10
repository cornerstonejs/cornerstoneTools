import external from './../../../../externalModules.js';
import getLineVector from '../utils/getLineVector.js';
import getDistanceWithPixelSpacing from './getDistanceWithPixelSpacing.js';
import getBaseData from './getBaseData.js';

function isFixedEnd(fixedPoint, perpendicularEnd) {
  return fixedPoint === perpendicularEnd;
}

function getMultiplier(baseData) {
  const { fixedPoint, perpendicularEnd } = baseData;

  return isFixedEnd(fixedPoint, perpendicularEnd) ? -1 : 1;
}

function getMovingPoint(baseData) {
  const { fixedPoint, perpendicularEnd, perpendicularStart } = baseData;

  if (isFixedEnd(fixedPoint, perpendicularEnd)) {
    return perpendicularStart;
  }

  return perpendicularEnd;
}

function getHelperLine(baseData, proposedPoint, vector) {
  const { columnPixelSpacing, rowPixelSpacing } = baseData;

  // Create a helper line to find the intesection point in the long line
  const highNumber = Number.MAX_SAFE_INTEGER;

  // Get the multiplier
  const multiplier = getMultiplier(baseData) * highNumber;

  return {
    start: proposedPoint,
    end: {
      x: proposedPoint.x + vector.y * rowPixelSpacing * multiplier,
      y: proposedPoint.y + vector.x * columnPixelSpacing * multiplier * -1,
    },
  };
}

function updateLine(baseData, mid, helperLine, vector) {
  const {
    columnPixelSpacing,
    rowPixelSpacing,
    fixedPoint,
    distanceToFixed,
  } = baseData;

  // Get the multiplier
  const multiplier = getMultiplier(baseData) * distanceToFixed;

  // Define the moving point
  const movingPoint = getMovingPoint(baseData);

  // Change the position of the perpendicular line handles
  movingPoint.x = helperLine.start.x;
  movingPoint.y = helperLine.start.y;
  fixedPoint.x = mid.x + vector.y * rowPixelSpacing * multiplier;
  fixedPoint.y = mid.y + vector.x * columnPixelSpacing * multiplier * -1;
}

// Move perpendicular line handles
export default function(proposedPoint, data, eventData, fixedPoint) {
  const { lineSegment } = external.cornerstoneMath;
  const baseData = getBaseData(data, eventData, fixedPoint);
  const {
    columnPixelSpacing,
    rowPixelSpacing,
    start,
    end,
    longLine,
    intersection,
  } = baseData;

  const longLineLength = getDistanceWithPixelSpacing(
    columnPixelSpacing,
    rowPixelSpacing,
    start,
    end
  );

  // Stop here if the long line has no length
  if (longLineLength === 0) {
    return false;
  }

  // Inclination of the perpendicular line
  const vector = getLineVector(
    columnPixelSpacing,
    rowPixelSpacing,
    start,
    intersection
  );

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
