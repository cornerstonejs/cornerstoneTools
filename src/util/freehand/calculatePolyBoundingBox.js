function _getPointBounds(point) {
  return {
    left: point.x,
    right: point.x,
    bottom: point.y,
    top: point.y,
  };
}

/**
 * Calculates the bounding rectangle around a list of points
 * @export @public @method
 * @name calculatePolyBoundingBox
 *
 * @param {Object[]} points The list of points to contain
 * @returns {Object} The attributes of the bounding box, undefined if no points provided
 */
function calculatePolyBoundingBox(points) {
  if (points.length === 0) {
    return;
  }

  const bounds = points.reduce((roiBounds, point) => {
    const pointBounds = _getPointBounds(point);

    return {
      left: Math.min(roiBounds.left, pointBounds.left),
      right: Math.max(roiBounds.right, pointBounds.right),
      bottom: Math.min(roiBounds.bottom, pointBounds.bottom),
      top: Math.max(roiBounds.top, pointBounds.top),
    };
  }, _getPointBounds(points[0]));

  return {
    left: bounds.left,
    top: bounds.bottom,
    width: Math.abs(bounds.right - bounds.left),
    height: Math.abs(bounds.top - bounds.bottom),
  };
}

export default calculatePolyBoundingBox;
