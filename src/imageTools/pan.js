var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
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

    function mouseDragCallback(e) {
        var mouseMoveData = e.originalEvent.detail;
        mouseMoveData.viewport.translation.x += (mouseMoveData.deltaPoints.page.x / mouseMoveData.viewport.scale);
        mouseMoveData.viewport.translation.y += (mouseMoveData.deltaPoints.page.y / mouseMoveData.viewport.scale);
        cornerstone.setViewport(mouseMoveData.element, mouseMoveData.viewport);
        return false; // false = cases jquery to preventDefault() and stopPropagation() this event
    }

    function onDrag(e) {
        var dragData = e.originalEvent.detail;
        dragData.viewport.translation.x += (dragData.deltaPoints.page.x / dragData.viewport.scale);
        dragData.viewport.translation.y += (dragData.deltaPoints.page.y / dragData.viewport.scale);
        cornerstone.setViewport(dragData.element, dragData.viewport);
        return false; // false = cases jquery to preventDefault() and stopPropagation() this event
    }

    cornerstoneTools.pan = cornerstoneTools.simpleMouseButtonTool(mouseDownCallback);
    cornerstoneTools.panTouchDrag = cornerstoneTools.touchDragTool(onDrag);

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));