var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function zoom(element, viewport, ticks)
    {
        // Calculate the new scale factor based on how far the mouse has changed
        var pow = 1.7;
        var oldFactor = Math.log(viewport.scale) / Math.log(pow);
        var factor = oldFactor + ticks;
        var scale = Math.pow(pow, factor);
        viewport.scale = scale;
        cornerstone.setViewport(element, viewport);
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
            e.preventDefault();
            e.stopImmediatePropagation();
            return false;
        }
    }

    function mouseDragCallback(e)
    {
        var mouseMoveData = e.originalEvent.detail;

        var ticks = mouseMoveData.deltaPoints.page.y/100;
        zoom(mouseMoveData.element, mouseMoveData.viewport, ticks);

        // Now that the scale has been updated, determine the offset we need to apply to the center so we can
        // keep the original start location in the same position
        var newCoords = cornerstone.pageToImage(mouseMoveData.element, mouseMoveData.startPoints.page.x, mouseMoveData.startPoints.page.y);
        mouseMoveData.viewport.centerX -= mouseMoveData.startPoints.image.x - newCoords.x;
        mouseMoveData.viewport.centerY -= mouseMoveData.startPoints.image.y - newCoords.y;
        cornerstone.setViewport(mouseMoveData.element, mouseMoveData.viewport);

        e.preventDefault();
        e.stopImmediatePropagation();
        return false;
    }

    function mouseWheelCallback(e)
    {
        var mouseWheelData = e.originalEvent.detail;
        var ticks = -mouseWheelData.direction / 4;
        zoom(mouseWheelData.element, mouseWheelData.viewport, ticks);
    }

    function touchPinchCallback(e)
    {
        var pinchData = e.originalEvent.detail;
        zoom(pinchData.element, pinchData.viewport, pinchData.direction / 4);
    }

    cornerstoneTools.zoom = cornerstoneTools.mouseButtonTool(mouseDownCallback);
    cornerstoneTools.zoomWheel = cornerstoneTools.mouseWheelTool(mouseWheelCallback);
    cornerstoneTools.zoomTouchPinch = cornerstoneTools.touchPinchTool(touchPinchCallback);
    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));