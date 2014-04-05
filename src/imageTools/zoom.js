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

    function mouseMove(element, mouseMoveData)
    {
        var ticks = mouseMoveData.deltaPageY/100;
        zoom(element, mouseMoveData.viewport, ticks);

        // Now that the scale has been updated, determine the offset we need to apply to the center so we can
        // keep the original start location in the same position
        var newCoords = cornerstone.pageToImage(element, mouseMoveData.startPageX, mouseMoveData.startPageY);
        mouseMoveData.viewport.centerX -= mouseMoveData.startImageX - newCoords.x;
        mouseMoveData.viewport.centerY -= mouseMoveData.startImageY - newCoords.y;
        cornerstone.setViewport(element, mouseMoveData.viewport);
    }

    function mouseWheel(element, mouseWheelData)
    {
        var ticks = -mouseWheelData.direction / 4;
        zoom(element, mouseWheelData.viewport, ticks);
    }

    function onMouseWheel(e)
    {
        cornerstoneTools.onMouseWheel(e, mouseWheel);
    }

    function onMouseDown(e)
    {
        cornerstoneTools.onMouseDown(e, mouseMove);
    }

    cornerstoneTools.zoom = cornerstoneTools.mouseButtonTool(onMouseDown);
    cornerstoneTools.zoomWheel = cornerstoneTools.mouseWheelTool(onMouseWheel);

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));