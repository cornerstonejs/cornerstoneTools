var requestPool = {
    interaction: [],
    thumbnail: [],
    prefetch: []
};

var numRequests = {
    interaction: 0,
    thumbnail: 0,
    prefetch: 0
};

var maxNumRequests = {
    interaction: 6,
    thumbnail: 6,
    prefetch: 5
};

var lastElementInteracted;
var awake = false;
var grabDelay = 20;

export default function() {
    function addRequest(element, imageId, type, preventCache, doneCallback, failCallback) {
        if (!requestPool.hasOwnProperty(type)) {
            throw 'Request type must be one of interaction, thumbnail, or prefetch';
        }

        if (!element || !imageId) {
            return;
        }

        // Describe the request
        var requestDetails = {
            type: type,
            imageId: imageId,
            preventCache: preventCache,
            doneCallback: doneCallback,
            failCallback: failCallback
        };

        // If this imageId is in the cache, resolve it immediately
        var imagePromise = cornerstone.imageCache.getImagePromise(imageId);
        if (imagePromise) {
            imagePromise.then(function(image) {
                doneCallback(image);
            }, function(error) {
                failCallback(error);
            });
            return;
        }

        // Add it to the end of the stack
        requestPool[type].push(requestDetails);

        // Store the last element interacted with,
        // So we know which images to prefetch
        //
        // ---- Not used for now ----
        if (type === 'interaction') {
            lastElementInteracted = element;
        }
    }

    function clearRequestStack(type) {
        //console.log('clearRequestStack');
        if (!requestPool.hasOwnProperty(type)) {
            throw 'Request type must be one of interaction, thumbnail, or prefetch';
        }

        requestPool[type] = [];
    }

    function startAgain() {
        if (!awake) {
            return;
        }

        setTimeout(function() {
            startGrabbing();
        }, grabDelay);
    }

    function sendRequest(requestDetails) {
        // Increment the number of current requests of this type
        var type = requestDetails.type;
        numRequests[type]++;

        awake = true;
        var imageId = requestDetails.imageId;
        var doneCallback = requestDetails.doneCallback;
        var failCallback = requestDetails.failCallback;

        // Check if we already have this image promise in the cache
        var imagePromise = cornerstone.imageCache.getImagePromise(imageId);
        if (imagePromise) {
            // If we do, remove from list (when resolved, as we could have
            // pending prefetch requests) and stop processing this iteration
            imagePromise.then(function(image) {
                numRequests[type]--;
                // console.log(numRequests);

                doneCallback(image);
                startAgain();
            }, function(error) {
                numRequests[type]--;
                // console.log(numRequests);
                failCallback(error);
                startAgain();
            });
            return;
        }

        function requestTypeToLoadPriority(requestDetails) {
            if (requestDetails.type === 'prefetch') {
                return -5;
            } else if (requestDetails.type === 'interactive') {
                return 0;
            } else if (requestDetails.type === 'thumbnail') {
                return 5;
            }
        }

        var priority = requestTypeToLoadPriority(requestDetails);

        var loader;
        if (requestDetails.preventCache === true) {
            loader = cornerstone.loadImage(imageId, {
                priority: priority,
                type: requestDetails.type
            });
        } else {
            loader = cornerstone.loadAndCacheImage(imageId, {
                priority: priority,
                type: requestDetails.type
            });
        }

        // Load and cache the image
        loader.then(function(image) {
            numRequests[type]--;
            // console.log(numRequests);
            doneCallback(image);
            startAgain();
        }, function(error) {
            numRequests[type]--;
            // console.log(numRequests);
            failCallback(error);
            startAgain();
        });
    }

    function startGrabbing() {
        // Begin by grabbing X images
        var maxSimultaneousRequests = cornerstoneTools.getMaxSimultaneousRequests();

        maxNumRequests = {
            interaction: Math.max(maxSimultaneousRequests, 1),
            thumbnail: Math.max(maxSimultaneousRequests - 2, 1),
            prefetch: Math.max(maxSimultaneousRequests - 1, 1)
        };

        var currentRequests = numRequests.interaction +
            numRequests.thumbnail +
            numRequests.prefetch;
        var requestsToSend = maxSimultaneousRequests - currentRequests;
        for (var i = 0; i < requestsToSend; i++) {
            var requestDetails = getNextRequest();
            if (requestDetails) {
                sendRequest(requestDetails);
            }
        }
    }

    function getNextRequest() {
        if (requestPool.interaction.length && numRequests.interaction < maxNumRequests.interaction) {
            return requestPool.interaction.shift();
        }

        if (requestPool.thumbnail.length && numRequests.thumbnail < maxNumRequests.thumbnail) {
            return requestPool.thumbnail.shift();
        }

        if (requestPool.prefetch.length && numRequests.prefetch < maxNumRequests.prefetch) {
            return requestPool.prefetch.shift();
        }

        if (!requestPool.interaction.length &&
            !requestPool.thumbnail.length &&
            !requestPool.prefetch.length) {
            awake = false;
        }

        return false;
    }

    function getRequestPool() {
        return requestPool;
    }

    return {
        addRequest,
        clearRequestStack,
        startGrabbing,
        getRequestPool
    };
}