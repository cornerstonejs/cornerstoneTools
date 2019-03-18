import { getImageIdsOfStack } from './getImageIdsOfStack.js';
import { globalImageIdSpecificToolStateManager } from '../../stateManagement/index.js';

/**
 * clearToolStateForStack - clears toolstate for all imageIds in the stack.
 * If a tool is specified, then only clear that tool.
 *
 * @param  {HTMLElement} element The element to fetch the stack from.
 * @param  {type} [toolName]  A tool to filter on.
 * @returns {Null}
 */
export default function(element, toolName) {
  if (toolName) {
    _clearToolSpecificToolStateForStack(element, toolName);
  } else {
    _clearAllToolStateForStack(element);
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
}

function _clearToolSpecificToolStateForStack(element, toolName) {
  const imageIds = getImageIdsOfStack(imageIds);
  const globalToolState = globalImageIdSpecificToolStateManager.saveToolState();

  for (let i = 0; i < imageIds.length; i++) {
    const imageIdI = imageIds[i];

    if (globalToolState[imageIdI] && globalToolState[imageIdI][toolName]) {
      delete globalToolState[imageIdI][toolName];
    }
  }
}
