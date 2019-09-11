import getLineVector from '../../utils/getLineVector';
import getDistanceToIntersection from './getDistanceToIntersection';

/**
 *
 * @param {*} baseData
 * @param {*} mid
 */
export default function updatePerpendicularLine(baseData, mid) {
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
