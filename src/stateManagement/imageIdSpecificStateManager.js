import * as cornerstone from 'cornerstone-core';

// This implements an imageId specific tool state management strategy.  This means that
// Measurements data is tied to a specific imageId and only visible for enabled elements
// That are displaying that imageId.

function newImageIdSpecificToolStateManager () {
  let toolState = {};

    // Here we add tool state, this is done by tools as well
    // As modules that restore saved state

  function saveImageIdToolState (imageId) {
    return toolState[imageId];
  }

  function restoreImageIdToolState (imageId, imageIdToolState) {
    toolState[imageId] = imageIdToolState;
  }

  function saveToolState () {
    return toolState;
  }

  function restoreToolState (savedToolState) {
    toolState = savedToolState;
  }

    // Here we add tool state, this is done by tools as well
    // As modules that restore saved state
  function addImageIdSpecificToolState (element, toolType, data) {
    const enabledImage = cornerstone.getEnabledElement(element);
        // If we don't have any tool state for this imageId, add an empty object

    if (!enabledImage.image || toolState.hasOwnProperty(enabledImage.image.imageId) === false) {
      toolState[enabledImage.image.imageId] = {};
    }

    const imageIdToolState = toolState[enabledImage.image.imageId];

        // If we don't have tool state for this type of tool, add an empty object
    if (imageIdToolState.hasOwnProperty(toolType) === false) {
      imageIdToolState[toolType] = {
        data: []
      };
    }

    const toolData = imageIdToolState[toolType];

        // Finally, add this new tool to the state
    toolData.data.push(data);
  }

    // Here you can get state - used by tools as well as modules
    // That save state persistently
  function getImageIdSpecificToolState (element, toolType) {
    const enabledImage = cornerstone.getEnabledElement(element);
        // If we don't have any tool state for this imageId, return undefined

    if (!enabledImage.image || toolState.hasOwnProperty(enabledImage.image.imageId) === false) {
      return;
    }

    const imageIdToolState = toolState[enabledImage.image.imageId];

        // If we don't have tool state for this type of tool, return undefined
    if (imageIdToolState.hasOwnProperty(toolType) === false) {
      return;
    }

    const toolData = imageIdToolState[toolType];


    return toolData;
  }

    // Clears all tool data from this toolStateManager.
  function clearImageIdSpecificToolStateManager (element) {
    const enabledImage = cornerstone.getEnabledElement(element);

    if (!enabledImage.image || toolState.hasOwnProperty(enabledImage.image.imageId) === false) {
      return;
    }

    delete toolState[enabledImage.image.imageId];
  }

  return {
    get: getImageIdSpecificToolState,
    add: addImageIdSpecificToolState,
    clear: clearImageIdSpecificToolStateManager,
    saveImageIdToolState,
    restoreImageIdToolState,
    saveToolState,
    restoreToolState,
    toolState
  };
}

// A global imageIdSpecificToolStateManager - the most common case is to share state between all
// Visible enabled images
const globalImageIdSpecificToolStateManager = newImageIdSpecificToolStateManager();

export {
  newImageIdSpecificToolStateManager,
  globalImageIdSpecificToolStateManager
};
