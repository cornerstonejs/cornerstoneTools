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

    function onMouseDown(e)
    {
        cornerstoneTools.onMouseDown(e, mouseMove);
    }

    cornerstoneTools.pan = cornerstoneTools.makeSimpleTool(onMouseDown);

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));