import isPerpendicularEndFixed from './isPerpendicularEndFixed.js';

/**
 * Return the direction multiplier based on the perpendicular fixed point and
 * the end point.
 *
 * @param {*} fixedPoint Point that is not being moved in perpendicular line
 * @param {*} perpendicularEnd The end point of the perpencular line
 *
 * @returns {number} Returns -1 if end point is not being moved or 1 if it is
 */
export default function getDirectionMultiplier(fixedPoint, perpendicularEnd) {
  return isPerpendicularEndFixed(fixedPoint, perpendicularEnd) ? -1 : 1;
}
