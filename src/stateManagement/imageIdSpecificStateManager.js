import external from '../externalModules.js';

/**
 * Implements an imageId specific tool state management strategy.  This means that
 * Measurements data is tied to a specific imageId and only visible for enabled elements
 * That are displaying that imageId.
 * @public
 * @constructor newImageIdSpecificToolStateManager
 * @memberof StateManagement
 *
 * @returns {Object} An imageIdSpecificToolStateManager instance.
 */
function newImageIdSpecificToolStateManager() {
  let toolState = {};

  // Here we add tool state, this is done by tools as well
  // As modules that restore saved state

  function saveImageIdToolState(imageId) {
    return toolState[imageId];
  }

  function restoreImageIdToolState(imageId, imageIdToolState) {
    toolState[imageId] = imageIdToolState;
  }

  function saveToolState() {
    return toolState;
  }

  function restoreToolState(savedToolState) {
    toolState = savedToolState;
  }

  // Here we add tool state, this is done by tools as well
  // As modules that restore saved state
  function addElementToolState(element, toolType, data) {
    const enabledElement = external.cornerstone.getEnabledElement(element);

    // If we don't have an image for this element exit early
    if (!enabledElement.image) {
      return;
    }
    addImageIdToolState(enabledElement.image.imageId, toolType, data);
  }

  function addImageIdToolState(imageId, toolType, data) {
    // If we don't have any tool state for this imageId, add an empty object
    if (toolState.hasOwnProperty(imageId) === false) {
      toolState[imageId] = {};
    }

    const imageIdToolState = toolState[imageId];

    // If we don't have tool state for this type of tool, add an empty object
    if (imageIdToolState.hasOwnProperty(toolType) === false) {
      imageIdToolState[toolType] = {
        data: [],
      };
    }

    const toolData = imageIdToolState[toolType];

    // Finally, add this new tool to the state
    toolData.data.push(data);
  }

  function getElementToolState(element, toolType) {
    const enabledElement = external.cornerstone.getEnabledElement(element);

    // If the element does not have an image return undefined.
    if (!enabledElement.image) {
      return;
    }

    return getImageIdToolState(enabledElement.image.imageId, toolType);
  }

  // Here you can get state - used by tools as well as modules
  // That save state persistently
  function getImageIdToolState(imageId, toolType) {
    // If we don't have any tool state for this imageId, return undefined
    if (toolState.hasOwnProperty(imageId) === false) {
      return;
    }

    const imageIdToolState = toolState[imageId];

    // If we don't have tool state for this type of tool, return undefined
    if (imageIdToolState.hasOwnProperty(toolType) === false) {
      return;
    }

    return imageIdToolState[toolType];
  }

  // Clears all tool data from this toolStateManager.
  function clearElementToolState(element) {
    const enabledElement = external.cornerstone.getEnabledElement(element);

    if (!enabledElement.image) {
      return;
    }
    clearImageIdToolState(enabledElement.imageId);
  }

  function clearImageIdToolState(imageId) {
    if (toolState.hasOwnProperty(imageId) === false) {
      return;
    }

    delete toolState[imageId];
  }

  return {
    get: getElementToolState,
    add: addElementToolState,
    clear: clearElementToolState,
    getImageIdToolState,
    addImageIdToolState,
    clearImageIdToolState,
    saveImageIdToolState,
    restoreImageIdToolState,
    saveToolState,
    restoreToolState,
    toolState,
  };
}

// A global imageIdSpecificToolStateManager - the most common case is to share state between all
// Visible enabled images
const globalImageIdSpecificToolStateManager = newImageIdSpecificToolStateManager();

export {
  newImageIdSpecificToolStateManager,
  globalImageIdSpecificToolStateManager,
};
