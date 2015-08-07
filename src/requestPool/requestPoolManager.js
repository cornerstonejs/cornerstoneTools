(function(cornerstone, cornerstoneTools) {

    'use strict';

    var requestPool = {
        interaction: [],
        thumbnail: [],
        prefetch: []
    };
    
    var lastElementInteracted;
    var awake = false;
    var grabDelay = 20;

    function requestPoolManager() {

        function addRequest(element, imageId, type, doneCallback, failCallback) {
            if (!requestPool.hasOwnProperty(type)) {
                throw 'Request type must be one of interaction, thumbnail, or prefetch';
            }

            if (!element || !imageId) {
                return;
            }

            // Describe the request
            var requestDetails = {
                imageId: imageId,
                doneCallback: doneCallback,
                failCallback: failCallback
            };

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
                    awake = false;
                    return;
                }

                sendRequest(requestDetails);
            }, grabDelay);
        }

        function sendRequest(requestDetails) {
            if (!requestDetails) {
                awake = false;
                return;
            }

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
                    doneCallback(image);
                    startAgain();
                }, function(error) {
                    failCallback(error);
                });
                return;
            }

            // Load and cache the image
            cornerstone.loadAndCacheImage(imageId).then(function(image) {
                doneCallback(image);
                startAgain();
            }, function(error) {
                failCallback(error);
            });
        }

        function startGrabbing() {
            // Begin by grabbing X images
            if (awake) {
                return;
            }

            var maxSimultaneousRequests = cornerstoneTools.getMaxSimultaneousRequests();
            for (var i = 0; i < maxSimultaneousRequests; i++) {
                var requestDetails = getNextRequest();
                sendRequest(requestDetails);
            }

            //console.log("startGrabbing");
            //console.log(requestPool);
        }

        function getNextRequest() {
            if (requestPool.interaction.length) {
                return requestPool.interaction.shift();
            }

            if (requestPool.thumbnail.length) {
                return requestPool.thumbnail.shift();
            }

            if (requestPool.prefetch.length) {
                return requestPool.prefetch.shift();
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
