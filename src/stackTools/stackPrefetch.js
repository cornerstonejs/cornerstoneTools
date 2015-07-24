(function($, cornerstone, cornerstoneTools) {

    'use strict';

    var toolType = 'stackPrefetch';
    var configuration = {};
    var reenablePrefetchTimeout;

    function reenablePrefetch(e, data) {
        // Use timeouts here to prevent this being called over and over
        // during scrolling
        clearTimeout(reenablePrefetchTimeout);
        reenablePrefetchTimeout = setTimeout(function() {
            var element = data.element;
            var stackData = cornerstoneTools.getToolState(element, 'stack');
            if (!stackData || !stackData.data || !stackData.data.length) {
                return;
            }

            // Get the stackPrefetch tool data
            var stackPrefetchData = cornerstoneTools.getToolState(element, toolType);

            if (!stackPrefetchData || !stackPrefetchData.data || !stackPrefetchData.data.length) {
                return;
            }

            var stackPrefetch = stackPrefetchData.data[0];
            if (stackPrefetch.indicesToRequest.length > 0 && !stackPrefetch.enabled) {
                console.log('Re-enabling prefetch');
                stackPrefetch.enabled = true;
                prefetch(element);
            }
        }, 50);
    }

    function range(lowEnd, highEnd) {
        // Javascript version of Python's range function
        // http://stackoverflow.com/questions/3895478/does-javascript-have-a-method-like-range-to-generate-an-array-based-on-suppl
        lowEnd = lowEnd || 0;
        highEnd = highEnd || 0;

        var arr = [],
            c = highEnd - lowEnd + 1;

        c = c > 0 ? c : 0;
        while ( c-- ) {
            arr[c] = highEnd--;
        }

        return arr;
    }

    var max = function(arr) {
        return Math.max.apply(null, arr);
    };

    var min = function(arr) {
        return Math.min.apply(null, arr);
    };

    function nearestIndex(arr, x) {
        // Return index of nearest values in array
        // http://stackoverflow.com/questions/25854212/return-index-of-nearest-values-in-an-array        
        var l = [],
            h = [];

        arr.forEach(function(v) {
            if (v < x) {
                l.push(v);
            } else if (v > x) {
                h.push(v);
            }
        });
       
        return {
            low: arr.indexOf(max(l)),
            high: arr.indexOf(min(h))
        };
    }

    function prefetch(element) {
        // Check to make sure stack data exists
        var stackData = cornerstoneTools.getToolState(element, 'stack');
        if (!stackData || !stackData.data || !stackData.data.length) {
            return;
        }

        var stack = stackData.data[0];

        // Get the stackPrefetch tool data
        var stackPrefetchData = cornerstoneTools.getToolState(element, toolType);

        if (!stackPrefetchData) {
            return;
        }

        var stackPrefetch = stackPrefetchData.data[0];

        // If all the requests are complete, disable the stackPrefetch tool
        if (stackPrefetch.indicesToRequest.length === 0) {
            stackPrefetch.enabled = false;
        }

        // Make sure the tool is still enabled
        if (stackPrefetch.enabled === false) {
            return;
        }

        // Remove an imageIdIndex from the list of indices to request
        // This fires when the individual image loading deferred is resolved        
        function removeFromList(imageIdIndex) {
            var index = stackPrefetch.indicesToRequest.indexOf(imageIdIndex);
            if (index > -1) { // don't remove last element if imageIdIndex not found
                stackPrefetch.indicesToRequest.splice(index, 1);
            }
        }
        
        // remove all already cached images from the
        // indicesToRequest array
        var indicesToRequestCopy = stackPrefetch.indicesToRequest.slice();

        indicesToRequestCopy.forEach(function(imageIdIndex) {
            var imageId = stack.imageIds[imageIdIndex];

            if (!imageId) {
                return;
            }

            var imagePromise = cornerstone.imageCache.getImagePromise(imageId);
            if (imagePromise !== undefined && imagePromise.state() === 'resolved'){
                removeFromList(imageIdIndex);
            }
        });

        // Get tool configuration
        //var config = cornerstoneTools.stackPrefetch.getConfiguration();

        stackPrefetch.numCurrentRequests = 0;

        function getNextImage() {
            // This gets the next image indices above and below the current stack imageIdIndex
            var nearest = nearestIndex(stackPrefetch.indicesToRequest, stack.currentImageIdIndex);
            
            // This is used to set the direction of prefetching.
            // Default is to prefetch upwards in the stack
            // If scrolling has been heading downwards, prefetching will choose the
            // next lowest imageIdIndex below the current imageIdIndex

            var nextImageIdIndex;
            if (stackPrefetch.direction < 0) {
                console.log('Prefetching downward');
                nextImageIdIndex = stackPrefetch.indicesToRequest[nearest.low];
            } else {
                console.log('Prefetching upward');
                nextImageIdIndex = stackPrefetch.indicesToRequest[nearest.high];
            }

            var nextImageId = stack.imageIds[nextImageIdIndex];
            removeFromList(nextImageIdIndex);
            return nextImageId;
        }

        function fetchImage(imageId) {
            if (!imageId) {
                return;
            }

            // Get the stackPrefetch tool data
            var stackPrefetchData = cornerstoneTools.getToolState(element, toolType);
            if (!stackPrefetchData) {
                return;
            }

            var stackPrefetch = stackPrefetchData.data[0];
            if (!stackPrefetch.enabled) {
                return;
            }

            stackPrefetch.numCurrentRequests += 1;
            console.log('numCurrentRequests: ' + stackPrefetch.numCurrentRequests);

            // Check if we already have this image promise in the cache
            var imagePromise = cornerstone.imageCache.getImagePromise(imageId);
            var errorLoadingHandler = cornerstoneTools.loadHandlerManager.getErrorLoadingHandler();
            
            if (imagePromise) {
                // If we do, remove from list (when resolved, as we could have
                // pending prefetch requests) and stop processing this iteration
                imagePromise.done(function(image) {
                    console.log('Already in Cache: ' + image.imageId);
                    stackPrefetch.numCurrentRequests -= 1;

                    if (stackPrefetch.indicesToRequest.length) {
                        //console.log(stackPrefetch.indicesToRequest);
                        setTimeout(function() {
                            var nextImageId = getNextImage();
                            if (!nextImageId) {
                                return;
                            }

                            fetchImage(nextImageId);
                        }, 1);
                    } else {
                        stackPrefetch.enabled = false;
                        return;
                    }
                }, function() {
                    errorLoadingHandler(element, imageId);
                });
            }

            // Load and cache the image
            console.log('fetchImage: ' + imageId);
            cornerstone.loadAndCacheImage(imageId).then(function() {
                stackPrefetch.numCurrentRequests -= 1;

                if (stackPrefetch.indicesToRequest.length) {
                    //console.log(stackPrefetch.indicesToRequest);
                    setTimeout(function() {
                        var nextImageId = getNextImage();
                        if (!nextImageId) {
                            return;
                        }

                        fetchImage(nextImageId);
                    }, 1);
                } else {
                    stackPrefetch.enabled = false;
                }
            }, function() {
                errorLoadingHandler(element, imageId);
            });
        }

        // Begin by grabbing X images
        var maxSimultaneousRequests = cornerstoneTools.getMaxSimultaneousRequests();

        for (var i = 0; i < maxSimultaneousRequests; i++) {
            if (stackPrefetch.enabled && stackPrefetch.indicesToRequest.length) {
                console.log('Starting branch: ' + i);
                var imageId = getNextImage();
                fetchImage(imageId);
            }
        }
    }

    function handleCacheFull(e) {
        // Stop prefetching if the ImageCacheFull event is fired from cornerstone
        console.log('CornerstoneImageCacheFull full, stopping');
        var element = e.data.element;

        var stackPrefetchData = cornerstoneTools.getToolState(element, toolType);
        if (stackPrefetchData && stackPrefetchData.data.length) {
            stackPrefetchData.data[0].enabled = false;
        }
    }

    function promiseRemovedHandler(e, eventData) {
        // When an imagePromise has been pushed out of the cache, re-add its index
        // it to the indicesToRequest list so that it will be retrieved later if the
        // currentImageIdIndex is changed to an image nearby
        var element = e.data.element;
        var stackData = cornerstoneTools.getToolState(element, 'stack');
        if (stackData === undefined || stackData.data === undefined || stackData.data.length === 0) {
            return;
        }

        var stack = stackData.data[0];
        var imageIdIndex = stack.imageIds.indexOf(eventData.imageId);

        // Make sure the image that was removed is actually in this stack
        // before adding it to the indicesToRequest array
        if (imageIdIndex > -1) {
            var stackPrefetchData = cornerstoneTools.getToolState(element, toolType);
            stackPrefetchData.data[0].indicesToRequest.push(imageIdIndex);
        }
    }

    function enable(element) {
        // Clear old prefetch data. Skipping this can cause problems when changing the series inside an element
        var stackPrefetchData = cornerstoneTools.getToolState(element, toolType);
        stackPrefetchData = [];

        // First check that there is stack data available
        var stackData = cornerstoneTools.getToolState(element, 'stack');
        if (!stackData || !stackData.data || !stackData.data.length) {
            return;
        }

        var stack = stackData.data[0];

        // Use the currentImageIdIndex from the stack as the initalImageIdIndex
        stackPrefetchData = {
            indicesToRequest: range(0, stack.imageIds.length - 1),
            enabled: true
        };

        // Remove the currentImageIdIndex from the list to request
        var indexOfCurrentImage = stackPrefetchData.indicesToRequest.indexOf(stack.currentImageIdIndex);
        stackPrefetchData.indicesToRequest.splice(indexOfCurrentImage, 1);

        cornerstoneTools.addToolState(element, toolType, stackPrefetchData);

        prefetch(element);

        $(element).off('CornerstoneNewImage', reenablePrefetch);
        $(element).on('CornerstoneNewImage', reenablePrefetch);

        $(cornerstone).off('CornerstoneImageCacheFull', handleCacheFull);
        $(cornerstone).on('CornerstoneImageCacheFull', {
            element: element
        }, handleCacheFull);

        $(cornerstone).off('CornerstoneImageCachePromiseRemoved', promiseRemovedHandler);
        $(cornerstone).on('CornerstoneImageCachePromiseRemoved', {
            element: element
        }, promiseRemovedHandler);
    }

    function disable(element) {
        $(element).off('CornerstoneNewImage', reenablePrefetch);
        $(cornerstone).off('CornerstoneImageCacheFull', handleCacheFull);
        $(cornerstone).off('CornerstoneImageCachePromiseRemoved', promiseRemovedHandler);

        var stackPrefetchData = cornerstoneTools.getToolState(element, toolType);
        // If there is actually something to disable, disable it
        if (stackPrefetchData && stackPrefetchData.data.length) {
            stackPrefetchData.data[0].enabled = false;
            clearTimeout(reenablePrefetchTimeout);
        }
    }

    function getConfiguration () {
        return configuration;
    }

    function setConfiguration(config) {
        configuration = config;
    }

    // module/private exports
    cornerstoneTools.stackPrefetch = {
        enable: enable,
        disable: disable,
        getConfiguration: getConfiguration,
        setConfiguration: setConfiguration
    };

})($, cornerstone, cornerstoneTools);
