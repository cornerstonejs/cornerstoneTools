import { getImageIdsOfStack } from './getImageIdsOfStack.js';
import { globalImageIdSpecificToolStateManager } from '../../stateManagement/index.js';

/**
 * invalidateToolStateForStack - Invalidates any toolState in the stack that
 * has an `invalidated` method.
 *
 * @param  {HTMLElement} element - The element to fetch the stack from.
 * @param  {type} [toolName] - A tool to filter on.
 * @returns {Null}
 */
export default function(element, toolName) {
  if (toolName) {
    _invalideToolSpecificToolStateForStack(element, toolName);
  } else {
    _invalidateAllToolStateForStack(element);
  }
}

function _invalideToolSpecificToolStateForStack(element, toolName) {
  const imageIds = getImageIdsOfStack(imageIds);
  const globalToolState = globalImageIdSpecificToolStateManager.saveToolState();

  for (let i = 0; i < imageIds.length; i++) {
    const imageIdI = imageIds[i];
    const imageIdSpecificToolState = globalToolState[imageIdI];

    if (imageIdSpecificToolState && imageIdSpecificToolState.toolName) {
      _invalidateImageIdSpecificToolState(imageIdSpecificToolState, toolName);
    }
  }
}

function _invalidateAllToolStateForStack(element) {
  const imageIds = getImageIdsOfStack(imageIds);
  const globalToolState = globalImageIdSpecificToolStateManager.saveToolState();

  for (let i = 0; i < imageIds.length; i++) {
    const imageIdI = imageIds[i];
    const imageIdSpecificToolState = globalToolState[imageIdI];

    if (imageIdSpecificToolState) {
      Object.keys(imageIdSpecificToolState).forEach(toolName => {
        _invalidateImageIdSpecificToolState(imageIdSpecificToolState, toolName);
      });
    }
  }
}

function _invalidateImageIdSpecificToolState(
  imageIdSpecificToolState,
  toolName
) {
  if (imageIdSpecificToolState[toolName].data) {
    const toolData = imageIdSpecificToolState[toolName].data;

    for (let i = 0; i < toolData.length; i++) {
      if (toolData[i].hasOwnProperty('invalidated')) {
        toolData[i].invalidated = true;
      }
    }
  }
}
