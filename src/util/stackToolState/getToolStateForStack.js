import getImageIdsOfStack from './getImageIdsOfStack.js';
import { globalImageIdSpecificToolStateManager } from '../../stateManagement/index.js';

/**
 * getToolStateForStack - Returns the toolState for every imageId in the
 * element's stack. Optionally you can filter to only return a specific tool's
 * state.
 *
 * @param  {HTMLElement} element The element to fetch the stack from.
 * @param  {type} [toolName]  A tool to filter on.
 * @returns {object[]}     The requested toolState.
 */
export default function(element, toolName) {
  const imageIds = getImageIdsOfStack(element);
  const globalToolState = globalImageIdSpecificToolStateManager.saveToolState();

  const requestedToolState = [];

  if (toolName) {
    for (let i = 0; i < imageIds.length; i++) {
      const imageIdI = imageIds[i];
      const imageIdSpecificToolState = globalToolState[imageIdI];

      if (imageIdSpecificToolState && imageIdSpecificToolState.toolName) {
        requestedToolState[imageIdI] = imageIdSpecificToolState.toolName;
      }
    }
  } else {
    for (let i = 0; i < imageIds.length; i++) {
      if (globalToolState[imageIds[i]]) {
        requestedToolState.push(globalToolState[imageIds[i]]);
      }
    }
  }

  return requestedToolState;
}
