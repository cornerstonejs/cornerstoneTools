(function($, cornerstone, cornerstoneTools) {

    'use strict';

    // This function causes the image in the target stack to be set to the one closest
    // to the image in the source stack by image position

    // In the future we will want to have a way to manually register links sets of the same orientation (e.g. an axial link set from a prior with an axial link set of a current).  The user could do this by scrolling the two stacks to a similar location and then doing a user action (e.g. right click link) at which point the system will capture the delta between the image position (patient) of both stacks and use that to sync them.  This offset will need to be adjustable.

    function stackImagePositionOffsetSynchronizer(synchronizer, sourceElement, targetElement, eventData, positionDifference) {

        // ignore the case where the source and target are the same enabled element
        if (targetElement === sourceElement) {
            return;
        }

        var sourceEnabledElement = cornerstone.getEnabledElement(sourceElement);
        var sourceImagePlane = cornerstoneTools.metaData.get('imagePlane', sourceEnabledElement.image.imageId);
        var sourceImagePosition = sourceImagePlane.imagePositionPatient;

        var stackToolDataSource = cornerstoneTools.getToolState(targetElement, 'stack');
        var stackData = stackToolDataSource.data[0];

        var minDistance = Number.MAX_VALUE;
        var newImageIdIndex = -1;

        if (!positionDifference) {
            return;
        }

        var finalPosition = sourceImagePosition.clone().add(positionDifference);

        stackData.imageIds.forEach(function(imageId, index) {
            var imagePlane = cornerstoneTools.metaData.get('imagePlane', imageId);
            var imagePosition = imagePlane.imagePositionPatient;
            var distance = finalPosition.distanceToSquared(imagePosition);

            if (distance < minDistance) {
                minDistance = distance;
                newImageIdIndex = index;
            }
        });

        if (newImageIdIndex === stackData.currentImageIdIndex || newImageIdIndex === -1) {
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
    cornerstoneTools.stackImagePositionOffsetSynchronizer = stackImagePositionOffsetSynchronizer;

})($, cornerstone, cornerstoneTools);
