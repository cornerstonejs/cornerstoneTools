import external from './../externalModules.js';
import loadHandlerManager from '../stateManagement/loadHandlerManager.js';
import { addToolState, getToolState } from '../stateManagement/toolState.js';
import { getLogger } from '../util/logger.js';
import triggerEvent from '../util/triggerEvent';
import EVENTS from '../events.js';

const logger = getLogger('stackTools:stackPrefetch');

const toolName = 'stackPrefetch';
const requestType = 'prefetch';
const priority = 0;
const addToBeginning = true;

let configuration = {
  maxImagesToPrefetch: Infinity,
  preserveExistingPool: false,
};

let resetPrefetchTimeout;
const resetPrefetchDelay = 10;

function range(lowEnd, highEnd) {
  // Javascript version of Python's range function
  // http://stackoverflow.com/questions/3895478/does-javascript-have-a-method-like-range-to-generate-an-array-based-on-suppl
  lowEnd = Math.round(lowEnd) || 0;
  highEnd = Math.round(highEnd) || 0;

  const arr = [];
  let c = highEnd - lowEnd + 1;

  if (c <= 0) {
    return arr;
  }

  while (c--) {
    arr[c] = highEnd--;
  }

  return arr;
}

function nearestIndex(arr, x) {
  // Return index of nearest values in array
  // http://stackoverflow.com/questions/25854212/return-index-of-nearest-values-in-an-array
  let low = 0;
  let high = arr.length - 1;

  arr.forEach((v, idx) => {
    if (v < x) {
      low = Math.max(idx, low);
    } else if (v > x) {
      high = Math.min(idx, high);
    }
  });

  return { low, high };
}

function prefetch(element) {
  // Check to make sure stack data exists
  const stackData = getToolState(element, 'stack');

  if (!stackData || !stackData.data || !stackData.data.length) {
    return;
  }

  const stack = stackData.data[0];

  // Get the stackPrefetch tool data
  const stackPrefetchData = getToolState(element, toolName);

  if (!stackPrefetchData) {
    return;
  }

  const stackPrefetch = stackPrefetchData.data[0] || {};

  // If all the requests are complete, disable the stackPrefetch tool
  if (
    !stackPrefetch.indicesToRequest ||
    !stackPrefetch.indicesToRequest.length
  ) {
    stackPrefetch.enabled = false;
  }

  // Make sure the tool is still enabled
  if (stackPrefetch.enabled === false) {
    return;
  }

  // Remove an imageIdIndex from the list of indices to request
  // This fires when the individual image loading deferred is resolved
  function removeFromList(imageIdIndex) {
    const index = stackPrefetch.indicesToRequest.indexOf(imageIdIndex);

    if (index > -1) {
      // Don't remove last element if imageIdIndex not found
      stackPrefetch.indicesToRequest.splice(index, 1);
    }
  }

  // Remove all already cached images from the
  // IndicesToRequest array
  stackPrefetchData.data[0].indicesToRequest.sort((a, b) => a - b);
  const indicesToRequestCopy = stackPrefetch.indicesToRequest.slice();

  indicesToRequestCopy.forEach(function(imageIdIndex) {
    const imageId = stack.imageIds[imageIdIndex];

    if (!imageId) {
      return;
    }

    const imageLoadObject = external.cornerstone.imageCache.getImageLoadObject(
      imageId
    );

    if (imageLoadObject) {
      removeFromList(imageIdIndex);
    }
  });

  // Stop here if there are no images left to request
  // After those in the cache have been removed
  if (!stackPrefetch.indicesToRequest.length) {
    return;
  }

  // Clear the requestPool of prefetch requests, if needed.
  if (!configuration.preserveExistingPool) {
    external.cornerstone.imageLoadPoolManager.clearRequestStack(requestType);
  }

  // Identify the nearest imageIdIndex to the currentImageIdIndex
  const nearest = nearestIndex(
    stackPrefetch.indicesToRequest,
    stack.currentImageIdIndex
  );

  let imageId;
  let nextImageIdIndex;
  const preventCache = false;

  function doneCallback(image) {
    logger.log('prefetch done: %s', image.imageId);
    const imageIdIndex = stack.imageIds.indexOf(image.imageId);

    removeFromList(imageIdIndex);

    triggerEvent(element, EVENTS.STACK_PREFETCH_IMAGE_LOADED, {
      element,
      imageId: image.imageId,
      imageIndex: imageIdIndex,
      stackPrefetch,
      stack,
    });

    // If there are no more images to fetch
    if (
      !(
        stackPrefetch.indicesToRequest &&
        stackPrefetch.indicesToRequest.length > 0
      )
    ) {
      triggerEvent(element, EVENTS.STACK_PREFETCH_DONE, {
        element,
        stackPrefetch,
        stack,
      });
    }
  }

  // Retrieve the errorLoadingHandler if one exists
  const errorLoadingHandler = loadHandlerManager.getErrorLoadingHandler(
    element
  );

  function failCallback(error) {
    logger.log('prefetch errored: %o', error);
    if (errorLoadingHandler) {
      errorLoadingHandler(element, imageId, error, 'stackPrefetch');
    }
  }

  // Prefetch images around the current image (before and after)
  let lowerIndex = nearest.low;
  let higherIndex = nearest.high;
  const imageIdsToPrefetch = [];

  while (
    lowerIndex >= 0 ||
    higherIndex < stackPrefetch.indicesToRequest.length
  ) {
    const currentIndex = stack.currentImageIdIndex;
    const shouldSkipLower =
      currentIndex - stackPrefetch.indicesToRequest[lowerIndex] >
      configuration.maxImagesToPrefetch;
    const shouldSkipHigher =
      stackPrefetch.indicesToRequest[higherIndex] - currentIndex >
      configuration.maxImagesToPrefetch;

    const shouldLoadLower = !shouldSkipLower && lowerIndex >= 0;
    const shouldLoadHigher =
      !shouldSkipHigher && higherIndex < stackPrefetch.indicesToRequest.length;

    if (!shouldLoadHigher && !shouldLoadLower) {
      break;
    }

    if (shouldLoadLower) {
      nextImageIdIndex = stackPrefetch.indicesToRequest[lowerIndex--];
      imageId = stack.imageIds[nextImageIdIndex];
      imageIdsToPrefetch.push(imageId);
    }

    if (shouldLoadHigher) {
      nextImageIdIndex = stackPrefetch.indicesToRequest[higherIndex++];
      imageId = stack.imageIds[nextImageIdIndex];
      imageIdsToPrefetch.push(imageId);
    }
  }

  let requestFn;
  const options = {
    addToBeginning,
    priority,
    requestType,
  };

  if (preventCache) {
    requestFn = id => external.cornerstone.loadImage(id, options);
  } else {
    requestFn = id => external.cornerstone.loadAndCacheImage(id, options);
  }

  imageIdsToPrefetch.reverse().forEach(imageId => {
    external.cornerstone.imageLoadPoolManager.addRequest(
      requestFn.bind(null, imageId),
      requestType,
      // Additional details
      {
        imageId,
      },
      priority,
      addToBeginning
    );
  });
}

function getPromiseRemovedHandler(element) {
  return function(e) {
    const eventData = e.detail;

    // When an imagePromise has been pushed out of the cache, re-add its index
    // It to the indicesToRequest list so that it will be retrieved later if the
    // CurrentImageIdIndex is changed to an image nearby
    let stackData;

    try {
      // It will throw an exception in some cases (eg: thumbnails)
      stackData = getToolState(element, 'stack');
    } catch (error) {
      return;
    }

    if (!stackData || !stackData.data || !stackData.data.length) {
      return;
    }

    const stack = stackData.data[0];
    const imageIdIndex = stack.imageIds.indexOf(eventData.imageId);

    // Make sure the image that was removed is actually in this stack
    // Before adding it to the indicesToRequest array
    if (imageIdIndex < 0) {
      return;
    }

    const stackPrefetchData = getToolState(element, toolName);

    if (
      !stackPrefetchData ||
      !stackPrefetchData.data ||
      !stackPrefetchData.data.length
    ) {
      return;
    }

    stackPrefetchData.data[0].indicesToRequest.push(imageIdIndex);
  };
}

function onImageUpdated(e) {
  // Start prefetching again (after a delay)
  // When the user has scrolled to a new image
  clearTimeout(resetPrefetchTimeout);
  resetPrefetchTimeout = setTimeout(function() {
    const element = e.target;

    // If playClip is enabled and the user loads a different series in the viewport
    // An exception will be thrown because the element will not be enabled anymore
    try {
      prefetch(element);
    } catch (error) {
      return;
    }
  }, resetPrefetchDelay);
}

function enable(element) {
  // Clear old prefetch data. Skipping this can cause problems when changing the series inside an element
  const stackPrefetchDataArray = getToolState(element, toolName);

  stackPrefetchDataArray.data = [];

  // First check that there is stack data available
  const stackData = getToolState(element, 'stack');

  if (!stackData || !stackData.data || !stackData.data.length) {
    return;
  }

  const stack = stackData.data[0];

  // Check if we are allowed to cache images in this stack
  if (stack.preventCache === true) {
    logger.warn(
      'A stack that should not be cached was given the stackPrefetch'
    );

    return;
  }

  // Use the currentImageIdIndex from the stack as the initalImageIdIndex
  const stackPrefetchData = {
    indicesToRequest: range(0, stack.imageIds.length - 1),
    enabled: true,
    direction: 1,
  };

  // Remove the currentImageIdIndex from the list to request
  const indexOfCurrentImage = stackPrefetchData.indicesToRequest.indexOf(
    stack.currentImageIdIndex
  );

  stackPrefetchData.indicesToRequest.splice(indexOfCurrentImage, 1);

  addToolState(element, toolName, stackPrefetchData);

  prefetch(element);

  element.removeEventListener(
    external.cornerstone.EVENTS.NEW_IMAGE,
    onImageUpdated
  );
  element.addEventListener(
    external.cornerstone.EVENTS.NEW_IMAGE,
    onImageUpdated
  );

  const promiseRemovedHandler = getPromiseRemovedHandler(element);

  external.cornerstone.events.removeEventListener(
    external.cornerstone.EVENTS.IMAGE_CACHE_PROMISE_REMOVED,
    promiseRemovedHandler
  );
  external.cornerstone.events.addEventListener(
    external.cornerstone.EVENTS.IMAGE_CACHE_PROMISE_REMOVED,
    promiseRemovedHandler
  );
}

function disable(element) {
  clearTimeout(resetPrefetchTimeout);
  element.removeEventListener(
    external.cornerstone.EVENTS.NEW_IMAGE,
    onImageUpdated
  );

  const promiseRemovedHandler = getPromiseRemovedHandler(element);

  external.cornerstone.events.removeEventListener(
    external.cornerstone.EVENTS.IMAGE_CACHE_PROMISE_REMOVED,
    promiseRemovedHandler
  );

  const stackPrefetchData = getToolState(element, toolName);
  // If there is actually something to disable, disable it

  if (stackPrefetchData && stackPrefetchData.data.length) {
    stackPrefetchData.data[0].enabled = false;

    // Clear current prefetch requests from the requestPool
    external.cornerstone.imageLoadPoolManager.clearRequestStack(requestType);
  }
}

function getConfiguration() {
  return configuration;
}

function setConfiguration(config) {
  configuration = config;
}

// Module/private exports
const stackPrefetch = {
  enable,
  disable,
  getConfiguration,
  setConfiguration,
};

export default stackPrefetch;
