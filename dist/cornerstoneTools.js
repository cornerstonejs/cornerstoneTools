/*! cornerstoneTools - v0.0.1 - 2014-04-05 | (c) 2014 Chris Hafey | https://github.com/chafey/cornerstoneTools */
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function isMouseButtonEnabled(which, mouseButtonMask)
    {
        /*jshint bitwise: false*/
        var mouseButton = (1 << (which - 1));
        return ((mouseButtonMask & mouseButton) !== 0);
    }

    function onMouseDown(e, mouseMoveCallback) {

        var eventData = e.data;

        var mouseButtonEnabled = isMouseButtonEnabled(e.which, eventData.mouseButtonMask);
        if(mouseButtonEnabled === true) {

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

            $(document).on('mousemove', function(e) {
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

    function mouseButtonTool(onMouseDown)
    {
        var toolInterface = {
            activate: function(element, mouseButtonMask) {
                $(element).unbind('mousedown', onMouseDown);
                var eventData = {
                    mouseButtonMask: mouseButtonMask
                };
                $(element).on("mousedown", eventData, onMouseDown);
            },
            disable : unbind,
            enable: unbind,
            deactivate: unbind
        };
        return toolInterface;
    }

    // module exports
    cornerstoneTools.mouseButtonTool = mouseButtonTool;
    cornerstoneTools.onMouseDown = onMouseDown;

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function onMouseWheel(e, mouseWheelCallback) {

        var element = e.currentTarget;

        var startingCoords = cornerstone.pageToImage(element, e.pageX, e.pageY);

        e = window.event || e; // old IE support
        var wheelDelta = e.wheelDelta || -e.detail || -e.originalEvent.detail;
        var direction = Math.max(-1, Math.min(1, (wheelDelta)));

        var mouseWheelData = {
            direction : direction,
            pageX : e.pageX,
            pageY: e.pageY,
            imageX : startingCoords.x,
            imageY : startingCoords.y,
            viewport: cornerstone.getViewport(element),
            image: cornerstone.getEnabledElement(element).image
        };

        mouseWheelCallback(element, mouseWheelData);
    }

    function unbind(element)
    {
        $(element).unbind('mousewheel DOMMouseScroll', onMouseWheel);
    }

    function mouseWheelTool(onMouseWheel)
    {
        var toolInterface = {
            activate: function(element) {
                $(element).unbind('mousewheel DOMMouseScroll', onMouseWheel);
                $(element).on('mousewheel DOMMouseScroll', onMouseWheel);
            },
            disable : unbind,
            enable: unbind,
            deactivate: unbind
        };
        return toolInterface;
    }

    // module exports
    cornerstoneTools.mouseWheelTool = mouseWheelTool;
    cornerstoneTools.onMouseWheel = onMouseWheel;

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    /*jshint newcap: false */

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }


    function onDrag(e, onDragCallback)
    {
        var element = e.currentTarget;

        var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
        var startPageX = touch.pageX;
        var startPageY = touch.pageY;
        var startImagePoint = cornerstone.pageToImage(element, touch.pageX, touch.pageY);
        var startImageX = startImagePoint.x;
        var startImageY = startImagePoint.y;

        var lastPageX = touch.pageX;
        var lastPageY = touch.pageY;
        var lastImageX = startImageX;
        var lastImageY = startImageY;

        $(document).bind('touchmove', function(e) {
            e.preventDefault();
            var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];

            var pageX = touch.pageX;
            var pageY = touch.pageY;
            var currentImagePoint = cornerstone.pageToImage(element, pageX, pageY);
            var deltaImageX = currentImagePoint.x - lastImageX;
            var deltaImageY = currentImagePoint.y - lastImageY;
            var deltaPageX = pageX - lastPageX;
            var deltaPageY = pageY - lastPageY;

            var dragData = {
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
                pageX : pageX,
                pageY : pageY,
                imageX : currentImagePoint.x,
                imageY : currentImagePoint.y,
                viewport: cornerstone.getViewport(element),
                image: cornerstone.getEnabledElement(element).image
            };

            // update the last coordinates for page and image
            lastPageX = pageX;
            lastPageY = pageY;
            lastImageX = currentImagePoint.x;
            lastImageY = currentImagePoint.y;

            // use a timeout to update the viewport so the DOM has time to update itself
            setTimeout(function() {
                onDragCallback(element, dragData);
            }, 1);
        });

        $(document).bind('touchend', function()
        {
            $(document).unbind('touchmove');
            $(document).unbind('touchend');
        });
    }

    function touchDragTool(onDragStart)
    {
        var toolInterface = {
            activate: function(element) {
                $(element).unbind('touchstart', onDragStart);
                $(element).bind('touchstart', onDragStart);
            },
            disable : function(element) {$(element).unbind('touchstart', onDragStart);},
            enable: function(element) {$(element).unbind('touchstart', onDragStart);},
            deactivate: function(element) {$(element).unbind('touchstart', onDragStart);}
        };
        return toolInterface;
    }

    // module exports
    cornerstoneTools.touchDragTool = touchDragTool;
    cornerstoneTools.onDrag = onDrag;

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));
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

    function drag(element, dragData)
    {
        dragData.viewport.centerX += (dragData.deltaPageX / dragData.viewport.scale);
        dragData.viewport.centerY += (dragData.deltaPageY / dragData.viewport.scale);
        cornerstone.setViewport(element, dragData.viewport);
    }

    function onMouseDown(e)
    {
        cornerstoneTools.onMouseDown(e, mouseMove);
    }

    function onDrag(e) {
        cornerstoneTools.onDrag(e, drag);
    }

    cornerstoneTools.pan = cornerstoneTools.mouseButtonTool(onMouseDown);
    cornerstoneTools.panTouchDrag = cornerstoneTools.touchDragTool(onDrag);

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));
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

    function drag(element, dragData)
    {
        var imageDynamicRange = dragData.image.maxPixelValue - dragData.image.minPixelValue;
        var multiplier = imageDynamicRange / 1024;

        dragData.viewport.windowWidth += (dragData.deltaPageX * multiplier);
        dragData.viewport.windowCenter += (dragData.deltaPageY * multiplier);
        cornerstone.setViewport(element, dragData.viewport);
    }

    function onMouseDown(e)
    {
        cornerstoneTools.onMouseDown(e, mouseMove);
    }

    function onDrag(e) {
        cornerstoneTools.onDrag(e, drag);
    }


    cornerstoneTools.wwwc = cornerstoneTools.mouseButtonTool(onMouseDown);
    cornerstoneTools.wwwcTouchDrag = cornerstoneTools.touchDragTool(onDrag);


    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));
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