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

    function mouseButtonTool(onMouseMoveCallback)
    {
        var toolInterface = {
            activate: function(element, mouseButtonMask) {
                $(element).off('CornerstoneToolsMouseMove', onMouseMoveCallback);
                var eventData = {
                    mouseButtonMask: mouseButtonMask
                };
                $(element).on("CornerstoneToolsMouseMove", eventData, onMouseMoveCallback);

                //enable(element, mouseButtonMask, onMouseMoveCallback);
            },
            disable : function(element) {$(element).off('CornerstoneToolsMouseDown', onMouseMoveCallback);},
            enable : function(element) {$(element).off('CornerstoneToolsMouseDown', onMouseMoveCallback);},
            deactivate : function(element) {$(element).off('CornerstoneToolsMouseDown', onMouseMoveCallback);},
        };
        return toolInterface;
    }

    // module exports
    cornerstoneTools.mouseButtonTool = mouseButtonTool;
    cornerstoneTools.isMouseButtonEnabled = isMouseButtonEnabled;
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
                //$(element).on('mousewheel DOMMouseScroll', onMouseWheel);
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

    function mouseMove(e) {
        var mouseMoveData = e.originalEvent.detail;
        if(cornerstoneTools.isMouseButtonEnabled(mouseMoveData.which, e.data.mouseButtonMask)) {

            mouseMoveData.viewport.centerX += (mouseMoveData.deltaPoints.page.x / mouseMoveData.viewport.scale);
            mouseMoveData.viewport.centerY += (mouseMoveData.deltaPoints.page.y / mouseMoveData.viewport.scale);
            cornerstone.setViewport(mouseMoveData.element, mouseMoveData.viewport);
        }
    }

    function drag(element, dragData)
    {
        dragData.viewport.centerX += (dragData.deltaPageX / dragData.viewport.scale);
        dragData.viewport.centerY += (dragData.deltaPageY / dragData.viewport.scale);
        cornerstone.setViewport(element, dragData.viewport);
    }

    function onDrag(e) {
        cornerstoneTools.onDrag(e, drag);
    }

    cornerstoneTools.pan = cornerstoneTools.mouseButtonTool(mouseMove);
    cornerstoneTools.panTouchDrag = cornerstoneTools.touchDragTool(onDrag);

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function mouseMove(e)
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

    cornerstoneTools.wwwc = cornerstoneTools.mouseButtonTool(mouseMove);
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

    function mouseMove(e)
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

    cornerstoneTools.zoom = cornerstoneTools.mouseButtonTool(mouseMove);
    cornerstoneTools.zoomWheel = cornerstoneTools.mouseWheelTool(onMouseWheel);

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function pageToPoint(e)
    {
        return {
            x : e.pageX,
            y : e.pageY
        };
    }

    function subtract(lhs, rhs)
    {
        return {
            x : lhs.x - rhs.x,
            y : lhs.y - rhs.y
        };
    }

    function copyPoint(point)
    {
        return {
            x : point.x,
            y : point.y
        };
    }

    function copyPoints(points) {
        var page = copyPoint(points.page);
        var image = copyPoint(points.image);
        return {
            page : page,
            image: image
        };
    }

    function mouseDown(e) {
        var eventData = e.data;
        var element = e.currentTarget;

        var startPoints = {
            page: pageToPoint(e),
            image: cornerstone.pageToImage(element, e.pageX, e.pageY)
        };
        var lastPoints = copyPoints(startPoints);
        var event = new CustomEvent(
            "CornerstoneToolsMouseDown",
            {
                detail: {
                    event: e,
                    which: e.which,
                    viewport: cornerstone.getViewport(element),
                    image: cornerstone.getEnabledElement(element).image,
                    element: element,
                    startPoints: startPoints,
                    lastPoints: lastPoints
                },
                bubbles: false,
                cancelable: false
            }
        );
        element.dispatchEvent(event);

        var whichMouseButton = e.which;

        function onMouseMove(e) {

            // calculate our current points in page and image coordinates
            var currentPoints = {
                page: pageToPoint(e),
                image: cornerstone.pageToImage(element, e.pageX, e.pageY)
            };

            // Calculate delta values in page and image coordinates
            var deltaPoints = {
                page: subtract(currentPoints.page, lastPoints.page),
                image: subtract(currentPoints.image, lastPoints.image)
            };

            var event = new CustomEvent(
                "CornerstoneToolsMouseMove",
                {
                    detail: {
                        event: e,
                        which: whichMouseButton,
                        viewport: cornerstone.getViewport(element),
                        image: cornerstone.getEnabledElement(element).image,
                        element: element,
                        startPoints: startPoints,
                        lastPoints: lastPoints,
                        currentPoints: currentPoints,
                        deltaPoints: deltaPoints
                    },
                    bubbles: false,
                    cancelable: false
                }
            );
            element.dispatchEvent(event);

            // update the last points
            lastPoints = $.extend({}, currentPoints);

            // prevent left click selection of DOM elements
            return cornerstoneTools.pauseEvent(e);
        }


        // hook mouseup so we can unbind our event listeners
        // when they stop dragging
        function onMouseUp(e) {

            // calculate our current points in page and image coordinates
            var currentPoints = {
                page: pageToPoint(e),
                image: cornerstone.pageToImage(element, e.pageX, e.pageY)
            };

            // Calculate delta values in page and image coordinates
            var deltaPoints = {
                page: subtract(currentPoints.page, lastPoints.page),
                image: subtract(currentPoints.image, lastPoints.image)
            };

            var event = new CustomEvent(
                "CornerstoneToolsMouseUp",
                {
                    detail: {
                        event: e,
                        which: whichMouseButton,
                        viewport: cornerstone.getViewport(element),
                        image: cornerstone.getEnabledElement(element).image,
                        element: element,
                        startPoints: startPoints,
                        lastPoints: lastPoints,
                        currentPoints: currentPoints,
                        deltaPoints: deltaPoints
                    },
                    bubbles: false,
                    cancelable: false
                }
            );
            element.dispatchEvent(event);

            $(document).unbind('mousemove', onMouseMove);
            $(document).unbind('mouseup', onMouseUp);
        }

        $(document).on("mousemove", onMouseMove);
        $(document).on("mouseup", onMouseUp);


        return cornerstoneTools.pauseEvent(e);
    }

    function enable(element)
    {
        $(element).on("mousedown", mouseDown);
    }

    function disable(element) {
        $(element).unbind("mousedown", mouseDown);
    }

    // module exports
    cornerstoneTools.mouseInput = {
        enable : enable,
        disable : disable
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