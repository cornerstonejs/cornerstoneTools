import getHandleNearImagePoint from './getHandleNearImagePoint.js';

/**
 * Update the active handle
 * @public
 * @function handleActivator
 * @memberof Manipulators
 *
 * @param {*} element
 * @param {*} handles
 * @param {*} canvasPoint
 * @param {*} distanceThreshold
 * @returns {Boolean} - True if a handle was activated
 */
export default function(element, handles, canvasPoint, distanceThreshold) {
  if (!distanceThreshold) {
    distanceThreshold = 6;
  }

  const activeHandle = _getActiveHandle(handles);
  const nearbyHandle = getHandleNearImagePoint(
    element,
    handles,
    canvasPoint,
    distanceThreshold
  );

  if (activeHandle !== nearbyHandle) {
    if (nearbyHandle !== undefined) {
      nearbyHandle.active = true;
    }

    if (activeHandle !== undefined) {
      activeHandle.active = false;
    }

    return true;
  }

  return false;
}

/**
 *
 * @private
 *
 * @param {*} handles
 * @returns {Object} - Activated Handle
 */
function _getActiveHandle(handles) {
  let activeHandle;

  Object.keys(handles).forEach(function(name) {
    const handle = handles[name];

    if (handle.active === true) {
      activeHandle = handle;

      return;
    }
  });

  return activeHandle;
}
