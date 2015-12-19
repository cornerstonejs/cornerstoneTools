(function($, cornerstone, cornerstoneTools) {

    'use strict';

    // This function causes any scrolling actions within the stack to propagate to 
    // all of the other viewports that are synced
    function stackScrollSynchronizer(synchronizer, sourceElement, targetElement, eventData) {
        // If the target and source are the same, stop
        if (sourceElement === targetElement) {
            return;
        }

        // If there is no event, or direction is 0, stop
        if (!eventData || !eventData.direction) {
            return;
        }

        // Get the stack of the target viewport
        var stackToolDataSource = cornerstoneTools.getToolState(targetElement, 'stack');
        var stackData = stackToolDataSource.data[0];

        // Get the new index for the stack
        var newImageIdIndex = stackData.currentImageIdIndex + eventData.direction;

        // Ensure the index does not exceed the bounds of the stack
        newImageIdIndex = Math.min(Math.max(newImageIdIndex, 0), stackData.imageIds.length - 1);

        // If the index has not changed, stop here
        if (stackData.currentImageIdIndex === newImageIdIndex) {
            return;
        }

        var startLoadingHandler = cornerstoneTools.loadHandlerManager.getStartLoadHandler();
        var endLoadingHandler = cornerstoneTools.loadHandlerManager.getEndLoadHandler();
        var errorLoadingHandler = cornerstoneTools.loadHandlerManager.getErrorLoadingHandler();

        if (startLoadingHandler) {
            startLoadingHandler(targetElement);
        }

        var loader;
        if (stackData.preventCache === true) {
            loader = cornerstone.loadImage(stackData.imageIds[newImageIdIndex]);
        } else {
            loader = cornerstone.loadAndCacheImage(stackData.imageIds[newImageIdIndex]);
        }

        loader.then(function(image) {
            var viewport = cornerstone.getViewport(targetElement);
            stackData.currentImageIdIndex = newImageIdIndex;
            synchronizer.displayImage(targetElement, image, viewport);
            if (endLoadingHandler) {
                endLoadingHandler(targetElement);
            }
        }, function(error) {
            var imageId = stackData.imageIds[newImageIdIndex];
            if (errorLoadingHandler) {
                errorLoadingHandler(targetElement, imageId, error);
            }
        });
    }

    // module/private exports
    cornerstoneTools.stackScrollSynchronizer = stackScrollSynchronizer;

})($, cornerstone, cornerstoneTools);
