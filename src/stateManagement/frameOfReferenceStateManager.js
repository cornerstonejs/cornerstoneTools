/**
 * Implements a frame-of-reference specific tool state management strategy.  This means that
 * Measurement data are tied to a specific frame of reference UID and only visible to objects using
 * That frame-of-reference UID.
 * @public
 * @constructor newFrameOfReferenceSpecificToolStateManager
 * @memberof StateManagement
 *
 * @returns {Object} A frameOfReferenceSpecificToolStateManager instance.
 */
function newFrameOfReferenceSpecificToolStateManager() {
  const toolState = {};

  // Here we add tool state, this is done by tools as well
  // As modules that restore saved state
  function addFrameOfReferenceSpecificToolState(
    frameOfReference,
    toolName,
    data
  ) {
    // If we don't have any tool state for this frameOfReference, add an empty object
    if (toolState.hasOwnProperty(frameOfReference) === false) {
      toolState[frameOfReference] = {};
    }

    const frameOfReferenceToolState = toolState[frameOfReference];

    // If we don't have tool state for this type of tool, add an empty object
    if (frameOfReferenceToolState.hasOwnProperty(toolName) === false) {
      frameOfReferenceToolState[toolName] = {
        data: [],
      };
    }

    const toolData = frameOfReferenceToolState[toolName];

    // Finally, add this new tool to the state
    toolData.data.push(data);
  }

  // Here you can get state - used by tools as well as modules
  // That save state persistently
  function getFrameOfReferenceSpecificToolState(frameOfReference, toolName) {
    // If we don't have any tool state for this frame of reference, return undefined
    if (toolState.hasOwnProperty(frameOfReference) === false) {
      return;
    }

    const frameOfReferenceToolState = toolState[frameOfReference];

    // If we don't have tool state for this type of tool, return undefined
    if (frameOfReferenceToolState.hasOwnProperty(toolName) === false) {
      return;
    }

    const toolData = frameOfReferenceToolState[toolName];

    return toolData;
  }

  function removeFrameOfReferenceSpecificToolState(
    frameOfReference,
    toolName,
    data
  ) {
    // If we don't have any tool state for this frame of reference, return undefined
    if (toolState.hasOwnProperty(frameOfReference) === false) {
      return;
    }

    const frameOfReferenceToolState = toolState[frameOfReference];

    // If we don't have tool state for this type of tool, return undefined
    if (frameOfReferenceToolState.hasOwnProperty(toolName) === false) {
      return;
    }

    const toolData = frameOfReferenceToolState[toolName];
    // Find this tool data
    let indexOfData = -1;

    for (let i = 0; i < toolData.data.length; i++) {
      if (toolData.data[i] === data) {
        indexOfData = i;
      }
    }

    if (indexOfData !== -1) {
      toolData.data.splice(indexOfData, 1);
    }
  }

  return {
    get: getFrameOfReferenceSpecificToolState,
    add: addFrameOfReferenceSpecificToolState,
    remove: removeFrameOfReferenceSpecificToolState,
  };
}

// A global frameOfReferenceSpecificToolStateManager - the most common case is to share 3d information
// Between stacks of images
const globalFrameOfReferenceSpecificToolStateManager = newFrameOfReferenceSpecificToolStateManager();

export {
  newFrameOfReferenceSpecificToolStateManager,
  globalFrameOfReferenceSpecificToolStateManager,
};
