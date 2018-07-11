import external from '../externalModules.js';


export default function (handle, coords, element) {
  return external.cornerstoneMath.point.distance(external.cornerstone.pixelToCanvas(element, handle), coords);
}
