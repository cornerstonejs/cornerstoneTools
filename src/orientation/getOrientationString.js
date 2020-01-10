import external from '../externalModules.js';
import convertToVector3 from '../util/convertToVector3.js';

/**
 * Returns the orientation of the vector in the patient coordinate system.
 * @public
 * @function getOrientationString
 *
 * @param  {Array|cornerstoneMath.Vector3} vector Input array or Vector3
 * @returns {string} The orientation in the patient coordinate system.
 */
export default function(vector) {
  const vec3 = convertToVector3(vector);

  // Thanks to David Clunie
  // https://sites.google.com/site/dicomnotes/

  let orientation = '';
  const orientationX = vec3.x < 0 ? 'R' : 'L';
  const orientationY = vec3.y < 0 ? 'A' : 'P';
  const orientationZ = vec3.z < 0 ? 'F' : 'H';

  // Should probably make this a function vector3.abs
  const abs = new external.cornerstoneMath.Vector3(
    Math.abs(vec3.x),
    Math.abs(vec3.y),
    Math.abs(vec3.z)
  );

  const MIN = 0.0001;

  for (let i = 0; i < 3; i++) {
    if (abs.x > MIN && abs.x > abs.y && abs.x > abs.z) {
      orientation += orientationX;
      abs.x = 0;
    } else if (abs.y > MIN && abs.y > abs.x && abs.y > abs.z) {
      orientation += orientationY;
      abs.y = 0;
    } else if (abs.z > MIN && abs.z > abs.x && abs.z > abs.y) {
      orientation += orientationZ;
      abs.z = 0;
    } else if (abs.x > MIN && abs.y > MIN && abs.x === abs.y) {
      orientation += orientationX + orientationY;
      abs.x = 0;
      abs.y = 0;
    } else if (abs.x > MIN && abs.z > MIN && abs.x === abs.z) {
      orientation += orientationX + orientationZ;
      abs.x = 0;
      abs.z = 0;
    } else if (abs.y > MIN && abs.z > MIN && abs.y === abs.z) {
      orientation += orientationY + orientationZ;
      abs.y = 0;
      abs.z = 0;
    } else {
      break;
    }
  }

  return orientation;
}
