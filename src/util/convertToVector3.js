import external from '../externalModules.js';

/**
 * Convert an Array to a cornerstoneMath.Vector3
 * @export @public @method
 * @name convertToVector3
 *
 * @param {Array|cornerstoneMath.Vector3} arrayOrVector3 Input array or Vector3
 * @returns {cornerstoneMath.Vector3}
 */
export default function convertToVector3 (arrayOrVector3) {
  const cornerstoneMath = external.cornerstoneMath;

  if (arrayOrVector3 instanceof cornerstoneMath.Vector3) {
    return arrayOrVector3;
  }

  return new cornerstoneMath.Vector3(arrayOrVector3[0], arrayOrVector3[1], arrayOrVector3[2]);
}
