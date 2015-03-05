var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    // This function causes the target image to be drawn immediately
    function updateImageSynchronizer(synchronizer, sourceElement, targetElement) {

        // ignore the case where the source and target are the same enabled element
        if(targetElement === sourceElement) {
            return;
        }

        cornerstone.updateImage(targetElement);
    }

    // module/private exports
    cornerstoneTools.updateImageSynchronizer = updateImageSynchronizer;

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));