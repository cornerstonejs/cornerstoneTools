import {
  getToolState,
  globalImageIdSpecificToolStateManager,
} from '../stateManagement/index.js';

/**
 * getToolStateForStack - Returns the toolState for every imageId in the
 * element's stack. Optionally you can filter to only return a specific tool's
 * state.
 *
 * @param  {HTMLElement} element The element to fetch the stack from.
 * @param  {type} [toolName]  A tool to filter on.
 * @returns {object[]}     The requested toolState.
 */
function getToolStateForStack(element, toolName) {
  const imageIds = _getImageIdsOfStackImages(imageIds);
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

/**
 * invalidateToolStateForStack - Invalidates any toolState in the stack that
 * has an `invalidated` method.
 *
 * @param  {HTMLElement} element - The element to fetch the stack from.
 * @param  {type} [toolName] - A tool to filter on.
 * @returns {Null}
 */
function invalidateToolStateForStack(element, toolName) {
  if (toolName) {
    _invalideToolSpecificToolStateForStack(element, toolName);
  } else {
    _invalidateCompleteToolStateForStack(element);
  }
}

function _invalideToolSpecificToolStateForStack(element, toolName) {
  const imageIds = _getImageIdsOfStackImages(imageIds);
  const globalToolState = globalImageIdSpecificToolStateManager.saveToolState();

  for (let i = 0; i < imageIds.length; i++) {
    const imageIdI = imageIds[i];
    const imageIdSpecificToolState = globalToolState[imageIdI];

    if (imageIdSpecificToolState && imageIdSpecificToolState.toolName) {
      _invalidateImageIdSpecificToolState(imageIdSpecificToolState, toolName);
    }
  }
}

function _invalidateCompleteToolStateForStack(element) {
  const imageIds = _getImageIdsOfStackImages(imageIds);
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

/**
 * mergeToolStateToGlobalToolState - Cleanly merges toolState to the
 * global tool state.
 *
 * @param  {object} toolState - The new toolState to merge with the
 *                              global tool state.
 * @returns {Null}
 */
function mergeToolStateToGlobalToolState(toolState) {}

//

/**
 * clearToolStateForStack - clears toolstate for all imageIds in the stack.
 * If a tool is specified, then only clear that tool.
 *
 * @param  {HTMLElement} element The element to fetch the stack from.
 * @param  {type} [toolName]  A tool to filter on.
 * @returns {Null}
 */
function clearToolStateForStack(element, toolName) {}

function _getImageIdsOfStackImages(element) {
  const stackToolState = getToolState(element, 'stack');

  if (!stackToolState) {
    return;
  }

  return stackToolState.data[0].imageIds;
}
