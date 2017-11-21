import external from '../externalModules.js';

export default function (handle, coords) {
  if (!handle.boundingBox) {
    return;
  }

  return external.cornerstoneMath.point.insideRect(coords, handle.boundingBox);
}
