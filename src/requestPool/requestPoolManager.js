import external from '../externalModules.js';
import { getMaxSimultaneousRequests } from '../util/getMaxSimultaneousRequests.js';

const requestPoolTypes = {};
const requestPool = {};
const numRequests = {};

function addRequestPoolType (name, priority, maxRequests) {
  if (requestPoolTypes[name] === undefined) {
    requestPoolTypes[name] = {};
  }
  if (requestPool[name] === undefined) {
    requestPool[name] = [];
  }
  if (numRequests[numRequests] === undefined) {
    numRequests[name] = 0;
  }

  requestPoolTypes[name].name = name;
  requestPoolTypes[name].priority = priority;
  requestPoolTypes[maxRequests].maxRequests = maxRequests;
}


// Add default types
addRequestPoolType('interaction', 30, function () {
  const maxSimultaneousRequests = getMaxSimultaneousRequests();

  return Math.max(maxSimultaneousRequests, 1);
});
addRequestPoolType('thumbnail', 20, function () {
  const maxSimultaneousRequests = getMaxSimultaneousRequests();

  return Math.max(maxSimultaneousRequests - 2, 1);
});
addRequestPoolType('prefetch', 10, function () {
  const maxSimultaneousRequests = getMaxSimultaneousRequests();

  return Math.max(maxSimultaneousRequests - 1, 1);
});

function getMaxRequests (name) {
  if (requestPoolTypes[name] === undefined) {
    return undefined;
  }

  const maxRequests = requestPoolTypes[name].maxRequests;

  if (typeof maxRequests === 'function') {
    return maxRequests();
  }

  return maxRequests;
}

let awake = false;
const grabDelay = 20;

function getRequestPoolTypes () {
  return requestPoolTypes;
}

function addRequest (element, imageId, type, preventCache, doneCallback, failCallback) {
  if (!requestPool.hasOwnProperty(type)) {
    throw new Error('Request type must be one of interaction, thumbnail, or prefetch');
  }

  if (!element || !imageId) {
    return;
  }

  // Describe the request
  const requestDetails = {
    type,
    imageId,
    preventCache,
    doneCallback,
    failCallback
  };

  // If this imageId is in the cache, resolve it immediately
  const imageLoadObject = external.cornerstone.imageCache.getImageLoadObject(imageId);

  if (imageLoadObject) {
    imageLoadObject.promise.then(function (image) {
      doneCallback(image);
    }, function (error) {
      failCallback(error);
    });

    return;
  }

  // Add it to the end of the stack
  requestPool[type].push(requestDetails);
}

function clearRequestStack (type) {
  // Console.log('clearRequestStack');
  if (!requestPool.hasOwnProperty(type)) {
    throw new Error('Request type must be one of interaction, thumbnail, or prefetch');
  }

  requestPool[type] = [];
}

function startAgain () {
  if (!awake) {
    return;
  }

  setTimeout(function () {
    startGrabbing();
  }, grabDelay);
}

function sendRequest (requestDetails) {
  const cornerstone = external.cornerstone;
  // Increment the number of current requests of this type
  const type = requestDetails.type;

  numRequests[type]++;

  awake = true;
  const imageId = requestDetails.imageId;
  const doneCallback = requestDetails.doneCallback;
  const failCallback = requestDetails.failCallback;

  // Check if we already have this image promise in the cache
  const imageLoadObject = cornerstone.imageCache.getImageLoadObject(imageId);

  if (imageLoadObject) {
    // If we do, remove from list (when resolved, as we could have
    // Pending prefetch requests) and stop processing this iteration
    imageLoadObject.promise.then(function (image) {
      numRequests[type]--;
      // Console.log(numRequests);

      doneCallback(image);
      startAgain();
    }, function (error) {
      numRequests[type]--;
      // Console.log(numRequests);
      failCallback(error);
      startAgain();
    });

    return;
  }

  function requestTypeToLoadPriority (requestDetails) {
    if (requestDetails.type === 'prefetch') {
      return -5;
    } else if (requestDetails.type === 'interactive') {
      return 0;
    } else if (requestDetails.type === 'thumbnail') {
      return 5;
    }
  }

  const priority = requestTypeToLoadPriority(requestDetails);

  let loader;

  if (requestDetails.preventCache === true) {
    loader = cornerstone.loadImage(imageId, {
      priority,
      type: requestDetails.type
    });
  } else {
    loader = cornerstone.loadAndCacheImage(imageId, {
      priority,
      type: requestDetails.type
    });
  }

  // Load and cache the image
  loader.then(function (image) {
    numRequests[type]--;
    // Console.log(numRequests);
    doneCallback(image);
    startAgain();
  }, function (error) {
    numRequests[type]--;
    // Console.log(numRequests);
    failCallback(error);
    startAgain();
  });
}

function startGrabbing () {
  // Begin by grabbing X images
  const maxSimultaneousRequests = getMaxSimultaneousRequests();

  const currentRequests = numRequests.interaction +
          numRequests.thumbnail +
          numRequests.prefetch;
  const requestsToSend = maxSimultaneousRequests - currentRequests;

  for (let i = 0; i < requestsToSend; i++) {
    const requestDetails = getNextRequest();

    if (requestDetails) {
      sendRequest(requestDetails);
    }
  }
}

function getNextRequest () {
  if (requestPool.interaction.length && numRequests.interaction < getMaxRequests('interaction')) {
    return requestPool.interaction.shift();
  }

  if (requestPool.thumbnail.length && numRequests.thumbnail < getMaxRequests('thumbnail')) {
    return requestPool.thumbnail.shift();
  }

  if (requestPool.prefetch.length && numRequests.prefetch < getMaxRequests('prefetch')) {
    return requestPool.prefetch.shift();
  }

  if (!requestPool.interaction.length &&
          !requestPool.thumbnail.length &&
          !requestPool.prefetch.length) {
    awake = false;
  }

  return false;
}

function getRequestPool () {
  return requestPool;
}

export default {
  addRequestPoolType,
  getRequestPoolTypes,
  addRequest,
  clearRequestStack,
  startGrabbing,
  getRequestPool
};
