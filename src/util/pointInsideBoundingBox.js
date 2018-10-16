import external from '../externalModules.js';


/**
 * Returns true if a point is enclosed within a bounding box.
 * @export @public @method
 * @name pointInsideBoundingBox
 *
 * @param  {object} handle The handle containing the boundingBox.
 * @param  {object} coords The coordinate to check.
 * @return {boolean} True if the point is enclosed within the bounding box.
 */
export default function (handle, coords) {
  if (!handle.boundingBox) {
    return;
  }

  return external.cornerstoneMath.point.insideRect(coords, handle.boundingBox);
}
