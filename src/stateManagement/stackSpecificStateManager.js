import { globalImageIdSpecificToolStateManager } from './imageIdSpecificStateManager';
import { getElementToolStateManager, setElementToolStateManager } from './toolState';

// This implements an Stack specific tool state management strategy.  This means
// That tool data is shared between all imageIds in a given stack
function newStackSpecificToolStateManager (toolTypes, oldStateManager) {
  let toolState = {};

  function saveToolState () {
    return toolState;
  }

  function restoreToolState (stackToolState) {
    toolState = stackToolState;
  }

    // Here we add tool state, this is done by tools as well
    // As modules that restore saved state
  function addStackSpecificToolState (element, toolType, data) {
        // If this is a tool type to apply to the stack, do so
    if (toolTypes.indexOf(toolType) >= 0) {

            // If we don't have tool state for this type of tool, add an empty object
      if (toolState.hasOwnProperty(toolType) === false) {
        toolState[toolType] = {
          data: []
        };
      }

      const toolData = toolState[toolType];

            // Finally, add this new tool to the state
      toolData.data.push(data);
    } else {
            // Call the imageId specific tool state manager
      return oldStateManager.add(element, toolType, data);
    }
  }

    // Here you can get state - used by tools as well as modules
    // That save state persistently
  function getStackSpecificToolState (element, toolType) {
        // If this is a tool type to apply to the stack, do so
    if (toolTypes.indexOf(toolType) >= 0) {
            // If we don't have tool state for this type of tool, add an empty object
      if (toolState.hasOwnProperty(toolType) === false) {
        toolState[toolType] = {
          data: []
        };
      }

      return toolState[toolType];
    }

    // Call the imageId specific tool state manager
    return oldStateManager.get(element, toolType);

  }

  const stackSpecificToolStateManager = {
    get: getStackSpecificToolState,
    add: addStackSpecificToolState,
    saveToolState,
    restoreToolState,
    toolState
  };


  return stackSpecificToolStateManager;
}

const stackStateManagers = [];

function addStackStateManager (element, otherTools) {
  let oldStateManager = getElementToolStateManager(element);

  if (!oldStateManager) {
    oldStateManager = globalImageIdSpecificToolStateManager;
  }

  let stackTools = ['stack', 'stackPrefetch', 'playClip', 'volume', 'slab', 'referenceLines', 'crosshairs'];

  if (otherTools) {
    stackTools = stackTools.concat(otherTools);
  }

  const stackSpecificStateManager = newStackSpecificToolStateManager(stackTools, oldStateManager);

  stackStateManagers.push(stackSpecificStateManager);
  setElementToolStateManager(element, stackSpecificStateManager);
}

export {
  newStackSpecificToolStateManager,
  addStackStateManager
};
