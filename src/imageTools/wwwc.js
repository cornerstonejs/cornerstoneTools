var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function mouseMove(element, mouseMoveData)
    {
        // here we normalize the ww/wc adjustments so the same number of on screen pixels
        // adjusts the same percentage of the dynamic range of the image.  This is needed to
        // provide consistency for the ww/wc tool regardless of the dynamic range (e.g. an 8 bit
        // image will feel the same as a 16 bit image would)
        var imageDynamicRange = mouseMoveData.image.maxPixelValue - mouseMoveData.image.minPixelValue;
        var multiplier = imageDynamicRange / 1024;

        mouseMoveData.viewport.windowWidth += (mouseMoveData.deltaPageX * multiplier);
        mouseMoveData.viewport.windowCenter += (mouseMoveData.deltaPageY * multiplier);
        cornerstone.setViewport(element, mouseMoveData.viewport);
    }

    function onMouseDown(e)
    {
        cornerstoneTools.onMouseDown(e, mouseMove);
    }

    cornerstoneTools.wwwc = cornerstoneTools.mouseButtonTool(onMouseDown);


    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));