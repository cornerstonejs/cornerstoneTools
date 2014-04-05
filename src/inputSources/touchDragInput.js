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

    function onDragStart(e)
    {
        var element = e.currentTarget;

        var startPoints = {
            page: pageToPoint(e),
            image: cornerstone.pageToImage(element, e.pageX, e.pageY)
        };
        var lastPoints = copyPoints(startPoints);

        var processingDrag = false;


        function onDrag(e) {
            e.gesture.preventDefault();
            e.gesture.stopPropagation();
            if(e.type !== 'drag')
            {
                return;
            }

            // we use a global flag to keep track of whether or not we are pinching
            // to avoid queueing up tons of events
            if(processingDrag === true)
            {
                cornerstoneTools.pauseEvent(e);
                return;
            }
            processingDrag = true;

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

            // we dispatch the event using a timer to allow the DOM to redraw
            setTimeout(function() {
                element.dispatchEvent(event);
                processingDrag = false;
                // update the last points
                lastPoints = $.extend({}, currentPoints);
            }, 1);

            // prevent left click selection of DOM elements
            cornerstoneTools.pauseEvent(e);
        }

        function onDragEnd(e) {
            $(element).hammer().off("dragstart", onDrag);
            $(element).hammer().off("dragend", onDragEnd);
        }

        $(element).hammer().on("drag", onDrag);
        $(element).hammer().on("dragend", onDragEnd);
    }

    function enable(element)
    {
        $(element).hammer().on("dragstart", onDragStart);
    }

    function disable(element) {
        $(element).hammer().off("swipeleft", onDragStart);
    }

    // module exports
    cornerstoneTools.touchDragInput = {
        enable : enable,
        disable : disable
    };

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));