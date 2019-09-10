import getLineVector from '../utils/getLineVector.js';
import getDistanceWithPixelSpacing from '../utils/getDistanceWithPixelSpacing.js';
import getBaseData from './getBaseData.js';

function getDistanceToIntersection(baseData, point) {
  const { columnPixelSpacing, rowPixelSpacing, intersection } = baseData;

  return getDistanceWithPixelSpacing(
    columnPixelSpacing,
    rowPixelSpacing,
    point,
    intersection
  );
}

function updateLine(baseData, mid) {
  const {
    columnPixelSpacing,
    rowPixelSpacing,
    start,
    perpendicularStart,
    perpendicularEnd,
    fixedPoint,
  } = baseData;

  // Get the original distance from perpendicular handles to intersection
  const distancePS = getDistanceToIntersection(baseData, perpendicularStart);
  const distancePE = getDistanceToIntersection(baseData, perpendicularEnd);

  // Inclination of the perpendicular line
  const vector = getLineVector(
    columnPixelSpacing,
    rowPixelSpacing,
    fixedPoint,
    mid
  );

  // Define the multiplier
  const multiplier = fixedPoint === start ? 1 : -1;
  const rowMultiplier = multiplier * rowPixelSpacing;
  const columnMultiplier = multiplier * columnPixelSpacing;

  // Calculate and set the new position of the perpendicular handles
  perpendicularStart.x = mid.x + vector.y * distancePS * rowMultiplier;
  perpendicularStart.y = mid.y + vector.x * distancePS * columnMultiplier * -1;
  perpendicularEnd.x = mid.x + vector.y * distancePE * rowMultiplier * -1;
  perpendicularEnd.y = mid.y + vector.x * distancePE * columnMultiplier;
}

export default function moveLongLine(
  proposedPoint,
  data,
  eventData,
  fixedPoint
) {
  const baseData = getBaseData(data, eventData, fixedPoint);
  const { columnPixelSpacing, rowPixelSpacing, distanceToFixed } = baseData;

  // Calculate the length of the new line, considering the proposed point
  const newLineLength = getDistanceWithPixelSpacing(
    columnPixelSpacing,
    rowPixelSpacing,
    fixedPoint,
    proposedPoint
  );

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
  updateLine(baseData, newIntersection);

  return true;
}
