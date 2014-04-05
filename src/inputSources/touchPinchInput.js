var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    /*jshint newcap: false */

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function pageToPoint(e)
    {
        return {
            x : e.gesture.touches[0].pageX,
            y : e.gesture.touches[0].pageY
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

    var lastScale = 1.0;
    var processingPinch = false;

    function onPinchIn(e)
    {
        e.preventDefault();

        // we use a global flag to keep track of whether or not we are pinching
        // to avoid queueing up tons of events
        if(processingPinch === true)
        {
            lastScale = e.gesture.scale;
            return;
        }
        processingPinch = true;

        var element = e.currentTarget;

        var scale = lastScale - e.gesture.scale;
        lastScale = e.gesture.scale;
        var event = new CustomEvent(
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
        // we dispatch the event using a timer to allow the DOM to redraw
        setTimeout(function() {
            element.dispatchEvent(event);
            processingPinch = false;
        }, 1);
    }

    function enable(element)
    {
        var hammerOptions = {
            transform_always_block: true,
            transform_min_scale   : 0.01
        };
        $(element).hammer(hammerOptions).on("transform", onPinchIn);
        //$(element).hammer(hammerOptions).on("pinchout", onPinchOut);
    }

    function disable(element) {
        $(element).hammer().off("transform", onPinchin);
    }

    // module exports
    cornerstoneTools.touchPinchInput = {
        enable : enable,
        disable : disable
    };

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));