import getImageIdsOfStack from './getImageIdsOfStack.js';
import { globalImageIdSpecificToolStateManager } from '../../stateManagement/index.js';

/**
 * clearToolStateForStack - clears toolstate for all imageIds in the stack.
 * If a tool is specified, then only clear that tool.
 *
 * @param  {HTMLElement} element The element to fetch the stack from.
 * @param  {string} [toolName]  A tool to filter on.
 * @returns {Object} A reference to the cleaned global toolState.
 */
export default function(element, toolName) {
  if (toolName) {
    return _clearToolSpecificToolStateForStack(element, toolName);
  } else {
    return _clearAllToolStateForStack(element);
  }
}

function _clearAllToolStateForStack(element) {
  const imageIds = getImageIdsOfStack(imageIds);
  const globalToolState = globalImageIdSpecificToolStateManager.saveToolState();

  for (let i = 0; i < imageIds.length; i++) {
    const imageIdI = imageIds[i];

    if (globalToolState[imageIdI]) {
      delete globalToolState[imageIdI];
    }
  }

  return globalToolState;
}

function _clearToolSpecificToolStateForStack(element, toolName) {
  const imageIds = getImageIdsOfStack(imageIds);
  const globalToolState = globalImageIdSpecificToolStateManager.saveToolState();

  for (let i = 0; i < imageIds.length; i++) {
    const imageIdI = imageIds[i];

    if (globalToolState[imageIdI] && globalToolState[imageIdI][toolName]) {
      delete globalToolState[imageIdI][toolName];

      if (Object.keys(globalToolState[imageIdI]).length === 0) {
        delete globalToolState[imageIdI];
      }
    }
  }

  return globalToolState;
}
