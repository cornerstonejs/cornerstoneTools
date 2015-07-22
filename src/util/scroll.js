(function(cornerstone, cornerstoneTools) {

    'use strict';

    function scroll(element, images) {
        var toolData = cornerstoneTools.getToolState(element, 'stack');
        if (toolData === undefined || toolData.data === undefined || toolData.data.length === 0) {
            return;
        }

        var stackData = toolData.data[0];

        var newImageIdIndex = stackData.currentImageIdIndex + images;
        newImageIdIndex = Math.min(stackData.imageIds.length - 1, newImageIdIndex);
        newImageIdIndex = Math.max(0, newImageIdIndex);

        cornerstoneTools.scrollToIndex(element, newImageIdIndex);
    }

    // module exports
    cornerstoneTools.scroll = scroll;

})(cornerstone, cornerstoneTools);
