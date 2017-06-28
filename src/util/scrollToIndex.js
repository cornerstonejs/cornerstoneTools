import * as cornerstone from 'cornerstone-core';
import { getToolState } from '../stateManagement/toolState';
import requestPoolManager from '../requestPool/requestPoolManager';
import loadHandlerManager from '../stateManagement/loadHandlerManager';
import { stackScroll } from '../stackTools/stackScroll';

export default function (element, newImageIdIndex) {
  const toolData = getToolState(element, 'stack');

  if (!toolData || !toolData.data || !toolData.data.length) {
    return;
  }

  // If we have more than one stack, check if we have a stack renderer defined
  let stackRenderer;

  if (toolData.data.length > 1) {
    const stackRendererData = getToolState(element, 'stackRenderer');

    if (stackRendererData && stackRendererData.data && stackRendererData.data.length) {
      stackRenderer = stackRendererData.data[0];
    }
  }

  const stackData = toolData.data[0];

    // Allow for negative indexing
  if (newImageIdIndex < 0) {
    newImageIdIndex += stackData.imageIds.length;
  }

  const startLoadingHandler = loadHandlerManager.getStartLoadHandler();
  const endLoadingHandler = loadHandlerManager.getEndLoadHandler();
  const errorLoadingHandler = loadHandlerManager.getErrorLoadingHandler();
  const viewport = cornerstone.getViewport(element);

  function doneCallback (image) {
    if (stackData.currentImageIdIndex !== newImageIdIndex) {
      return;
    }

        // Check if the element is still enabled in Cornerstone,
        // If an error is thrown, stop here.
    try {
            // TODO: Add 'isElementEnabled' to Cornerstone?
      cornerstone.getEnabledElement(element);
    } catch(error) {
      return;
    }

    if (stackRenderer) {
      stackRenderer.currentImageIdIndex = newImageIdIndex;
      stackRenderer.render(element, toolData.data);
    } else {
      cornerstone.displayImage(element, image, viewport);
    }

    if (endLoadingHandler) {
      endLoadingHandler(element, image);
    }
  }

  function failCallback (error) {
    const imageId = stackData.imageIds[newImageIdIndex];

    if (errorLoadingHandler) {
      errorLoadingHandler(element, imageId, error);
    }
  }

  if (newImageIdIndex === stackData.currentImageIdIndex) {
    return;
  }

  if (startLoadingHandler) {
    startLoadingHandler(element);
  }

  const eventData = {
    newImageIdIndex,
    direction: newImageIdIndex - stackData.currentImageIdIndex
  };

  stackData.currentImageIdIndex = newImageIdIndex;
  const newImageId = stackData.imageIds[newImageIdIndex];

    // Retry image loading in cases where previous image promise
    // Was rejected, if the option is set
  const config = stackScroll.getConfiguration();

  if (config && config.retryLoadOnScroll === true) {
    const newImagePromise = cornerstone.imageCache.getImagePromise(newImageId);

    if (newImagePromise && newImagePromise.state() === 'rejected') {
      cornerstone.imageCache.removeImagePromise(newImageId);
    }
  }

    // Convert the preventCache value in stack data to a boolean
  const preventCache = Boolean(stackData.preventCache);

  let imagePromise;

  if (preventCache) {
    imagePromise = cornerstone.loadImage(newImageId);
  } else {
    imagePromise = cornerstone.loadAndCacheImage(newImageId);
  }

  imagePromise.then(doneCallback, failCallback);
    // Make sure we kick off any changed download request pools
  requestPoolManager.startGrabbing();

  $(element).trigger('CornerstoneStackScroll', eventData);
}
