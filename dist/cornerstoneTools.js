/*! cornerstoneTools - v0.0.1 - 2014-04-04 | (c) 2014 Chris Hafey | https://github.com/chafey/cornerstoneTools */
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function onMouseDown(e) {

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
                };

                // invoke the mouseMoveCallback with the data
                eventData.mouseMoveCallback(element, mouseMoveData);

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

    function makeSimpleTool(mouseMoveCallback)
    {
        var toolInterface = {
            activate: function(element, whichMouseButton) {
                $(element).unbind('mousedown', onMouseDown);
                var eventData = {
                    whichMouseButton: whichMouseButton,
                    active: true,
                    mouseMoveCallback: mouseMoveCallback
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


    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));
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
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function onMouseDown(e) {
        var eventData = e.data;
        var element = e.currentTarget;
        if(e.which === eventData.whichMouseButton) {

            var lastX = e.pageX;
            var lastY = e.pageY;

            // now that we started adjusting wwwc, hook mouse move
            // so we can continue to update the image as they drag
            // the mouse
            $(document).mousemove(function(e) {
                var deltaX = e.pageX - lastX;
                var deltaY = e.pageY - lastY;
                lastX = e.pageX;
                lastY = e.pageY;

                // here we normalize the ww/wc adjustments so the same number of on screen pixels
                // adjusts the same percentage of the dynamic range of the image.  This is needed to
                // provide consistency for the ww/wc tool regardless of the dynamic range (e.g. an 8 bit
                // image will feel the same as a 16 bit image would)
                var ee = cornerstone.getEnabledElement(element);
                var imageDynamicRange = ee.image.maxPixelValue - ee.image.minPixelValue;
                var multiplier = imageDynamicRange / 1024;

                var viewport = cornerstone.getViewport(element);
                viewport.windowWidth += (deltaX * multiplier);
                viewport.windowCenter += (deltaY * multiplier);
                cornerstone.setViewport(element, viewport);

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

    // enables the wwwwc tool on the specified element.  Note that the wwwwc tool does nothing
    // in this state as it has no overlays
    function enable(element)
    {
        $(element).unbind('mousedown', onMouseDown);
    }

    // disables the wwwc tool on the specified element
    function disable(element)
    {
        $(element).unbind('mousedown', onMouseDown);
    }

    // Activates the wwwc tool so it responds to mouse events
    function activate(element, whichMouseButton)
    {
        $(element).unbind('mousedown', onMouseDown);
        var eventData = {
            whichMouseButton: whichMouseButton,
            active: true
        };
        $(element).mousedown(eventData, onMouseDown);
    }

    // deactivates the pan tool.  This is the same thing as being enabled or disabled as the
    // pan tool requires user interactivity to do anything
    function deactivate(element)
    {
        $(element).unbind('mousedown', onMouseDown);
    }

    // module exports
    cornerstoneTools.wwwc = {
        enable: enable,
        disable : disable,
        activate: activate,
        deactivate: deactivate
    };

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }


    /*
     function zoom(element, whichMouseButton){

     if(whichMouseButton == 0) {


     $(element).on('mousewheel DOMMouseScroll', function(e) {

     var startingCoords = cornerstone.pageToImage(element, e.pageX, e.pageY);

     // Firefox e.originalEvent.detail > 0 scroll back, < 0 scroll forward
     // chrome/safari e.originalEvent.wheelDelta < 0 scroll back, > 0 scroll forward
     var ticks = 0;
     var delta = Math.abs(e.originalEvent.wheelDelta ? e.originalEvent.wheelDelta/40 : e.originalEvent.detail ? -e.originalEvent.detail : 0);
     if(e.originalEvent.wheelDelta < 0 || e.originalEvent.detail > 0)
     {
     ticks = delta;
     } else {
     ticks = -delta;
     }

     var power = 1.005;
     var viewport = cornerstone.getViewport(element);
     var oldFactor = Math.log(viewport.scale) / Math.log(power);
     var factor = oldFactor + ticks;
     var scale = Math.pow(power, factor);
     viewport.scale = scale;

     var ee = cornerstone.getEnabledElement(element);
     ee.viewport.scale = scale;

     // now adjust the centerX and Y
     var newCoords = cornerstone.pageToImage(element, e.pageX, e.pageY);
     viewport.centerX -= startingCoords.x - newCoords.x;
     viewport.centerY -= startingCoords.y - newCoords.y;
     cornerstone.setViewport(element, viewport);

     //prevent page fom scrolling
     return false;
     });
     }
     else {

     }

     }
     */


    function onMouseDown(e) {

        var eventData = e.data;
        var element = e.currentTarget;
        if(e.which === eventData.whichMouseButton) {

            var lastX = e.pageX;
            var lastY = e.pageY;

            var startingCoords = cornerstone.pageToImage(element, e.pageX, e.pageY);
            var startPageX = e.pageX;
            var startPageY = e.pageY;
            $(document).mousemove(function(e) {
                var deltaX = e.pageX - lastX,
                    deltaY = e.pageY - lastY ;

                lastX = e.pageX;
                lastY = e.pageY;

                // Calculate the new scale factor based on how far the mouse has changed
                var pow = 1.7;
                var viewport = cornerstone.getViewport(element);
                var ticks = deltaY/100;
                var oldFactor = Math.log(viewport.scale) / Math.log(pow);
                var factor = oldFactor + ticks;
                var scale = Math.pow(pow, factor);
                viewport.scale = scale;
                cornerstone.setViewport(element, viewport);

                // now adjust the centerX and Y so the location the user click when the first started
                // dragging stays in the same position as we zoom
                var newCoords = cornerstone.pageToImage(element, startPageX, startPageY);
                viewport.centerX -= startingCoords.x - newCoords.x;
                viewport.centerY -= startingCoords.y - newCoords.y;
                cornerstone.setViewport(element, viewport);

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

    // enables the zoom tool on the specified element.  Note that the zopm tool does nothing
    // in this state as it has no overlays
    function enable(element)
    {
        $(element).unbind('mousedown', onMouseDown);
    }

    // disables the zoom tool on the specified element
    function disable(element)
    {
        $(element).unbind('mousedown', onMouseDown);
    }

    // Activates the zoom tool so it responds to mouse events
    function activate(element, whichMouseButton)
    {
        $(element).unbind('mousedown', onMouseDown);
        var eventData = {
            whichMouseButton: whichMouseButton,
            active: true
        };
        $(element).mousedown(eventData, onMouseDown);
    }

    // deactivates the zoom tool.  This is the same thing as being enabled or disabled as the
    // pan tool requires user interactivity to do anything
    function deactivate(element)
    {
        $(element).unbind('mousedown', onMouseDown);
    }

    // module exports
    cornerstoneTools.zoom = {
        enable: enable,
        disable : disable,
        activate: activate,
        deactivate: deactivate
    };

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