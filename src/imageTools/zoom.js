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

    function mouseMoveCallback(e)
    {
        var mouseMoveData = e.originalEvent.detail;

        if(cornerstoneTools.isMouseButtonEnabled(mouseMoveData.which, e.data.mouseButtonMask)) {
            var ticks = mouseMoveData.deltaPoints.page.y/100;
            zoom(mouseMoveData.element, mouseMoveData.viewport, ticks);

            // Now that the scale has been updated, determine the offset we need to apply to the center so we can
            // keep the original start location in the same position
            var newCoords = cornerstone.pageToImage(mouseMoveData.element, mouseMoveData.startPoints.page.x, mouseMoveData.startPoints.page.y);
            mouseMoveData.viewport.centerX -= mouseMoveData.startPoints.image.x - newCoords.x;
            mouseMoveData.viewport.centerY -= mouseMoveData.startPoints.image.y - newCoords.y;
            cornerstone.setViewport(mouseMoveData.element, mouseMoveData.viewport);
        }
        return false;
    }

    function mouseWheelCallback(e)
    {
        var mouseWheelData = e.originalEvent.detail;
        var ticks = -mouseWheelData.direction / 4;
        zoom(mouseWheelData.element, mouseWheelData.viewport, ticks);
    }

    cornerstoneTools.zoom = cornerstoneTools.mouseButtonTool(mouseMoveCallback);
    cornerstoneTools.zoomWheel = cornerstoneTools.mouseWheelTool(mouseWheelCallback);

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));