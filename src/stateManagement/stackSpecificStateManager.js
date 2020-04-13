import { globalImageIdSpecificToolStateManager } from './imageIdSpecificStateManager.js';
import {
  getElementToolStateManager,
  setElementToolStateManager,
} from './toolState.js';

/**
 * Implements an Stack specific tool state management strategy. This means
 * That tool data is shared between all imageIds in a given stack.
 * @public
 * @constructor newStackSpecificToolStateManager
 * @memberof StateManagement
 *
 * @param {string[]} toolNames     List of tools that should have state shared across a stack (a display set) of images
 * @param {Object} oldStateManager The imageIdSpecificStateManager.
 * @returns {Object} A stackSpecificToolStateManager instance.
 */
function newStackSpecificToolStateManager(toolNames, oldStateManager) {
  let toolState = {};

  function saveToolState() {
    return toolState;
  }

  function restoreToolState(stackToolState) {
    toolState = stackToolState;
  }

  // Here we add tool state, this is done by tools as well
  // As modules that restore saved state
  function addStackSpecificToolState(element, toolName, data) {
    // If this is a tool type to apply to the stack, do so
    if (toolNames.indexOf(toolName) >= 0) {
      // If we don't have tool state for this tool name, add an empty object
      if (toolState.hasOwnProperty(toolName) === false) {
        toolState[toolName] = {
          data: [],
        };
      }

      const toolData = toolState[toolName];

      // Finally, add this new tool to the state
      toolData.data.push(data);
    } else {
      // Call the imageId specific tool state manager
      return oldStateManager.add(element, toolName, data);
    }
  }

  // Here you can get state - used by tools as well as modules
  // That save state persistently
  function getStackSpecificToolState(element, toolName) {
    // If this is a tool type to apply to the stack, do so
    if (toolNames.indexOf(toolName) >= 0) {
      // If we don't have tool state for this tool name, add an empty object
      if (toolState.hasOwnProperty(toolName) === false) {
        toolState[toolName] = {
          data: [],
        };
      }

      return toolState[toolName];
    }

    // Call the imageId specific tool state manager
    return oldStateManager.get(element, toolName);
  }

  const stackSpecificToolStateManager = {
    get: getStackSpecificToolState,
    add: addStackSpecificToolState,
    saveToolState,
    restoreToolState,
    toolState,
  };

  return stackSpecificToolStateManager;
}

const stackStateManagers = [];

function addStackStateManager(element, otherTools) {
  let oldStateManager = getElementToolStateManager(element);

  if (!oldStateManager) {
    oldStateManager = globalImageIdSpecificToolStateManager;
  }

  let stackTools = [
    'stack',
    'stackPrefetch',
    'playClip',
    'volume',
    'slab',
    'referenceLines',
    'crosshairs',
    'stackRenderer',
  ];

  if (otherTools) {
    stackTools = stackTools.concat(otherTools);
  }

  const stackSpecificStateManager = newStackSpecificToolStateManager(
    stackTools,
    oldStateManager
  );

  stackStateManagers.push(stackSpecificStateManager);
  setElementToolStateManager(element, stackSpecificStateManager);
}

const stackSpecificStateManager = {
  newStackSpecificToolStateManager,
  addStackStateManager,
};

export {
  stackSpecificStateManager,
  newStackSpecificToolStateManager,
  addStackStateManager,
};
