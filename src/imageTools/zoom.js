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
        // !!!HACK/NOTE/WARNING!!!
        // for some reason I am getting mousewheel and DOMMouseScroll events on my
        // mac os x mavericks system when middle mouse button dragging.
        // I couldn't find any info about this so this might break other systems
        // webkit hack
        if(e.originalEvent.type === "mousewheel" && e.originalEvent.wheelDeltaY === 0) {
            return;
        }
        // firefox hack
        if(e.originalEvent.type === "DOMMouseScroll" && e.originalEvent.axis ===1) {
            return;
        }

        var mouseWheelData = cornerstoneTools.onMouseWheel(e);
        var ticks = -mouseWheelData.direction / 4;
        zoom(mouseWheelData.element, mouseWheelData.viewport, ticks);
    }

    cornerstoneTools.zoom = cornerstoneTools.mouseButtonTool(mouseMoveCallback);
    cornerstoneTools.zoomWheel = cornerstoneTools.mouseWheelTool(mouseWheelCallback);

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));