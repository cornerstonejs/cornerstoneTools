import { cornerstoneMath } from '../externalModules.js';

export default function (handle, coords) {
  if (!handle.boundingBox) {
    return;
  }

  return cornerstoneMath.point.insideRect(coords, handle.boundingBox);
}
