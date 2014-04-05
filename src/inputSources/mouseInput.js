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