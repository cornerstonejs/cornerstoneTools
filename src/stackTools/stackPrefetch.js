(function($, cornerstone, cornerstoneTools) {

    'use strict';

    var toolType = 'stackPrefetch';
    var configuration = {};

    var resetPrefetchTimeout,
        resetPrefetchDelay;

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
        if (!stackPrefetch.indicesToRequest.length) {
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

        function doneCallback(image) {
            //console.log('prefetch done: ' + image.imageId);
            var imageIdIndex = stack.imageIds.indexOf(image.imageId);
            removeFromList(imageIdIndex);
        }

        function failCallback(error) {
            console.log('prefetch errored: ' + error);
        }

        var requestPoolManager = cornerstoneTools.requestPoolManager;
        var type = 'prefetch';
        cornerstoneTools.requestPoolManager.clearRequestStack(type);

        var i,
            imageId,
            nextImageIdIndex;

        var nearest = nearestIndex(indicesToRequestCopy, stack.currentImageIdIndex);
        if (stackPrefetch.direction < 0) {
            //  console.log('Prefetching downward');
            for (i = 0; i < nearest.low; i++) {
                nextImageIdIndex = indicesToRequestCopy[i];
                imageId = stack.imageIds[nextImageIdIndex];
                requestPoolManager.addRequest(element, imageId, type, doneCallback, failCallback);
            }
        } else {
            // console.log('Prefetching upward');
            for (i = nearest.high; i < indicesToRequestCopy.length; i++) {
                nextImageIdIndex = indicesToRequestCopy[i];
                imageId = stack.imageIds[nextImageIdIndex];
                requestPoolManager.addRequest(element, imageId, type, doneCallback, failCallback);
            }
        }

        requestPoolManager.startGrabbing();
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
        if (!stackData || !stackData.data || !stackData.data.length) {
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

    function onImageUpdated(e) {
        //console.log('onImageUpdated');
        clearTimeout(resetPrefetchTimeout);
        resetPrefetchTimeout = setTimeout(function() {
            var element = e.currentTarget;
            prefetch(element);
        }, resetPrefetchDelay);
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

        $(element).off('CornerstoneNewImage', onImageUpdated);
        $(element).on('CornerstoneNewImage', onImageUpdated);

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
        $(element).off('CornerstoneNewImage', onImageUpdated);

        $(cornerstone).off('CornerstoneImageCacheFull', handleCacheFull);
        $(cornerstone).off('CornerstoneImageCachePromiseRemoved', promiseRemovedHandler);

        var stackPrefetchData = cornerstoneTools.getToolState(element, toolType);
        // If there is actually something to disable, disable it
        if (stackPrefetchData && stackPrefetchData.data.length) {
            stackPrefetchData.data[0].enabled = false;
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
