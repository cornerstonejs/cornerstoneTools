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

        if (newImageIdIndex !== stackData.currentImageIdIndex) {
            var startLoadingHandler = cornerstoneTools.loadHandlerManager.getStartLoadHandler();
            var endLoadingHandler = cornerstoneTools.loadHandlerManager.getEndLoadHandler();
            var errorLoadingHandler = cornerstoneTools.loadHandlerManager.getErrorLoadingHandler();

            if (startLoadingHandler) {
                startLoadingHandler(element);
            }

            stackData.currentImageIdIndex = newImageIdIndex;
            var viewport = cornerstone.getViewport(element);
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

            cornerstone.loadAndCacheImage(newImageId).then(function(image) {
                if (stackData.currentImageIdIndex === newImageIdIndex) {
                    cornerstone.displayImage(element, image, viewport);
                    if (endLoadingHandler) {
                        endLoadingHandler(element);
                    }
                }
            }, function(error) {
                var imageId = stackData.imageIds[newImageIdIndex];
                if (errorLoadingHandler) {
                    errorLoadingHandler(element, imageId, error);
                }
            });
        }
    }

    // module exports
    cornerstoneTools.scrollToIndex = scrollToIndex;
    cornerstoneTools.loadHandlers = {};

})(cornerstone, cornerstoneTools);
