import * as cornerstoneMath from 'cornerstone-math';

export default function (vector) {
    // Thanks to David Clunie
    // https://sites.google.com/site/dicomnotes/

  let orientation = '';
  const orientationX = vector.x < 0 ? 'R' : 'L';
  const orientationY = vector.y < 0 ? 'A' : 'P';
  const orientationZ = vector.z < 0 ? 'F' : 'H';

    // Should probably make this a function vector3.abs
  const abs = new cornerstoneMath.Vector3(Math.abs(vector.x), Math.abs(vector.y), Math.abs(vector.z));

  for (let i = 0; i < 3; i++) {
    if (abs.x > 0.0001 && abs.x > abs.y && abs.x > abs.z) {
      orientation += orientationX;
      abs.x = 0;
    } else if (abs.y > 0.0001 && abs.y > abs.x && abs.y > abs.z) {
      orientation += orientationY;
      abs.y = 0;
    } else if (abs.z > 0.0001 && abs.z > abs.x && abs.z > abs.y) {
      orientation += orientationZ;
      abs.z = 0;
    } else {
      break;
    }
  }

  return orientation;
}
