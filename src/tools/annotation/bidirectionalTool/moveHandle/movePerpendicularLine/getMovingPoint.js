import isPerpendicularEndFixed from './isPerpendicularEndFixed.js';

/**
 * Utility function to return the point that is the opposite of the fixed
 * point (the point not being moved in the bidirectional tool's perpendicular
 * line).
 *
 * @param {*} fixedPoint Point that is not being moved in perpendicular line
 * @param {*} perpendicularStart The start point of the perpencular line
 * @param {*} perpendicularEnd The end point of the perpencular line
 *
 * @returns {*} Point that is being moved in perpendicular line
 */
export default function getMovingPoint(
  fixedPoint,
  perpendicularStart,
  perpendicularEnd
) {
  if (isPerpendicularEndFixed(fixedPoint, perpendicularEnd)) {
    return perpendicularStart;
  }

  return perpendicularEnd;
}
