import external from '../externalModules.js';

/**
 * Returns a copy the points object.
 * @public
 * @function copyPoints
 *
 * @param  {object} points - The object to copy.
 * @returns {object} - The copy.
 */
export default function(points) {
  const page = external.cornerstoneMath.point.copy(points.page);
  const image = external.cornerstoneMath.point.copy(points.image);
  const client = external.cornerstoneMath.point.copy(points.client);
  const canvas = external.cornerstoneMath.point.copy(points.canvas);

  return {
    page,
    image,
    client,
    canvas,
  };
}
