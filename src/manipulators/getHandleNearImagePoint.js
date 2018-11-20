import external from '../externalModules.js';
import pointInsideBoundingBox from '../util/pointInsideBoundingBox.js';

/**
 * Returns the first handle found to be near the provided point. Handles to search can be an array of handles, an
 * object of named handles, or an object of named handles AND named arrays of handles.
 *
 * @public
 * @function getHandleNearImagePoint
 * @memberof Manipulators
 *
 * @param {*} element - Target enabledElement
 * @param {(Array|Object)} handles - An arry of handles, object with named handles, or object with named handles AND named arrays of handles
 * @param {Object} coords - The coordinates to measure from when determining distance from handles
 * @param {number} distanceThreshold - minimum distance handle needs to be from provided coords
 * @returns {Object} Handle
 */
const getHandleNearImagePoint = function(
  element,
  handles,
  coords,
  distanceThreshold
) {
  let nearbyHandle;

  if (!handles) {
    return;
  }

  if (Array.isArray(handles)) {
    const handleKeys = Object.keys(handles);

    for (let i = 0; i < handleKeys.length; i++) {
      const key = handleKeys[i];
      const handle = handles[key];

      if (
        // Not a true handle
        !handle.hasOwnProperty('x') ||
        !handle.hasOwnProperty('y')
      ) {
        continue;
      }

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
        nearbyHandle = getHandleNearImagePoint(
          element,
          handles[handleName],
          coords,
          distanceThreshold
        );
        if (nearbyHandle) {
          break;
        }
      } else {
        const handle = handles[handleName];

        if (
          _isHandleNearImagePoint(handle, element, coords, distanceThreshold)
        ) {
          nearbyHandle = handle;
          break;
        }
      }
    }
  }

  return nearbyHandle;
};

/**
 * Determines if the handle is less than the provided distance from the  provided coordinates
 * @private
 * @function _isHandleNearImagePoint
 *
 * @param {*} handle
 * @param {*} element
 * @param {*} coords
 * @param {*} distanceThreshold
 * @returns {boolean} true if handles is near image point
 */
const _isHandleNearImagePoint = function(
  handle,
  element,
  coords,
  distanceThreshold
) {
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
