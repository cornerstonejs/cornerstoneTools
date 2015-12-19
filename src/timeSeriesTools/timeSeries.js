(function($, cornerstone, cornerstoneTools) {

    'use strict';

    function incrementTimePoint(element, timePoints, wrap) {
        var toolData = cornerstoneTools.getToolState(element, 'timeSeries');
        if (toolData === undefined || toolData.data === undefined || toolData.data.length === 0) {
            return;
        }

        var timeSeriesData = toolData.data[0];
        var currentStack = timeSeriesData.stacks[timeSeriesData.currentStackIndex];
        var currentImageIdIndex = currentStack.currentImageIdIndex;
        var newStackIndex = timeSeriesData.currentStackIndex + timePoints;

        // loop around if we go outside the stack
        if (wrap) {
            if (newStackIndex >= timeSeriesData.stacks.length) {
                newStackIndex = 0;
            }

            if (newStackIndex < 0) {
                newStackIndex = timeSeriesData.stacks.length - 1;
            }
        } else {
            newStackIndex = Math.min(timeSeriesData.stacks.length - 1, newStackIndex);
            newStackIndex = Math.max(0, newStackIndex);
        }

        if (newStackIndex !== timeSeriesData.currentStackIndex) {
            var viewport = cornerstone.getViewport(element);
            var newStack = timeSeriesData.stacks[newStackIndex];

            var startLoadingHandler = cornerstoneTools.loadHandlerManager.getStartLoadHandler();
            var endLoadingHandler = cornerstoneTools.loadHandlerManager.getEndLoadHandler();
            var errorLoadingHandler = cornerstoneTools.loadHandlerManager.getErrorLoadingHandler();

            if (startLoadingHandler) {
                startLoadingHandler(element);
            }

            var loader;
            if (newStack.preventCache === true) {
                loader = cornerstone.loadImage(newStack.imageIds[currentImageIdIndex]);
            } else {
                loader = cornerstone.loadAndCacheImage(newStack.imageIds[currentImageIdIndex]);
            }

            loader.then(function(image) {
                if (timeSeriesData.currentImageIdIndex !== currentImageIdIndex) {
                    newStack.currentImageIdIndex = currentImageIdIndex;
                    timeSeriesData.currentStackIndex = newStackIndex;
                    cornerstone.displayImage(element, image, viewport);
                    if (endLoadingHandler) {
                        endLoadingHandler(element);
                    }
                }
            }, function(error) {
                var imageId = newStack.imageIds[currentImageIdIndex];
                if (errorLoadingHandler) {
                    errorLoadingHandler(element, imageId, error);
                }
            });
        }
    }

    // module/private exports
    cornerstoneTools.incrementTimePoint = incrementTimePoint;

})($, cornerstone, cornerstoneTools);
