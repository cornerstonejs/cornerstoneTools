var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if (cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    var toolType = "stackPrefetch";
    var defaultMaxRequests = 11;

    function range(lowEnd, highEnd) {
        // Javascript version of Python's range function
        // http://stackoverflow.com/questions/3895478/does-javascript-have-a-method-like-range-to-generate-an-array-based-on-suppl
        var arr = [],
            c = highEnd - lowEnd + 1;

        while ( c-- ) {
            arr[c] = highEnd--;
        }
        return arr;
    }

    function prefetch(element) {
        // Check to make sure stack data exists
        var stackData = cornerstoneTools.getToolState(element, 'stack');
        if (stackData === undefined || stackData.data === undefined || stackData.data.length === 0) {
            return;
        }
        var stack = stackData.data[0];

        // Get the stackPrefetch tool data
        var stackPrefetchData = cornerstoneTools.getToolState(element, toolType);
        if (stackPrefetchData === undefined) {
            // should not happen
            return;
        }
        var stackPrefetch = stackPrefetchData.data[0];

        var lowRange,
            highRange,
            stackLength,
            imageIdIndices,
            imageId,
            loadImageDeferred,
            deferredList = [];

        // When all the requests are complete, disable the stackPrefetch tool
        if (stackPrefetch.indicesToRequest.length === 0) {
            stackPrefetch.enabled = false;
        }

        // Make sure the tool is still enabled
        if (stackPrefetch.enabled === false) {
            return;
        }

        // If the tool is enabled
        // Start at the prefetchImageIdIndex
        // Get maxSimultaneousRequests around the prefetchImageIdIndex
        // Use middle-out recursion to tackle the whole list, maxSimultaneousRequests
        // at a time.
        //
        // e.g. if prefetchImageIdIndex is 4, maxSimultaneousRequests is 11,
        // and there are 20 images in the stack
        // Fetch images 0 to 9 first, then recall this function
        // Fetch images 15-20 and 9-14

        // Check if this is the first run through of the recursion
        if (stackPrefetch.indicesToRequest.length === stack.imageIds.length) {
            // If it is, grab maxSimultaneousRequests around initialImageIdIndex
            stackPrefetch.minIndex = stackPrefetch.initialImageIdIndex - Math.floor(stackPrefetch.maxSimultaneousRequests / 2);
            stackPrefetch.maxIndex = stackPrefetch.initialImageIdIndex + Math.floor(stackPrefetch.maxSimultaneousRequests / 2);
        }

        // Calculate the "low range" (in the example, this would be images 0-4)
        lowRange = range(stackPrefetch.minIndex, stackPrefetch.minIndex + Math.floor(stackPrefetch.maxSimultaneousRequests / 2) - 1);

        // Calculate the "low range" (in the example, this would be images 5-9)
        highRange = range(stackPrefetch.maxIndex - Math.floor(stackPrefetch.maxSimultaneousRequests / 2), stackPrefetch.maxIndex);

        // Combine the ranges into a single array
        imageIdIndices = lowRange.concat(highRange);

        // StackLength is used to wrap the calculated imageIdIndices around the size of the stack
        // e.g. if the high range extends above the stack size, make it start from the beginning of the stack
        stackLength = stack.imageIds.length;

        // Uses imageIdIndices[i] to change the values in the array
        imageIdIndices.forEach(function(imageIdIndex, i, imageIdIndices) {
            // If the indices in the range are larger than the stack array size,
            // make them start from the bottom of the stack
            if (imageIdIndex > stackLength - 1) {
                imageIdIndices[i] -= stackLength;
            }

            // If the index is negative, make it start from the top of the stack
            if (imageIdIndex < 0) {
                imageIdIndices[i] += stackLength;
            }
        });

        // Remove duplicates in the array, in case the ranges overlap
        var uniqueImageIdIndices = imageIdIndices.filter(function(elem, pos) {
            return imageIdIndices.indexOf(elem) == pos;
        });

        // Remove an imageIdIndex from the list of indices to request
        // This fires when the individual image loading deferred is resolved        
        function removeFromList(imageIdIndex) {
            var index = stackPrefetch.indicesToRequest.indexOf(imageIdIndex);
            stackPrefetch.indicesToRequest.splice(index, 1);
        }
        
        // Throws an error if something has gone wrong
        function errorHandler(imageId) {
            throw "stackPrefetch: image not retrieved: " + imageId;
        }

        // Loop through the images that should be requested in this batch
        uniqueImageIdIndices.forEach(function(imageIdIndex) {
            imageId = stack.imageIds[imageIdIndex];

            // Load and cache the image
            loadImageDeferred = cornerstone.loadAndCacheImage(imageId);

            // When this is complete, remove the imageIdIndex from the list
            loadImageDeferred.done(removeFromList(imageIdIndex));
            loadImageDeferred.fail(errorHandler(imageId));

            // Add the image promises to a list
            deferredList.push(loadImageDeferred);
        });

        // Update the min and maximum values in the tool data, for the next iteration
        stackPrefetch.minIndex -= Math.floor(stackPrefetch.maxSimultaneousRequests / 2);
        // Add one to the maxIndex to prevent overlap with the previous batch
        stackPrefetch.maxIndex += Math.floor(stackPrefetch.maxSimultaneousRequests / 2) + 1;


        // When this batch of images is loaded (all async requests have finished)
        $.when.apply($, deferredList).done(function () {
            // If there are still images that need to be requested, call this function again
            if (stackPrefetch.indicesToRequest.length > 0) {
                // Set a timeout here to prevent locking up the UI
                setTimeout(prefetch(element), 50);
            }
        });

        // If the entire batch of requests has failed, throw an error
        $.when.apply($, deferredList).fail(function () {
            throw "stackPrefetch: batch failed for element: " + element.id;
        });
    }

    function enable(element, maxSimultaneousRequests)
    {
        var stackPrefetchData = cornerstoneTools.getToolState(element, toolType);
        if (stackPrefetchData === undefined) {
            // If this is the first time enabling the prefetching, add tool data

            // First check that there is stack data available
            var stackData = cornerstoneTools.getToolState(element, 'stack');
            if (stackData === undefined || stackData.data === undefined || stackData.data.length === 0) {
                return;
            }
            var stack = stackData.data[0];

            // The maximum simultaneous requests is capped at 
            // a rather arbitrary number of 11, since we don't want to overload any servers
            if (maxSimultaneousRequests === undefined) {
                maxSimultaneousRequests = Math.max(Math.ceil(stack.imageIds.length / 5), defaultMaxRequests);
            }

            // Use the currentImageIdIndex from the stack as the initalImageIdIndex
            stackPrefetchData = {
                initialImageIdIndex : stack.currentImageIdIndex,
                indicesToRequest : range(0, stack.imageIds.length - 1),
                maxSimultaneousRequests : maxSimultaneousRequests,
                enabled: true
            };
            cornerstoneTools.addToolState(element, toolType, stackPrefetchData);
        } else {
            // Otherwise, re-enable the prefetching
            stackPrefetchData.data[0].enabled = true;
            if (maxSimultaneousRequests) {
                stackPrefetchData.data[0].maxSimultaneousRequests = maxSimultaneousRequests;
            }
        }

        prefetch(element);
    }

    function disable(element)
    {
        var stackPrefetchData = cornerstoneTools.getToolState(element, toolType);
        // If there is actually something to disable, disable it
        if (stackPrefetchData) {
            stackPrefetchData.data[0].enabled = false;
        }
    }

    // module/private exports
    cornerstoneTools.stackPrefetch = {
        enable: enable,
        disable: disable
    };

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));
