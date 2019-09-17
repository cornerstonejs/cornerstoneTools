import getLineVector from '../../utils/getLineVector';
import getDistanceToIntersection from './getDistanceToIntersection';

/**
 * Returns the updated line object that will be used to change the position of
 * the perpendicular line handles.
 *
 * @param {*} baseData Base data for bidirectional line moving
 * @param {*} mid Middle point considering the proposed point
 *
 * @returns {*} Returns a line object with the updated handles position
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

  // Calculate and return the new position of the perpendicular handles
  return {
    start: {
      x: mid.x + vector.y * distancePS * rowMultiplier,
      y: mid.y + vector.x * distancePS * columnMultiplier * -1,
    },
    end: {
      x: mid.x + vector.y * distancePE * rowMultiplier * -1,
      y: mid.y + vector.x * distancePE * columnMultiplier,
    },
  };
}
