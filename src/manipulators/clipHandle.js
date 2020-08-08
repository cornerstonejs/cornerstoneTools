import { clipToBox, clip } from '../util/clip';

/**
 * Clip the handle inside the image or displayed area's boundaries depending on
 * the defined handle moving options. If both prevention flags are false, it
 * will not change the handle's position.
 * @public
 * @function clipHandle
 * @memberof Manipulators
 *
 * @param {Object} options - An object containing the handles' moving options
 */
export default function(handle, options = {}) {
  if (options.preventHandleOutsideDisplayedArea) {
    const { tlhc, brhc } = viewport.displayedArea;

    handle.x = clip(handle.x, tlhc.x - 1, brhc.x);
    handle.y = clip(handle.y, tlhc.y - 1, brhc.y);
  } else if (options.preventHandleOutsideImage) {
    clipToBox(handle, evt.detail.image);
  }
}
