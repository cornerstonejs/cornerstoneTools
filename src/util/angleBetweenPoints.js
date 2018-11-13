/**
 * Calculates the (interior) angle in degrees from the initial mouse location
 * to the current mouse location in relation to the center point.
 * @public
 * @function angleBetweenPoints
 *
 * @param  {Object} p0  The center point.
 * @param  {Object} p1  The initial point.
 * @param  {Object} p2  The final point.
 * @returns {Object} { angle, direction }
 */
export default (p0, p1, p2) => {
  const p12 = Math.sqrt(Math.pow(p0.x - p1.x, 2) + Math.pow(p0.y - p1.y, 2));
  const p13 = Math.sqrt(Math.pow(p0.x - p2.x, 2) + Math.pow(p0.y - p2.y, 2));
  const p23 = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

  const angle =
    (Math.acos(
      (Math.pow(p12, 2) + Math.pow(p13, 2) - Math.pow(p23, 2)) / (2 * p12 * p13)
    ) *
      180) /
    Math.PI;

  // The direction of the angle (> 0 clockwise, < 0 anti-clockwise)
  const direction =
    (p1.x - p0.x) * (p2.y - p0.y) - (p1.y - p0.y) * (p2.x - p0.x);

  return {
    angle,
    direction,
  };
};
