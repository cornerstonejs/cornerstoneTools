
/**
 * Clips a value to an upper and lower bound.
 * @export @public @method
 * @name clip
 *
 * @param  {number} val  The value to clip.
 * @param  {number} low  The lower bound.
 * @param  {number} high The upper bound.
 * @returns {number}      The clipped value.
 */
export default function clip (val, low, high) {
  return Math.min(Math.max(low, val), high);
}


/**
 * Clips a value within a box.
 * @export @public @method
 * @name clipToBox
 *
 * @param  {object} point The point to clip
 * @param  {object} box   The bounding box to clip to.
 * @returns {object}       The clipped point.
 */
export function clipToBox (point, box) {
  // Clip an {x, y} point to a box of size {width, height}
  point.x = clip(point.x, 0, box.width);
  point.y = clip(point.y, 0, box.height);
}
