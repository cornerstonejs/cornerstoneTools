/*! cornerstoneTools - v0.0.1 - 2014-04-05 | (c) 2014 Chris Hafey | https://github.com/chafey/cornerstoneTools */
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function mouseWheel(e)
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

        var element = e.currentTarget;
        var startingCoords = cornerstone.pageToImage(element, e.pageX, e.pageY);

        e = window.event || e; // old IE support
        var wheelDelta = e.wheelDelta || -e.detail || -e.originalEvent.detail;
        var direction = Math.max(-1, Math.min(1, (wheelDelta)));

        var mouseWheelData = {
            element: element,
            viewport: cornerstone.getViewport(element),
            image: cornerstone.getEnabledElement(element).image,
            direction : direction,
            pageX : e.pageX,
            pageY: e.pageY,
            imageX : startingCoords.x,
            imageY : startingCoords.y
        };

        var event = new CustomEvent(
            "CornerstoneToolsMouseWheel",
            {
                detail: {
                    event: e,
                    direction: direction,
                    viewport: cornerstone.getViewport(element),
                    image: cornerstone.getEnabledElement(element).image,
                    element: element
                },
                bubbles: false,
                cancelable: false
            }
        );
        element.dispatchEvent(event);
    }


    var mouseWheelEvents = "mousewheel DOMMouseScroll";

    function enable(element)
    {
        $(element).on(mouseWheelEvents, mouseWheel);
    }

    function disable(element) {
        $(element).unbind(mouseWheelEvents, mouseWheel);
    }

    // module exports
    cornerstoneTools.mouseWheelInput = {
        enable : enable,
        disable : disable
    };

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }


    function mouseDown(e) {
        var eventData = e.data;
        var element = e.currentTarget;

        var startPoints = {
            page: cornerstoneTools.point.pageToPoint(e),
            image: cornerstone.pageToImage(element, e.pageX, e.pageY)
        };
        var lastPoints = cornerstoneTools.copyPoints(startPoints);
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
                page: cornerstoneTools.point.pageToPoint(e),
                image: cornerstone.pageToImage(element, e.pageX, e.pageY)
            };

            // Calculate delta values in page and image coordinates
            var deltaPoints = {
                page: cornerstoneTools.point.subtract(currentPoints.page, lastPoints.page),
                image: cornerstoneTools.point.subtract(currentPoints.image, lastPoints.image)
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
            lastPoints = cornerstoneTools.copyPoints(currentPoints);

            // prevent left click selection of DOM elements
            return cornerstoneTools.pauseEvent(e);
        }


        // hook mouseup so we can unbind our event listeners
        // when they stop dragging
        function onMouseUp(e) {

            // calculate our current points in page and image coordinates
            var currentPoints = {
                page: cornerstoneTools.point.pageToPoint(e),
                image: cornerstone.pageToImage(element, e.pageX, e.pageY)
            };

            // Calculate delta values in page and image coordinates
            var deltaPoints = {
                page: cornerstoneTools.point.subtract(currentPoints.page, lastPoints.page),
                image: cornerstoneTools.point.subtract(currentPoints.image, lastPoints.image)
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

    function mouseButtonTool(mouseMoveCallback)
    {
        var toolInterface = {
            activate: function(element, mouseButtonMask) {
                $(element).off('CornerstoneToolsMouseMove', mouseMoveCallback);
                var eventData = {
                    mouseButtonMask: mouseButtonMask
                };
                $(element).on("CornerstoneToolsMouseMove", eventData, mouseMoveCallback);
            },
            disable : function(element) {$(element).off('CornerstoneToolsMouseDown', mouseMoveCallback);},
            enable : function(element) {$(element).off('CornerstoneToolsMouseDown', mouseMoveCallback);},
            deactivate : function(element) {$(element).off('CornerstoneToolsMouseDown', mouseMoveCallback);},
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

    function mouseWheelTool(mouseWheelCallback)
    {
        var toolInterface = {
            activate: function(element) {
                $(element).off('CornerstoneToolsMouseWheel', mouseWheelCallback);
                var eventData = {
                };
                $(element).on("CornerstoneToolsMouseWheel", eventData, mouseWheelCallback);
            },
            disable : function(element) {$(element).off('CornerstoneToolsMouseWheel', mouseWheelCallback);},
            enable : function(element) {$(element).off('CornerstoneToolsMouseWheel', mouseWheelCallback);},
            deactivate : function(element) {$(element).off('CornerstoneToolsMouseWheel', mouseWheelCallback);}
        };
        return toolInterface;
    }

    // module exports
    cornerstoneTools.mouseWheelTool = mouseWheelTool;

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    /*jshint newcap: false */

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }


    function touchDragTool(touchDragCallback)
    {
        var toolInterface = {
            activate: function(element, mouseButtonMask) {
                $(element).off('CornerstoneToolsTouchDrag', touchDragCallback);
                var eventData = {
                };
                $(element).on("CornerstoneToolsTouchDrag", eventData, touchDragCallback);
            },
            disable : function(element) {$(element).off('CornerstoneToolsTouchDrag', touchDragCallback);},
            enable : function(element) {$(element).off('CornerstoneToolsTouchDrag', touchDragCallback);},
            deactivate : function(element) {$(element).off('CornerstoneToolsTouchDrag', touchDragCallback);}
        };
        return toolInterface;
    }

    // module exports
    cornerstoneTools.touchDragTool = touchDragTool;

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    /*jshint newcap: false */

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }


    function touchPinchTool(touchPinchCallback)
    {
        var toolInterface = {
            activate: function(element) {
                $(element).off('CornerstoneToolsTouchPinch', touchPinchCallback);
                var eventData = {
                };
                $(element).on("CornerstoneToolsTouchPinch", eventData, touchPinchCallback);
            },
            disable : function(element) {$(element).off('CornerstoneToolsTouchPinch', touchPinchCallback);},
            enable : function(element) {$(element).off('CornerstoneToolsTouchPinch', touchPinchCallback);},
            deactivate : function(element) {$(element).off('CornerstoneToolsTouchPinch', touchPinchCallback);}
        };
        return toolInterface;
    }

    // module exports
    cornerstoneTools.touchPinchTool = touchPinchTool;

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function mouseMoveCallback(e) {
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

    cornerstoneTools.pan = cornerstoneTools.mouseButtonTool(mouseMoveCallback);
    cornerstoneTools.panTouchDrag = cornerstoneTools.touchDragTool(onDrag);

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));
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

    function touchDragCallback(e)
    {
        var dragData = e.originalEvent.detail;

        var imageDynamicRange = dragData.image.maxPixelValue - dragData.image.minPixelValue;
        var multiplier = imageDynamicRange / 1024;

        dragData.viewport.windowWidth += (dragData.deltaPoints.page.x * multiplier);
        dragData.viewport.windowCenter += (dragData.deltaPoints.page.y * multiplier);
        cornerstone.setViewport(dragData.element, dragData.viewport);
    }

    cornerstoneTools.wwwc = cornerstoneTools.mouseButtonTool(mouseMoveCallback);
    cornerstoneTools.wwwcTouchDrag = cornerstoneTools.touchDragTool(touchDragCallback);


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

    function touchPinchCallback(e)
    {
        var pinchData = e.originalEvent.detail;
        zoom(pinchData.element, pinchData.viewport, pinchData.direction / 4);
    }

    cornerstoneTools.zoom = cornerstoneTools.mouseButtonTool(mouseMoveCallback);
    cornerstoneTools.zoomWheel = cornerstoneTools.mouseWheelTool(mouseWheelCallback);
    cornerstoneTools.zoomTouchPinch = cornerstoneTools.touchPinchTool(touchPinchCallback);
    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    /*jshint newcap: false */

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    var lastScale = 1.0;
    var processingTouch = false;

    var startPoints;
    var lastPoints;

    function onTouch(e)
    {
        e.gesture.preventDefault();
        e.gesture.stopPropagation();


        // we use a global flag to keep track of whether or not we are pinching
        // to avoid queueing up tons of events
        if(processingTouch === true)
        {
            return;
        }

        var element = e.currentTarget;
        var event;

        if(e.type === 'transform')
        {
            var scale = lastScale - e.gesture.scale;
            lastScale = e.gesture.scale;
            event = new CustomEvent(
                "CornerstoneToolsTouchPinch",
                {
                    detail: {
                        event: e,
                        viewport: cornerstone.getViewport(element),
                        image: cornerstone.getEnabledElement(element).image,
                        element: element,
                        direction: scale < 0 ? 1 : -1
                    },
                    bubbles: false,
                    cancelable: false
                }
            );
        }
        else if(e.type === 'dragstart')
        {
            startPoints = {
                page: cornerstoneTools.point.pageToPoint(e),
                image: cornerstone.pageToImage(element, e.pageX, e.pageY)
            };
            lastPoints = cornerstoneTools.copyPoints(startPoints);
            return;
        }
        else if(e.type === 'drag')
        {
            // calculate our current points in page and image coordinates
            var currentPoints = {
                page: cornerstoneTools.point.pageToPoint(e),
                image: cornerstone.pageToImage(element, e.pageX, e.pageY)
            };

            // Calculate delta values in page and image coordinates
            var deltaPoints = {
                page: subtract(currentPoints.page, lastPoints.page),
                image: subtract(currentPoints.image, lastPoints.image)
            };

            event = new CustomEvent(
                "CornerstoneToolsTouchDrag",
                {
                    detail: {
                        event: e,
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
            lastPoints = $.extend({}, currentPoints);

        }
        else
        {
            return;
        }

        processingTouch = true;

        // we dispatch the event using a timer to allow the DOM to redraw
        setTimeout(function() {
            element.dispatchEvent(event);
            processingTouch = false;
        }, 1);
    }

    function enable(element)
    {
        var hammerOptions = {
            transform_always_block: true,
            transform_min_scale   : 0.01,
            drag_block_horizontal : true,
            drag_block_vertical   : true,
            drag_min_distance     : 0

        };
        $(element).hammer(hammerOptions).on("touch drag transform dragstart", onTouch);
    }

    function disable(element) {
        $(element).hammer().off("touch drag transform dragstart", onTouch);
    }

    // module exports
    cornerstoneTools.touchInput = {
        enable : enable,
        disable : disable
    };

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

    function copy(point)
    {
        return {
            x : point.x,
            y : point.y
        };
    }


    // module exports
    cornerstoneTools.point =
    {
        subtract : subtract,
        copy: copy,
        pageToPoint: pageToPoint
    };


    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function copyPoints(points)
    {
        var page = cornerstoneTools.point.copy(points.page);
        var image = cornerstoneTools.point.copy(points.image);
        return {
            page : page,
            image: image
        };
    }


    // module exports
    cornerstoneTools.copyPoints = copyPoints;


    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

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