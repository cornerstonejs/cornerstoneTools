var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    // This function causes the image in the target stack to be set to the one closest
    // to the image in the source stack by image position
    function stackImagePositionSynchronizer(synchronizer, sourceElement, targetElement) {

        // ignore the case where the source and target are the same enabled element
        if(targetElement === sourceElement) {
            return;
        }

        var sourceImage = cornerstone.getEnabledElement(sourceElement).image;
        var sourceImagePlane = cornerstoneTools.metaData.get('imagePlane', sourceImage.imageId);
        var sourceImagePosition = sourceImagePlane.imagePositionPatient;

        var stackToolDataSource = cornerstoneTools.getToolState(targetElement, 'stack');
        var stackData = stackToolDataSource.data[0];

        var minDistance = Number.MAX_VALUE;
        var newImageIdIndex = -1;

        $.each(stackData.imageIds, function(index, imageId) {
            var imagePlane = cornerstoneTools.metaData.get('imagePlane', imageId);
            var imagePosition = imagePlane.imagePositionPatient;
            var distance = imagePosition.distanceToSquared(sourceImagePosition);
            //console.log(index + '=' + distance);
            if(distance < minDistance) {
                minDistance = distance;
                newImageIdIndex = index;
            }
        });

        if(newImageIdIndex === stackData.currentImageIdIndex)
        {
            return;
        }

        if(newImageIdIndex !== -1) {
            cornerstone.loadAndCacheImage(stackData.imageIds[newImageIdIndex]).then(function(image) {
                var viewport = cornerstone.getViewport(targetElement);
                stackData.currentImageIdIndex = newImageIdIndex;
                synchronizer.displayImage(targetElement, image, viewport);
            });
        }
    }

    // module/private exports
    cornerstoneTools.stackImagePositionSynchronizer = stackImagePositionSynchronizer;

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));