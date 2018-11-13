import external from '../externalModules.js';

/**
 * Returns true if a point is enclosed within a bounding box.
 * @export @public @method
 * @name pointInsideBoundingBox
 *
 * @param  {Object} handle The handle containing the boundingBox.
 * @param  {Object} coords The coordinate to check.
 * @returns {boolean} True if the point is enclosed within the bounding box.
 */
export default function(handle, coords) {
  if (!handle.boundingBox) {
    return;
  }

  return external.cornerstoneMath.point.insideRect(coords, handle.boundingBox);
}
