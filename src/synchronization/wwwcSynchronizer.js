var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    // This function synchronizes the target element ww/wc to match the source element
    function wwwcSynchronizer(synchronizer, sourceElement, targetElement) {

        // ignore the case where the source and target are the same enabled element
        if(targetElement === sourceElement) {
            return;
        }
        // get the source and target viewports
        var sourceViewport = cornerstone.getViewport(sourceElement);
        var targetViewport = cornerstone.getViewport(targetElement);

        // do nothing if the ww/wc already match
        if(targetViewport.voi.windowWidth === sourceViewport.voi.windowWidth &&
            targetViewport.voi.windowCenter === sourceViewport.voi.windowCenter &&
            targetViewport.invert === sourceViewport.invert) {
            return;
        }

        // www/wc are different, sync them
        targetViewport.voi.windowWidth = sourceViewport.voi.windowWidth;
        targetViewport.voi.windowCenter = sourceViewport.voi.windowCenter;
        targetViewport.invert = sourceViewport.invert;
        synchronizer.setViewport(targetElement, targetViewport);
    }


    // module/private exports
    cornerstoneTools.wwwcSynchronizer = wwwcSynchronizer;

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));