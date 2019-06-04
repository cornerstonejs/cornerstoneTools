/**
 * Returns true if a point is within an ellipse
 * @export @public @method
 * @name pointInEllipse
 *
 * @param  {Object} ellipse  Object defining the ellipse.
 * @param  {Object} location The location of the point.
 * @param  {Number} theta The angle of ellipse.
 * @returns {boolean} True if the point is within the ellipse.
 */
export default function(ellipse, location, theta) {
  const { xRadius, yRadius, center } = ellipse;

  if (xRadius <= 0.0 || yRadius <= 0.0) {
    return false;
  }

  const normalized = {
    x: location.x - center.x,
    y: location.y - center.y,
  };
  const square = x => x * x;

  /*
   * ((𝑋−𝐶𝑥)cos(𝜃)+(𝑌−𝐶𝑦)sin(𝜃))^2 / (Rx)^2
   * + ((𝑋−𝐶𝑥)sin(𝜃)−(𝑌−𝐶𝑦)cos(𝜃))^2 / (𝑅𝑦)^2 * <= 1
   */
  const ll = normalized.x * Math.cos(theta);
  const lr = normalized.y * Math.sin(theta);
  const rl = normalized.x * Math.sin(theta);
  const rr = normalized.y * Math.cos(theta);

  const r =
    square(ll + lr) / square(xRadius) + square(rl - rr) / square(yRadius) <=
    1.0;

  return r;
}
