import pointInsideBoundingBox from '../util/pointInsideBoundingBox.js';
import handleDistance from '../util/handleDistance.js';

export default function (element, handles, coords, distanceThreshold) {
  let nearbyHandle;

  if (!handles) {
    return;
  }

  Object.keys(handles).forEach(function (name) {
    const handle = handles[name];

    if (handle.hasOwnProperty('pointNearHandle')) {
      if (handle.pointNearHandle(element, handle, coords)) {
        nearbyHandle = handle;

        return;
      }
    } else if (handle.hasBoundingBox === true) {
      if (pointInsideBoundingBox(handle, coords)) {
        nearbyHandle = handle;

        return;
      }
    } else if (handleDistance(handle, coords, element) <= distanceThreshold) {
      nearbyHandle = handle;

      return;
    }
  });

  return nearbyHandle;
}
