import { clipToBox, clip } from '../util/clip';
import external from '../externalModules.js';

/**
 * Clip the handle inside the image or displayed area's boundaries depending on
 * the defined handle moving options. If both prevention flags are false, it
 * will not change the handle's position.
 * @public
 * @function clipHandle
 * @memberof Manipulators
 *
 * @param {Object} eventData - Data object associated with the event.
 * @param {Object} handle - The handle to be clipped (arg will be mutated)
 * @param {Object} [options={}] - An object containing the handles' moving options
 * @returns {void}
 */
export default function(eventData, handle, options = {}) {
  const { image, viewport } = eventData;
  if (options.preventHandleOutsideDisplayedArea) {
    const { getDisplayedArea } = external.cornerstone;
    const { tlhc, brhc } = getDisplayedArea(image, viewport);

    handle.x = clip(handle.x, tlhc.x - 1, brhc.x);
    handle.y = clip(handle.y, tlhc.y - 1, brhc.y);
  } else if (options.preventHandleOutsideImage) {
    clipToBox(handle, image);
  }
}
