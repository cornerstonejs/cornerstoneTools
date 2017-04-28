// This function causes the image in the target stack to be set to the one closest
// to the image in the source stack by image position
export default function (synchronizer, sourceElement, targetElement) {

    // ignore the case where the source and target are the same enabled element
    if (targetElement === sourceElement) {
        return;
    }

    var sourceImage = cornerstone.getEnabledElement(sourceElement).image;
    var sourceImagePlane = metaData.get('imagePlane', sourceImage.imageId);
    var sourceImagePosition = sourceImagePlane.imagePositionPatient;

    var stackToolDataSource = getToolState(targetElement, 'stack');
    var stackData = stackToolDataSource.data[0];

    var minDistance = Number.MAX_VALUE;
    var newImageIdIndex = -1;

    $.each(stackData.imageIds, function(index, imageId) {
        var imagePlane = metaData.get('imagePlane', imageId);
        var imagePosition = imagePlane.imagePositionPatient;
        var distance = imagePosition.distanceToSquared(sourceImagePosition);
        //console.log(index + '=' + distance);
        if (distance < minDistance) {
            minDistance = distance;
            newImageIdIndex = index;
        }
    });

    if (newImageIdIndex === stackData.currentImageIdIndex) {
        return;
    }

    var startLoadingHandler = loadHandlerManager.getStartLoadHandler();
    var endLoadingHandler = loadHandlerManager.getEndLoadHandler();
    var errorLoadingHandler = loadHandlerManager.getErrorLoadingHandler();

    if (startLoadingHandler) {
        startLoadingHandler(targetElement);
    }

    if (newImageIdIndex !== -1) {
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
                endLoadingHandler(targetElement, image);
            }
        }, function(error) {
            var imageId = stackData.imageIds[newImageIdIndex];
            if (errorLoadingHandler) {
                errorLoadingHandler(targetElement, imageId, error);
            }
        });
    }
}