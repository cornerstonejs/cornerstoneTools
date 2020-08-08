import { removeToolState } from '../stateManagement/toolState.js';
import {
  anyHandlesOutsideDisplayedArea,
  anyHandlesOutsideImage,
} from './index.js';

/**
 * Delete the measurement if it has any handle outside the image or displayed
 * area's boundaries depending on the defined handle moving options.
 * If both deletion flags are false, it will delete the measurement.
 * @public
 * @function deleteIfHandleOutsideLimits
 * @memberof Manipulators
 *
 * @param {string} toolName - The tool which the annotation belongs to
 * @param {Object} annotation - The annotation to have its handles verified
 * @param {Object} options - An object containing the handles' moving options
 */
export default function(toolName, annotation, options = {}) {
  // If any handle is outside the image, delete the tool data
  if (
    (options.deleteIfHandleOutsideDisplayedArea &&
      anyHandlesOutsideDisplayedArea(evt.detail, annotation.handles)) ||
    (options.deleteIfHandleOutsideImage &&
      anyHandlesOutsideImage(evt.detail, annotation.handles))
  ) {
    annotation.cancelled = true;
    removeToolState(element, toolName, annotation);
  }
}
