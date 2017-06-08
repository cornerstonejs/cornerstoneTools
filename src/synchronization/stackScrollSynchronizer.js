import * as cornerstone from 'cornerstone-core';
import { getToolState } from '../stateManagement/toolState';
import loadHandlerManager from '../stateManagement/loadHandlerManager';

// This function causes any scrolling actions within the stack to propagate to
// All of the other viewports that are synced
export default function (synchronizer, sourceElement, targetElement, eventData) {
    // If the target and source are the same, stop
  if (sourceElement === targetElement) {
    return;
  }

    // If there is no event, or direction is 0, stop
  if (!eventData || !eventData.direction) {
    return;
  }

    // Get the stack of the target viewport
  const stackToolDataSource = getToolState(targetElement, 'stack');
  const stackData = stackToolDataSource.data[0];

    // Get the new index for the stack
  let newImageIdIndex = stackData.currentImageIdIndex + eventData.direction;

    // Ensure the index does not exceed the bounds of the stack
  newImageIdIndex = Math.min(Math.max(newImageIdIndex, 0), stackData.imageIds.length - 1);

    // If the index has not changed, stop here
  if (stackData.currentImageIdIndex === newImageIdIndex) {
    return;
  }

  const startLoadingHandler = loadHandlerManager.getStartLoadHandler();
  const endLoadingHandler = loadHandlerManager.getEndLoadHandler();
  const errorLoadingHandler = loadHandlerManager.getErrorLoadingHandler();

  if (startLoadingHandler) {
    startLoadingHandler(targetElement);
  }

  let loader;

  if (stackData.preventCache === true) {
    loader = cornerstone.loadImage(stackData.imageIds[newImageIdIndex]);
  } else {
    loader = cornerstone.loadAndCacheImage(stackData.imageIds[newImageIdIndex]);
  }

  loader.then(function (image) {
    const viewport = cornerstone.getViewport(targetElement);

    stackData.currentImageIdIndex = newImageIdIndex;
    synchronizer.displayImage(targetElement, image, viewport);
    if (endLoadingHandler) {
      endLoadingHandler(targetElement, image);
    }
  }, function (error) {
    const imageId = stackData.imageIds[newImageIdIndex];

    if (errorLoadingHandler) {
      errorLoadingHandler(targetElement, imageId, error);
    }
  });
}
