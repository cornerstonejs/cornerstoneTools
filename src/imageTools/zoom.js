var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function mouseMove(element, mouseMoveData)
    {
        // Calculate the new scale factor based on how far the mouse has changed
        var pow = 1.7;
        var ticks = mouseMoveData.deltaPageY/100;
        var oldFactor = Math.log(mouseMoveData.viewport.scale) / Math.log(pow);
        var factor = oldFactor + ticks;
        var scale = Math.pow(pow, factor);
        mouseMoveData.viewport.scale = scale;
        cornerstone.setViewport(element, mouseMoveData.viewport);

        // Now that the scale has been updated, determine the offset we need to apply to keep the center
        // at the original spot
        var newCoords = cornerstone.pageToImage(element, mouseMoveData.startPageX, mouseMoveData.startPageY);
        mouseMoveData.viewport.centerX -= mouseMoveData.startImageX - newCoords.x;
        mouseMoveData.viewport.centerY -= mouseMoveData.startImageY - newCoords.y;
        cornerstone.setViewport(element, mouseMoveData.viewport);

    }

    function onMouseDown(e)
    {
        cornerstoneTools.onMouseDown(e, mouseMove);
    }

    cornerstoneTools.zoom = cornerstoneTools.makeSimpleTool(onMouseDown);


    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));