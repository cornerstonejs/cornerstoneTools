import { globalImageIdSpecificToolStateManager } from '../../stateManagement/index.js';

/**
 * mergeToolStateToGlobalToolState - Cleanly merges toolState to the
 * global tool state.
 *
 * @param  {object} newToolState - The new toolState to merge with the
 *                              global tool state.
 * @returns {Null}
 */
export default function(newToolState) {
  const globalToolState = globalImageIdSpecificToolStateManager.saveToolState();

  Object.keys(newToolState).forEach(imageId => {
    if (!globalToolState[imageId]) {
      globalToolState[imageId] = {};
    }

    _mergeImageIdSpecificToolState(
      globalToolState[imageId],
      newToolState[imageId]
    );
  });
}

function _mergeImageIdSpecificToolState(globalToolState, newToolState) {
  Object.keys(newToolState).forEach(toolName => {
    if (!globalToolState[toolName]) {
      globalToolState[toolName] = {};
      globalToolState[toolName].data = [];
    } else if (globalToolState[toolName].data) {
      globalToolState[toolName].data = [];
    }

    globalToolState[toolName].data.concat(newToolState[toolName].data);
  });
}
