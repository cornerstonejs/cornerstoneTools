(function(cornerstone, cornerstoneTools) {

    'use strict';

    function scrollToIndex(element, newImageIdIndex) {
        var toolData = cornerstoneTools.getToolState(element, 'stack');
        if (toolData === undefined || toolData.data === undefined || toolData.data.length === 0) {
            return;
        }

        var stackData = toolData.data[0];

        // Allow for negative indexing
        if (newImageIdIndex < 0) {
            newImageIdIndex += stackData.imageIds.length;
        }

        var startLoadingHandler = cornerstoneTools.loadHandlerManager.getStartLoadHandler();
        var endLoadingHandler = cornerstoneTools.loadHandlerManager.getEndLoadHandler();
        var errorLoadingHandler = cornerstoneTools.loadHandlerManager.getErrorLoadingHandler();

        var viewport = cornerstone.getViewport(element);

        function doneCallback(image) {
            //console.log('interaction done: ' + image.imageId);
            if (stackData.currentImageIdIndex === newImageIdIndex) {
                cornerstone.displayImage(element, image, viewport);
                if (endLoadingHandler) {
                    endLoadingHandler(element);
                }
            }
        }

        function failCallback(error) {
            var imageId = stackData.imageIds[newImageIdIndex];
            if (errorLoadingHandler) {
                errorLoadingHandler(element, imageId, error);
            }
        }

        if (newImageIdIndex === stackData.currentImageIdIndex) {
            return;
        }

        if (startLoadingHandler) {
            startLoadingHandler(element);
        }

        var eventData = {
            newImageIdIndex: newImageIdIndex,
            direction: newImageIdIndex - stackData.currentImageIdIndex
        };

        stackData.currentImageIdIndex = newImageIdIndex;

        var newImageId = stackData.imageIds[newImageIdIndex];

        // Retry image loading in cases where previous image promise
        // was rejected, if the option is set
        var config = cornerstoneTools.stackScroll.getConfiguration();
        if (config && config.retryLoadOnScroll === true) {
            var newImagePromise = cornerstone.imageCache.getImagePromise(newImageId);
            if (newImagePromise && newImagePromise.state() === 'rejected') {
                cornerstone.imageCache.removeImagePromise(newImageId);
            }
        }

        var requestPoolManager = cornerstoneTools.requestPoolManager;
        var type = 'interaction';

        cornerstoneTools.requestPoolManager.clearRequestStack(type);

        // Convert the preventCache value in stack data to a boolean
        var preventCache = !!stackData.preventCache;

        requestPoolManager.addRequest(element, newImageId, type, preventCache, doneCallback, failCallback);
        requestPoolManager.startGrabbing();

        $(element).trigger('CornerstoneStackScroll', eventData);
    }

    // module exports
    cornerstoneTools.scrollToIndex = scrollToIndex;
    cornerstoneTools.loadHandlers = {};

})(cornerstone, cornerstoneTools);
