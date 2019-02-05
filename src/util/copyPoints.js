/**
 * Returns a copy of the points object.
 * @public
 * @function copyPoints
 *
 * @param  {Object} points - The object to copy.
 * @returns {Object} - The copy.
 */
export default function(points) {
  const page = _copy(points.page);
  const image = _copy(points.image);
  const client = _copy(points.client);
  const canvas = _copy(points.canvas);

  return {
    page,
    image,
    client,
    canvas,
  };
}

/**
 *
 * @private
 * @function _copy
 *
 * @param {Object} point - { x, y }
 * @returns {Object} { x, y }
 */
function _copy({ x, y } = {}) {
  return {
    x,
    y,
  };
}
