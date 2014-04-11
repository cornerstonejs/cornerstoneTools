var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function activateMouseDown(mouseEventDetail)
    {
        var event = new CustomEvent(
            "CornerstoneToolsMouseDownActivate",
            {
                detail: mouseEventDetail,
                bubbles: false,
                cancelable: true
            }
        );
        mouseEventDetail.element.dispatchEvent(event);
    }


    function mouseDown(e) {
        var eventData = e.data;
        var element = e.currentTarget;

        var startPoints = {
            page: cornerstoneTools.point.pageToPoint(e),
            image: cornerstone.pageToPixel(element, e.pageX, e.pageY)
        };
        var lastPoints = cornerstoneTools.copyPoints(startPoints);
        var mouseEventDetail = {
                event: e,
                which: e.which,
                viewport: cornerstone.getViewport(element),
                image: cornerstone.getEnabledElement(element).image,
                element: element,
                startPoints: startPoints,
                lastPoints: lastPoints,
                currentPoints: startPoints,
                deltaPoints: {x: 0, y:0}
            };

        var event = new CustomEvent(
            "CornerstoneToolsMouseDown",
            {
                detail: mouseEventDetail,
                bubbles: false,
                cancelable: true
            }
        );
        if(element.dispatchEvent(event) === true)
        {
            // no tools responded to this event, give the active tool a chance
            if(activateMouseDown(mouseEventDetail) === true)
            {
                return cornerstoneTools.pauseEvent(e);
            }
        }

        var whichMouseButton = e.which;

        function onMouseMove(e) {

            // calculate our current points in page and image coordinates
            var currentPoints = {
                page: cornerstoneTools.point.pageToPoint(e),
                image: cornerstone.pageToPixel(element, e.pageX, e.pageY)
            };

            // Calculate delta values in page and image coordinates
            var deltaPoints = {
                page: cornerstoneTools.point.subtract(currentPoints.page, lastPoints.page),
                image: cornerstoneTools.point.subtract(currentPoints.image, lastPoints.image)
            };

            var event = new CustomEvent(
                "CornerstoneToolsMouseDrag",
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
                    cancelable: true
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
                image: cornerstone.pageToPixel(element, e.pageX, e.pageY)
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

            $(document).off('mousemove', onMouseMove);
            $(document).off('mouseup', onMouseUp);
        }

        $(document).on("mousemove", onMouseMove);
        $(document).on("mouseup", onMouseUp);


        return cornerstoneTools.pauseEvent(e);
    }

    function mouseMove(e) {
        var eventData = e.data;
        var element = e.currentTarget;

        var startPoints = {
            page: cornerstoneTools.point.pageToPoint(e),
            image: cornerstone.pageToPixel(element, e.pageX, e.pageY)
        };
        var lastPoints = cornerstoneTools.copyPoints(startPoints);

        var whichMouseButton = e.which;


        // calculate our current points in page and image coordinates
        var currentPoints = {
            page: cornerstoneTools.point.pageToPoint(e),
            image: cornerstone.pageToPixel(element, e.pageX, e.pageY)
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
        //return cornerstoneTools.pauseEvent(e);
    }

    function enable(element)
    {
        $(element).on("mousedown", mouseDown);
        $(element).on("mousemove", mouseMove);
    }

    function disable(element) {
        $(element).off("mousedown", mouseDown);
        $(element).off("mousemove", mouseMove);
    }

    // module exports
    cornerstoneTools.mouseInput = {
        enable : enable,
        disable : disable
    };

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));