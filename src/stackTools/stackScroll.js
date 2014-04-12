var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    var toolType = "stackScroll";

    function scroll(element, images)
    {
        var toolData = cornerstoneTools.getToolState(element, 'stack');
        if(toolData === undefined || toolData.data === undefined || toolData.data.length === 0) {
            return;
        }

        var stackData = toolData.data[0];

        var newImageIdIndex = stackData.currentImageIdIndex + images;
        newImageIdIndex = Math.min(stackData.imageIds.length - 1, newImageIdIndex);
        newImageIdIndex = Math.max(0, newImageIdIndex);

        if(newImageIdIndex !== stackData.currentImageIdIndex)
        {
            stackData.currentImageIdIndex = newImageIdIndex;
            var viewport = cornerstone.getViewport(element);
            cornerstone.showImage(element, stackData.imageIds[newImageIdIndex], viewport);
        }
    }

    function mouseUpCallback(e)
    {
        var mouseData = e.originalEvent.detail;
        $(mouseData.element).off("CornerstoneToolsMouseDrag", mouseDragCallback);
        $(mouseData.element).off("CornerstoneToolsMouseUp", mouseUpCallback);
    }

    function mouseDownCallback(e)
    {
        var mouseData = e.originalEvent.detail;
        if(cornerstoneTools.isMouseButtonEnabled(mouseData.which, e.data.mouseButtonMask)) {
            var toolData = cornerstoneTools.getToolState(mouseData.element, 'stack');
            if(toolData === undefined || toolData.data === undefined || toolData.data.length === 0) {
                return;
            }
            var stackData = toolData.data[0];

            var eventData = {
                deltaY : 0
            };
            $(mouseData.element).on("CornerstoneToolsMouseDrag", eventData, mouseDragCallback);
            $(mouseData.element).on("CornerstoneToolsMouseUp", mouseUpCallback);
            return false; // false = cases jquery to preventDefault() and stopPropagation() this event
        }
    }

    function mouseDragCallback(e)
    {
        var mouseMoveData = e.originalEvent.detail;
        var eventData = e.detail;
        var stackData = cornerstoneTools.getToolState(mouseMoveData.element, 'stack');
        if(stackData === undefined || stackData.data === undefined || stackData.data.length === 0) {
            return;
        }
        var stack = stackData.data[0];

        var toolData = cornerstoneTools.getToolState(mouseMoveData.element, toolType);
        if(toolData === undefined || toolData.data === undefined || toolData.data.length === 0) {
            toolData = {
                deltaY : 0
            };
            cornerstoneTools.addToolState(mouseMoveData.element, toolType, toolData);
        }
        else
        {
            toolData = toolData.data[0];
        }

        toolData.deltaY += mouseMoveData.deltaPoints.page.y;
        if(toolData.deltaY >=3 || toolData.deltaY <= -3)
        {
            var imageDelta = toolData.deltaY / 3;
            var imageDeltaMod = toolData.deltaY % 3;
            var imageIdIndexOffset = Math.round(imageDelta);
            toolData.deltaY = imageDeltaMod;
            var imageIdIndex = stack.currentImageIdIndex + imageIdIndexOffset;
            imageIdIndex = Math.min(stack.imageIds.length - 1, imageIdIndex);
            imageIdIndex = Math.max(0, imageIdIndex);
            if(imageIdIndex !== stack.currentImageIdIndex)
            {
                stack.currentImageIdIndex = imageIdIndex;
                var viewport = cornerstone.getViewport(mouseMoveData.element);
                cornerstone.showImage(mouseMoveData.element, stack.imageIds[imageIdIndex], viewport);
            }

        }

        return false; // false = cases jquery to preventDefault() and stopPropagation() this event
    }

    function mouseWheelCallback(e)
    {
        var mouseWheelData = e.originalEvent.detail;
        var images = -mouseWheelData.direction;
        scroll(mouseWheelData.element, images);
    }

    // module/private exports
    cornerstoneTools.stackScroll = cornerstoneTools.simpleMouseButtonTool(mouseDownCallback);
    cornerstoneTools.stackScrollWheel = cornerstoneTools.mouseWheelTool(mouseWheelCallback);

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));