var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function mouseMove(e) {
        var mouseMoveData = e.originalEvent.detail;
        if(cornerstoneTools.isMouseButtonEnabled(mouseMoveData.which, e.data.mouseButtonMask)) {

            mouseMoveData.viewport.centerX += (mouseMoveData.deltaPoints.page.x / mouseMoveData.viewport.scale);
            mouseMoveData.viewport.centerY += (mouseMoveData.deltaPoints.page.y / mouseMoveData.viewport.scale);
            cornerstone.setViewport(mouseMoveData.element, mouseMoveData.viewport);
        }
    }

    function drag(element, dragData)
    {
        dragData.viewport.centerX += (dragData.deltaPageX / dragData.viewport.scale);
        dragData.viewport.centerY += (dragData.deltaPageY / dragData.viewport.scale);
        cornerstone.setViewport(element, dragData.viewport);
    }

    function onDrag(e) {
        cornerstoneTools.onDrag(e, drag);
    }

    cornerstoneTools.pan = cornerstoneTools.mouseButtonTool(mouseMove);
    cornerstoneTools.panTouchDrag = cornerstoneTools.touchDragTool(onDrag);

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));