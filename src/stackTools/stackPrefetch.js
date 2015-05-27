var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    var toolType = "stackPrefetch";
    var defaultMaxRequests = 11;

    function range(lowEnd, highEnd)
    {
        // Javascript version of Python's range function
        // http://stackoverflow.com/questions/3895478/does-javascript-have-a-method-like-range-to-generate-an-array-based-on-suppl
        var arr = [],
            c = highEnd - lowEnd + 1;

        while ( c-- ) {
            arr[c] = highEnd--;
        }
        return arr;
    }

    function prefetch(element)
    {
        // Check to make sure stack data exists
        var stackData = cornerstoneTools.getToolState(element, 'stack');
        if(stackData === undefined || stackData.data === undefined || stackData.data.length === 0) {
            return;
        }
        var stack = stackData.data[0];

        // Get the stackPrefetch tool data
        var stackPrefetchData = cornerstoneTools.getToolState(element, toolType);
        if(stackPrefetchData === undefined) {
            // should not happen
            return;
        }
        var stackPrefetch = stackPrefetchData.data[0];

        // When all the requests are complete, disable the stackPrefetch tool
        if (stackPrefetch.indicesToRequest.length === 0) {
            stackPrefetch.enabled = false;
        }

        // Make sure the tool is still enabled
        if(stackPrefetch.enabled === false) {
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
        // console.log("Calculating imageIdIndices");

        // Check if this is the first run through of the recursion
        if (stackPrefetch.indicesToRequest.length === stack.imageIds.length) {
            // If it is, grab maxSimultaneousRequests around initialImageIdIndex
            stackPrefetch.minIndex = stackPrefetch.initialImageIdIndex - Math.floor(stackPrefetch.maxSimultaneousRequests / 2);
            stackPrefetch.maxIndex = stackPrefetch.initialImageIdIndex + Math.floor(stackPrefetch.maxSimultaneousRequests / 2);
        }

        
        var lowRange = range(stackPrefetch.minIndex, stackPrefetch.minIndex + Math.floor(stackPrefetch.maxSimultaneousRequests / 2) - 1);
        // The minus 2 here is for two reasons:
        // + 1 to prevent overlap with the highRange
        // + 1 to prevent overlap with the previous batch
        stackPrefetch.minIndex -= Math.floor(stackPrefetch.maxSimultaneousRequests / 2);
        var highRange = range(stackPrefetch.maxIndex - Math.floor(stackPrefetch.maxSimultaneousRequests / 2), stackPrefetch.maxIndex);
        // + 1 to prevent overlap with the previous batch
        stackPrefetch.maxIndex += Math.floor(stackPrefetch.maxSimultaneousRequests / 2) + 1;

        var stackLength = stack.imageIds.length;
        imageIdIndices = lowRange.concat(highRange);

        var index;
        for(var j=0; j < imageIdIndices.length; j++) {
            index = imageIdIndices[j];
            if (index > stackLength - 1) {
                imageIdIndices[j] -= stackLength;
            }
            if (index < 0) {
                imageIdIndices[j] += stackLength;
            }
        }

        console.log("Batch: " + element.id + " imageIdIndices:" + imageIdIndices);
        
        function removeFromList(imageIdIndex)
        {
            //console.log("Removing imageIdIndex: " + imageIdIndex);
            var index = stackPrefetch.indicesToRequest.indexOf(imageIdIndex);
            stackPrefetch.indicesToRequest.splice(index, 1);
        }
        
        // Loop through the images that should be requested in this batch
        var imageIdIndices;
        var imageIdIndex;
        var imageId;
        var loadImageDeferred;
        var deferredList = [];

        for(var i=0; i < imageIdIndices.length; i++) {
            imageIdIndex = imageIdIndices[i];
            imageId = stack.imageIds[imageIdIndex];

            // Load and cache the image
            loadImageDeferred = cornerstone.loadAndCacheImage(imageId);

            // When this is complete, remove the imageIdIndex from the list
            loadImageDeferred.done(removeFromList(imageIdIndex));

            // Add the image promises to a list
            deferredList.push(loadImageDeferred);
        }

        // When this batch of images is loaded (all async requests have finished)
        // call this function again
        $.when.apply($, deferredList).done(function () {
            //console.log("Batch " + element.id + " complete");
            if (stackPrefetch.indicesToRequest.length > 0) {
                // Set a timeout here to prevent locking up the UI
                // Maybe use a web worker for this?
                setTimeout(prefetch(element), 50);
            } else {
                console.log("All images loaded " + element.id);
            }
        });
    }

    function enable(element, maxSimultaneousRequests)
    {
        var stackPrefetchData = cornerstoneTools.getToolState(element, toolType);
        if (stackPrefetchData === undefined) {
            // If this is the first time enabling the prefetching, add tool data

            // First check that there is stack data available
            var stackData = cornerstoneTools.getToolState(element, 'stack');
            if(stackData === undefined || stackData.data === undefined || stackData.data.length === 0) {
                return;
            }
            var stack = stackData.data[0];

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
            if (maxSimultaneousRequests !== undefined) {
                stackPrefetchData.data[0].maxSimultaneousRequests = maxSimultaneousRequests;
            }
        }

        prefetch(element);
    }

    function disable(element)
    {
        var stackPrefetchData = cornerstoneTools.getToolState(element, toolType);
        // If there is actually something to disable, disable it
        if (stackPrefetchData !== undefined) {
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
