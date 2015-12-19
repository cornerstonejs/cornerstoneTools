(function($, cornerstone, cornerstoneTools) {

    'use strict';

    // This function causes the image in the target stack to be set to the one closest
    // to the image in the source stack by image position
    function stackImageIndexSynchronizer(synchronizer, sourceElement, targetElement) {

        // ignore the case where the source and target are the same enabled element
        if (targetElement === sourceElement) {
            return;
        }

        var sourceStackToolDataSource = cornerstoneTools.getToolState(sourceElement, 'stack');
        var sourceStackData = sourceStackToolDataSource.data[0];
        var targetStackToolDataSource = cornerstoneTools.getToolState(targetElement, 'stack');
        var targetStackData = targetStackToolDataSource.data[0];

        var newImageIdIndex = sourceStackData.currentImageIdIndex;

        // clamp the index
        newImageIdIndex = Math.min(Math.max(newImageIdIndex, 0), targetStackData.imageIds.length - 1);

        // Do nothing if the index has not changed
        if (newImageIdIndex === targetStackData.currentImageIdIndex) {
            return;
        }

        var startLoadingHandler = cornerstoneTools.loadHandlerManager.getStartLoadHandler();
        var endLoadingHandler = cornerstoneTools.loadHandlerManager.getEndLoadHandler();
        var errorLoadingHandler = cornerstoneTools.loadHandlerManager.getErrorLoadingHandler();

        if (startLoadingHandler) {
            startLoadingHandler(targetElement);
        }

        var loader;
        if (targetStackData.preventCache === true) {
            loader = cornerstone.loadImage(targetStackData.imageIds[newImageIdIndex]);
        } else {
            loader = cornerstone.loadAndCacheImage(targetStackData.imageIds[newImageIdIndex]);
        }

        loader.then(function(image) {
            var viewport = cornerstone.getViewport(targetElement);
            targetStackData.currentImageIdIndex = newImageIdIndex;
            synchronizer.displayImage(targetElement, image, viewport);
            if (endLoadingHandler) {
                endLoadingHandler(targetElement);
            }
        }, function(error) {
            var imageId = targetStackData.imageIds[newImageIdIndex];
            if (errorLoadingHandler) {
                errorLoadingHandler(targetElement, imageId, error);
            }
        });
    }

    // module/private exports
    cornerstoneTools.stackImageIndexSynchronizer = stackImageIndexSynchronizer;

})($, cornerstone, cornerstoneTools);
