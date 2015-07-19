(function(cornerstone, cornerstoneTools) {

    "use strict";

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
            var endLoadingHandler  = cornerstoneTools.loadHandlerManager.getEndLoadHandler();

            if (startLoadingHandler) {
                startLoadingHandler(element);
            }

            stackData.currentImageIdIndex = newImageIdIndex;
            var viewport = cornerstone.getViewport(element);

            cornerstone.loadAndCacheImage(stackData.imageIds[newImageIdIndex]).then(function(image) {
                if (stackData.currentImageIdIndex === newImageIdIndex) {
                    cornerstone.displayImage(element, image, viewport);
                    if (endLoadingHandler) {
                        endLoadingHandler(element);
                    }
                }
            });
        }
    }

    // module exports
    cornerstoneTools.scrollToIndex = scrollToIndex;
    cornerstoneTools.loadHandlers = {};

})(cornerstone, cornerstoneTools);
