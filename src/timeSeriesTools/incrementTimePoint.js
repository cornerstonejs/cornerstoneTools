import * as cornerstone from 'cornerstone-core';
import { getToolState } from '../stateManagement/toolState';
import loadHandlerManager from '../stateManagement/loadHandlerManager';

export default function (element, timePoints, wrap) {
  const toolData = getToolState(element, 'timeSeries');

  if (!toolData || !toolData.data || !toolData.data.length) {
    return;
  }

  const timeSeriesData = toolData.data[0];
  const currentStack = timeSeriesData.stacks[timeSeriesData.currentStackIndex];
  const currentImageIdIndex = currentStack.currentImageIdIndex;
  let newStackIndex = timeSeriesData.currentStackIndex + timePoints;

    // Loop around if we go outside the stack
  if (wrap) {
    if (newStackIndex >= timeSeriesData.stacks.length) {
      newStackIndex = 0;
    }

    if (newStackIndex < 0) {
      newStackIndex = timeSeriesData.stacks.length - 1;
    }
  } else {
    newStackIndex = Math.min(timeSeriesData.stacks.length - 1, newStackIndex);
    newStackIndex = Math.max(0, newStackIndex);
  }

  if (newStackIndex !== timeSeriesData.currentStackIndex) {
    const viewport = cornerstone.getViewport(element);
    const newStack = timeSeriesData.stacks[newStackIndex];

    const startLoadingHandler = loadHandlerManager.getStartLoadHandler();
    const endLoadingHandler = loadHandlerManager.getEndLoadHandler();
    const errorLoadingHandler = loadHandlerManager.getErrorLoadingHandler();

    if (startLoadingHandler) {
      startLoadingHandler(element);
    }

    let loader;

    if (newStack.preventCache === true) {
      loader = cornerstone.loadImage(newStack.imageIds[currentImageIdIndex]);
    } else {
      loader = cornerstone.loadAndCacheImage(newStack.imageIds[currentImageIdIndex]);
    }

    loader.then(function (image) {
      if (timeSeriesData.currentImageIdIndex !== currentImageIdIndex) {
        newStack.currentImageIdIndex = currentImageIdIndex;
        timeSeriesData.currentStackIndex = newStackIndex;
        cornerstone.displayImage(element, image, viewport);
        if (endLoadingHandler) {
          endLoadingHandler(element, image);
        }
      }
    }, function (error) {
      const imageId = newStack.imageIds[currentImageIdIndex];

      if (errorLoadingHandler) {
        errorLoadingHandler(element, imageId, error);
      }
    });
  }
}
