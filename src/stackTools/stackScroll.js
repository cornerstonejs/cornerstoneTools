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
            cornerstone.newStackImage(element, stackData.imageIds[newImageIdIndex]);
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
            $(mouseData.element).on("CornerstoneToolsMouseDrag", mouseDragCallback);
            $(mouseData.element).on("CornerstoneToolsMouseUp", mouseUpCallback);
            return false; // false = cases jquery to preventDefault() and stopPropagation() this event
        }
    }

    function mouseDragCallback(e)
    {
        var mouseMoveData = e.originalEvent.detail;

        var images = mouseMoveData.deltaPoints.page.y/100;
        scroll(mouseMoveData.element, images);

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