var cornerstoneTools = (function (cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

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
            stackData.currentImageIdIndex = newImageIdIndex;
            var viewport = cornerstone.getViewport(element);

            cornerstone.loadAndCacheImage(stackData.imageIds[newImageIdIndex]).then(function(image) {
                if (stackData.currentImageIdIndex === newImageIdIndex) {
                    cornerstone.displayImage(element, image, viewport);
                }
            });
        }
    }

    // module exports
    cornerstoneTools.scrollToIndex = scrollToIndex;

    return cornerstoneTools;
}(cornerstone, cornerstoneTools));