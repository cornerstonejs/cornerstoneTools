var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    var toolType = "timeSeriesScroll";

    function incrementTimePoint(element, timePoints, wrap)
    {
        var toolData = cornerstoneTools.getToolState(element, 'timeSeries');
        if(toolData === undefined || toolData.data === undefined || toolData.data.length === 0) {
            return;
        }

        var timeSeriesData = toolData.data[0];
        var currentStack = timeSeriesData.stacks[timeSeriesData.currentStackIndex];
        var currentImageIdIndex = currentStack.currentImageIdIndex;
        var newStackIndex = timeSeriesData.currentStackIndex + timePoints;

        // loop around if we go outside the stack
        if(wrap) {
            if (newStackIndex >= timeSeriesData.stacks.length)
            {
                newStackIndex =0;
            }
            if(newStackIndex < 0) {
                newStackIndex = timeSeriesData.stacks.length -1;
            }
        }
        else {
            newStackIndex = Math.min(timeSeriesData.stacks.length - 1, newStackIndex);
            newStackIndex = Math.max(0, newStackIndex);
        }

        if(newStackIndex !== timeSeriesData.currentStackIndex)
        {
            var viewport = cornerstone.getViewport(element);
            var newStack = timeSeriesData.stacks[newStackIndex];
            cornerstone.loadAndCacheImage(newStack.imageIds[currentImageIdIndex]).then(function(image) {
                if(timeSeriesData.currentImageIdIndex !== currentImageIdIndex) {
                    newStack.currentImageIdIndex = currentImageIdIndex;
                    timeSeriesData.currentStackIndex = newStackIndex;
                    //var stackToolData = cornerstoneTools.getToolState(element, 'stack');
                    //stackToolData[0] = newStack;
                    cornerstone.displayImage(element, image, viewport);
                }
            });
        }
    }

    // module/private exports
    cornerstoneTools.incrementTimePoint = incrementTimePoint;

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));