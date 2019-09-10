import getLineVector from '../utils/getLineVector.js';
import getDistanceWithPixelSpacing from './getDistanceWithPixelSpacing.js';
import getBaseData from './getBaseData.js';

function updateLine(baseData, mid, data) {
  const {
    columnPixelSpacing,
    rowPixelSpacing,
    intersection,
    fixedPoint,
  } = baseData;
  const { start, perpendicularStart, perpendicularEnd } = data.handles;

  // Get the original distance from perpendicular handles to intersection
  const distancePS = getDistanceWithPixelSpacing(
    columnPixelSpacing,
    rowPixelSpacing,
    perpendicularStart,
    intersection
  );
  const distancePE = getDistanceWithPixelSpacing(
    columnPixelSpacing,
    rowPixelSpacing,
    perpendicularEnd,
    intersection
  );

  // Inclination of the perpendicular line
  const vector = getLineVector(
    columnPixelSpacing,
    rowPixelSpacing,
    fixedPoint,
    mid
  );

  // Define the multiplier
  const multiplier = fixedPoint === start ? 1 : -1;

  // Calculate and set the new position of the perpendicular handles
  perpendicularStart.x =
    mid.x + vector.y * distancePS * rowPixelSpacing * multiplier;
  perpendicularStart.y =
    mid.y + vector.x * distancePS * columnPixelSpacing * multiplier * -1;
  perpendicularEnd.x =
    mid.x + vector.y * distancePE * rowPixelSpacing * multiplier * -1;
  perpendicularEnd.y =
    mid.y + vector.x * distancePE * columnPixelSpacing * multiplier;
}

export default function moveLongLine(
  proposedPoint,
  data,
  eventData,
  fixedPoint
) {
  const baseData = getBaseData(data, eventData, fixedPoint);
  const { columnPixelSpacing, rowPixelSpacing, distanceToFixed } = baseData;

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
  updateLine(baseData, newIntersection, data);

  return true;
}
