var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function mouseMove(element, mouseMoveData) {
        mouseMoveData.viewport.centerX += (mouseMoveData.deltaPageX / mouseMoveData.viewport.scale);
        mouseMoveData.viewport.centerY += (mouseMoveData.deltaPageY / mouseMoveData.viewport.scale);
        cornerstone.setViewport(element, mouseMoveData.viewport);
    }

    function drag(element, dragData)
    {
        dragData.viewport.centerX += (dragData.deltaPageX / dragData.viewport.scale);
        dragData.viewport.centerY += (dragData.deltaPageY / dragData.viewport.scale);
        cornerstone.setViewport(element, dragData.viewport);
    }

    function onMouseDown(e)
    {
        cornerstoneTools.onMouseDown(e, mouseMove);
    }

    function onDrag(e) {
        cornerstoneTools.onDrag(e, drag);
    }

    cornerstoneTools.pan = cornerstoneTools.mouseButtonTool(onMouseDown);
    cornerstoneTools.panTouchDrag = cornerstoneTools.touchDragTool(onDrag);

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));