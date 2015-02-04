var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    // This function synchronizes the target zoom and pan to match the source
    function panZoomSynchronizer(synchronizer, sourceElement, targetElement) {

        // ignore the case where the source and target are the same enabled element
        if(targetElement === sourceElement) {
            return;
        }
        // get the source and target viewports
        var sourceViewport = cornerstone.getViewport(sourceElement);
        var targetViewport = cornerstone.getViewport(targetElement);

        // do nothing if the scale and translation are the same
        if(targetViewport.scale === sourceViewport.scale &&
            targetViewport.translation.x === sourceViewport.translation.x &&
            targetViewport.translation.y === sourceViewport.translation.y) {
            return;
        }

        // scale and/or translation are different, sync them
        targetViewport.scale = sourceViewport.scale;
        targetViewport.translation.x = sourceViewport.translation.x;
        targetViewport.translation.y = sourceViewport.translation.y;
        synchronizer.setViewport(targetElement, targetViewport);
    }


    // module/private exports
    cornerstoneTools.panZoomSynchronizer = panZoomSynchronizer;

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));