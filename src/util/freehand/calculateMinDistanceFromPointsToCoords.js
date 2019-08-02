import external from './../../externalModules.js';

/**
 * Calculates the minimum distance from the provided points to the coordinates.
 * @export @public @method
 * @name calculateMinDistanceFromPointsToCoords
 *
 * @param {Object[]} points The points to iterate over to find the minimum distance
 * @param {Object} coords The coordinates we're measuring from
 * @returns {Number} The minimum distance or -1 if no minimum distance could be calculated
 */
function calculateMinDistanceFromPointsToCoords(points, coords) {
  const minimumDistance = points.reduce((minDistance, point) => {
    const distance = external.cornerstoneMath.point.distance(point, coords);

    return Math.min(minDistance, distance);
  }, Infinity);

  // If an error caused distance not to be calculated, return -1.
  if (minimumDistance === Infinity) {
    return -1;
  }

  return minimumDistance;
}

export default calculateMinDistanceFromPointsToCoords;
