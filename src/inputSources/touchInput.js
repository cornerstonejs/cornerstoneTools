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