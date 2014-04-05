var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function mouseMoveCallback(e)
    {
        var mouseMoveData = e.originalEvent.detail;
        if(cornerstoneTools.isMouseButtonEnabled(mouseMoveData.which, e.data.mouseButtonMask)) {
            // here we normalize the ww/wc adjustments so the same number of on screen pixels
            // adjusts the same percentage of the dynamic range of the image.  This is needed to
            // provide consistency for the ww/wc tool regardless of the dynamic range (e.g. an 8 bit
            // image will feel the same as a 16 bit image would)
            var imageDynamicRange = mouseMoveData.image.maxPixelValue - mouseMoveData.image.minPixelValue;
            var multiplier = imageDynamicRange / 1024;

            mouseMoveData.viewport.windowWidth += (mouseMoveData.deltaPoints.page.x * multiplier);
            mouseMoveData.viewport.windowCenter += (mouseMoveData.deltaPoints.page.y * multiplier);
            cornerstone.setViewport(mouseMoveData.element, mouseMoveData.viewport);
        }
    }

    function drag(element, dragData)
    {
        var imageDynamicRange = dragData.image.maxPixelValue - dragData.image.minPixelValue;
        var multiplier = imageDynamicRange / 1024;

        dragData.viewport.windowWidth += (dragData.deltaPageX * multiplier);
        dragData.viewport.windowCenter += (dragData.deltaPageY * multiplier);
        cornerstone.setViewport(element, dragData.viewport);
    }

    function onDrag(e) {
        cornerstoneTools.onDrag(e, drag);
    }

    cornerstoneTools.wwwc = cornerstoneTools.mouseButtonTool(mouseMoveCallback);
    cornerstoneTools.wwwcTouchDrag = cornerstoneTools.touchDragTool(onDrag);


    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));