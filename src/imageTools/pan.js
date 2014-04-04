var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function mouseMove(element, mouseMoveData) {
        var viewport = cornerstone.getViewport(element);
        viewport.centerX += (mouseMoveData.deltaPageX / viewport.scale);
        viewport.centerY += (mouseMoveData.deltaPageY / viewport.scale);
        cornerstone.setViewport(element, viewport);
    }

    cornerstoneTools.pan = cornerstoneTools.makeSimpleTool(mouseMove);

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));