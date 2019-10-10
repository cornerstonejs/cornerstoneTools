/**
 * Returns true if the end point is the point that is not being moved in the
 * perpendicular line.
 *
 * @param {*} fixedPoint Point that is not being moved in perpendicular line
 * @param {*} perpendicularEnd The end point of the perpencular line
 *
 * @returns {boolean} Returns true if the fixed point is the end point
 */
export default function isPerpendicularEndFixed(fixedPoint, perpendicularEnd) {
  return fixedPoint === perpendicularEnd;
}
