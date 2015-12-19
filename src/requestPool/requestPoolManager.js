(function(cornerstone, cornerstoneTools) {

    'use strict';

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

    function requestPoolManager() {

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
                var requestDetails = getNextRequest();
                if (!requestDetails) {
                    return;
                }

                sendRequest(requestDetails);
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
                });
                return;
            }

            var loader;
            if (requestDetails.preventCache === true) {
                loader = cornerstone.loadImage(imageId);
            } else {
                loader = cornerstone.loadAndCacheImage(imageId);
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
            });
        }

        function startGrabbing() {
            // Begin by grabbing X images
            if (awake) {
                return;
            }

            var maxSimultaneousRequests = cornerstoneTools.getMaxSimultaneousRequests();
            
            maxNumRequests = {
                interaction: maxSimultaneousRequests,
                thumbnail: maxSimultaneousRequests - 2,
                prefetch: maxSimultaneousRequests - 1
            };

            for (var i = 0; i < maxSimultaneousRequests; i++) {
                var requestDetails = getNextRequest();
                if (requestDetails) {
                    sendRequest(requestDetails);
                }
            }

            //console.log("startGrabbing");
            //console.log(requestPool);
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

        var requestManager = {
            addRequest: addRequest,
            clearRequestStack: clearRequestStack,
            startGrabbing: startGrabbing,
            getRequestPool: getRequestPool
        };

        return requestManager;
    }

    // module/private exports
    cornerstoneTools.requestPoolManager = requestPoolManager();

})(cornerstone, cornerstoneTools);
