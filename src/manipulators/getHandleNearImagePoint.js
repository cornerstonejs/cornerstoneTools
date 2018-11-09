import external from '../externalModules.js';
import pointInsideBoundingBox from '../util/pointInsideBoundingBox.js';

/**
 * Returns the first handle found to be near the provided point. Handles to search can be an array of handles, an
 * object of named handles, or an object of named handles AND named arrays of handles.
 *
 * @export
 * @public
 * @method
 * @param {*} element
 * @param {(Array|Object)} handles - An arry of handles, object with named handles, or object with named handles AND named arrays of handles
 * @param {*} coords
 * @param {number} distanceThreshold
 * @returns {Object} Handle
 */
const getHandleNearImagePoint = function (element, handles, coords, distanceThreshold) {
  let nearbyHandle;

  if (!handles) {
    return;
  }

  if (Array.isArray(handles)) {
    for (let i = 0; i < handles.length; i++) {
      const handle = handles[i];

      if (_isHandleNearImagePoint(handle, element, coords, distanceThreshold)) {
        nearbyHandle = handle;
        break;
      }
    }
  } else if (typeof handles === 'object') {
    const handleKeys = Object.keys(handles);

    for (let i = 0; i < handleKeys.length; i++) {
      const handleName = handleKeys[i];

      if (Array.isArray(handles[handleName])) {
        nearbyHandle = getHandleNearImagePoint(element, handles[handleName], coords, distanceThreshold);
        if (nearbyHandle) {
          break;
        }
      } else {
        const handle = handles[handleName];

        if (_isHandleNearImagePoint(handle, element, coords, distanceThreshold)) {
          nearbyHandle = handle;
          break;
        }
      }
    }

  }

  return nearbyHandle;
};


const _isHandleNearImagePoint = function (handle, element, coords, distanceThreshold) {
  if (handle.hasOwnProperty('pointNearHandle')) {
    if (handle.pointNearHandle(element, handle, coords)) {
      return true;
    }
  } else if (handle.hasBoundingBox === true) {
    if (pointInsideBoundingBox(handle, coords)) {
      return true;
    }
  } else {
    const handleCanvas = external.cornerstone.pixelToCanvas(element, handle);
    const distance = external.cornerstoneMath.point.distance(
      handleCanvas,
      coords
    );

    if (distance <= distanceThreshold) {
      return true;
    }
  }

  return false;
};

export default getHandleNearImagePoint;
