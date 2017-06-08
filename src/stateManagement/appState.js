import * as cornerstone from 'cornerstone-core';
import { globalImageIdSpecificToolStateManager } from './imageIdSpecificStateManager';
import { getElementToolStateManager } from './toolState';

function saveApplicationState (elements) {
    // Save imageId-specific tool state data
  const appState = {
    imageIdToolState: globalImageIdSpecificToolStateManager.saveToolState(),
    elementToolState: {},
    elementViewport: {}
  };

    // For each of the given elements, save the viewport and any stack-specific tool data
  elements.forEach(function (element) {
    const toolStateManager = getElementToolStateManager(element);

    if (toolStateManager === globalImageIdSpecificToolStateManager) {
      return;
    }

    appState.elementToolState[element.id] = toolStateManager.saveToolState();

    appState.elementViewport[element.id] = cornerstone.getViewport(element);
  });

  return appState;
}

function restoreApplicationState (appState) {
  if (!appState.hasOwnProperty('imageIdToolState') ||
        !appState.hasOwnProperty('elementToolState') ||
        !appState.hasOwnProperty('elementViewport')) {
    return;
  }

    // Restore all the imageId specific tool data
  globalImageIdSpecificToolStateManager.restoreToolState(appState.imageIdToolState);

  Object.keys(appState.elementViewport).forEach(function (elementId) {
        // Restore any stack specific tool data
    const element = document.getElementById(elementId);

    if (!element) {
      return;
    }

    if (!appState.elementToolState.hasOwnProperty(elementId)) {
      return;
    }

    const toolStateManager = getElementToolStateManager(element);

    if (toolStateManager === globalImageIdSpecificToolStateManager) {
      return;
    }

    toolStateManager.restoreToolState(appState.elementToolState[elementId]);

        // Restore the saved viewport information
    const savedViewport = appState.elementViewport[elementId];

    cornerstone.setViewport(element, savedViewport);

        // Update the element to apply the viewport and tool changes
    cornerstone.updateImage(element);
  });

  return appState;
}

const appState = {
  save: saveApplicationState,
  restore: restoreApplicationState
};

export default appState;
