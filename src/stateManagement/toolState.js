import * as cornerstone from 'cornerstone-core';
import { globalImageIdSpecificToolStateManager } from './imageIdSpecificStateManager';

function getElementToolStateManager (element) {
  const enabledImage = cornerstone.getEnabledElement(element);
    // If the enabledImage has no toolStateManager, create a default one for it
    // NOTE: This makes state management element specific

  if (enabledImage.toolStateManager === undefined) {
    enabledImage.toolStateManager = globalImageIdSpecificToolStateManager;
  }

  return enabledImage.toolStateManager;
}

// Here we add tool state, this is done by tools as well
// As modules that restore saved state
function addToolState (element, toolType, measurementData) {
  const toolStateManager = getElementToolStateManager(element);

  toolStateManager.add(element, toolType, measurementData);

  const eventType = 'CornerstoneToolsMeasurementAdded';
  const eventData = {
    toolType,
    element,
    measurementData
  };

  $(element).trigger(eventType, eventData);
}

// Here you can get state - used by tools as well as modules
// That save state persistently
function getToolState (element, toolType) {
  const toolStateManager = getElementToolStateManager(element);


  return toolStateManager.get(element, toolType);
}

function removeToolState (element, toolType, data) {
  const toolStateManager = getElementToolStateManager(element);
  const toolData = toolStateManager.get(element, toolType);
    // Find this tool data
  let indexOfData = -1;

  for (let i = 0; i < toolData.data.length; i++) {
    if (toolData.data[i] === data) {
      indexOfData = i;
    }
  }

  if (indexOfData !== -1) {
    toolData.data.splice(indexOfData, 1);

    const eventType = 'CornerstoneToolsMeasurementRemoved';
    const eventData = {
      toolType,
      element,
      measurementData: data
    };

    $(element).trigger(eventType, eventData);
  }
}

function clearToolState (element, toolType) {
  const toolStateManager = getElementToolStateManager(element);
  const toolData = toolStateManager.get(element, toolType);

    // If any toolData actually exists, clear it
  if (toolData !== undefined) {
    toolData.data = [];
  }
}

// Sets the tool state manager for an element
function setElementToolStateManager (element, toolStateManager) {
  const enabledImage = cornerstone.getEnabledElement(element);

  enabledImage.toolStateManager = toolStateManager;
}

export {
  addToolState,
  getToolState,
  removeToolState,
  clearToolState,
  setElementToolStateManager,
  getElementToolStateManager
};
