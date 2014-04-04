/*! cornerstoneTools - v0.0.1 - 2014-04-04 | (c) 2014 Chris Hafey | https://github.com/chafey/cornerstoneTools */
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function onMouseDown(e, mouseMoveCallback) {

        var eventData = e.data;

        if(e.which === eventData.whichMouseButton) {

            var element = e.currentTarget;

            var startPageX = e.pageX;
            var startPageY = e.pageY;
            var startImagePoint = cornerstone.pageToImage(element, e.pageX, e.pageY);
            var startImageX = startImagePoint.x;
            var startImageY = startImagePoint.y;

            var lastPageX = e.pageX;
            var lastPageY = e.pageY;
            var lastImageX = startImageX;
            var lastImageY = startImageY;

            $(document).mousemove(function(e) {
                // Calculate delta values in page and image coordinates
                var deltaPageX = e.pageX - lastPageX;
                var deltaPageY = e.pageY - lastPageY;
                var currentImagePoint = cornerstone.pageToImage(element, e.pageX, e.pageY);
                var deltaImageX = currentImagePoint.x - lastImageX;
                var deltaImageY = currentImagePoint.y - lastImageY;

                // create an object with all the data they might need
                var mouseMoveData = {
                    startPageX : startPageX,
                    startPageY : startPageY,
                    startImageX : startImageX,
                    startImageY : startImageY,
                    lastPageX : lastPageX,
                    lastPageY : lastPageY,
                    lastImageX : lastImageX,
                    lastImageY : lastImageY,
                    deltaPageX : deltaPageX,
                    deltaPageY : deltaPageY,
                    deltaImageX : deltaImageX,
                    deltaImageY : deltaImageY,
                    pageX : e.pageX,
                    pageY : e.pageY,
                    imageX : currentImagePoint.x,
                    imageY : currentImagePoint.y,
                    viewport: cornerstone.getViewport(element),
                    image: cornerstone.getEnabledElement(element).image
                };

                // invoke the mouseMoveCallback with the data
                mouseMoveCallback(element, mouseMoveData);

                // update the last coordinates for page and image
                lastPageX = e.pageX;
                lastPageY = e.pageY;
                lastImageX = currentImagePoint.x;
                lastImageY = currentImagePoint.y;

                // prevent left click selection of DOM elements
                return cornerstoneTools.pauseEvent(e);
            });

            // hook mouseup so we can unbind our event listeners
            // when they stop dragging
            $(document).mouseup(function(e) {
                $(document).unbind('mousemove');
                $(document).unbind('mouseup');
            });

            // prevent left click selection of DOM elements
            return cornerstoneTools.pauseEvent(e);
        }
    }

    function unbind(element)
    {
        $(element).unbind('mousedown', onMouseDown);
    }

    function makeSimpleTool(onMouseDown)
    {
        var toolInterface = {
            activate: function(element, whichMouseButton) {
                $(element).unbind('mousedown', onMouseDown);
                var eventData = {
                    whichMouseButton: whichMouseButton,
                    active: true,
                };
                $(element).mousedown(eventData, onMouseDown);
            },
            disable : unbind,
            enable: unbind,
            deactivate: unbind
        };
        return toolInterface;
    }

    // module exports
    cornerstoneTools.makeSimpleTool = makeSimpleTool;
    cornerstoneTools.onMouseDown = onMouseDown;

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

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
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

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

    cornerstoneTools.wwwc = cornerstoneTools.makeSimpleTool(onMouseDown);


    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));
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
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    /**
     * This function is used to prevent selection from occuring when left click dragging on the image
     * @param e the event that is provided to your event handler
     * Based on: http://stackoverflow.com/questions/5429827/how-can-i-prevent-text-element-selection-with-cursor-drag
     * @returns {boolean}
     */
    function pauseEvent(e)
    {
        if(e.stopPropagation) {
            e.stopPropagation();
        }
        if(e.preventDefault) {
            e.preventDefault();
        }
        e.cancelBubble=true;
        e.returnValue=false;
        return false;
    }

    // module exports
    cornerstoneTools.pauseEvent = pauseEvent;


    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));