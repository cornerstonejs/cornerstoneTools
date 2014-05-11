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
            return false; // false = cases jquery to preventDefault() and stopPropagation() this event
        }
    }

    function mouseDragCallback(e)
    {
        var mouseMoveData = e.originalEvent.detail;

        var ticks = mouseMoveData.deltaPoints.page.y/100;
        zoom(mouseMoveData.element, mouseMoveData.viewport, ticks);

        // Now that the scale has been updated, determine the offset we need to apply to the center so we can
        // keep the original start location in the same position
        var newCoords = cornerstone.pageToPixel(mouseMoveData.element, mouseMoveData.startPoints.page.x, mouseMoveData.startPoints.page.y);
        mouseMoveData.viewport.translation.x -= mouseMoveData.startPoints.image.x - newCoords.x;
        mouseMoveData.viewport.translation.y -= mouseMoveData.startPoints.image.y - newCoords.y;
        cornerstone.setViewport(mouseMoveData.element, mouseMoveData.viewport);
        return false; // false = cases jquery to preventDefault() and stopPropagation() this event
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

    function zoomTouchDrag(e)
    {
        var dragData = e.originalEvent.detail;
        var ticks = dragData.deltaPoints.page.y/100;
        zoom(dragData.element, dragData.viewport, ticks);

        // Now that the scale has been updated, determine the offset we need to apply to the center so we can
        // keep the original start location in the same position
        var newCoords = cornerstone.pageToPixel(dragData.element, dragData.startPoints.page.x, dragData.startPoints.page.y);
        dragData.viewport.translation.x -= dragData.startPoints.image.x - newCoords.x;
        dragData.viewport.translation.y -= dragData.startPoints.image.y - newCoords.y;
        cornerstone.setViewport(dragData.element, dragData.viewport);
        return false; // false = cases jquery to preventDefault() and stopPropagation() this event
    }


    cornerstoneTools.zoom = cornerstoneTools.simpleMouseButtonTool(mouseDownCallback);
    cornerstoneTools.zoomWheel = cornerstoneTools.mouseWheelTool(mouseWheelCallback);
    cornerstoneTools.zoomTouchPinch = cornerstoneTools.touchPinchTool(touchPinchCallback);
    cornerstoneTools.zoomTouchDrag = cornerstoneTools.touchDragTool(zoomTouchDrag);
    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));