(function ($, cornerstone, cornerstoneMath, cornerstoneTools) {

    "use strict";

    function activateMouseDown(mouseEventDetail) {
        $(mouseEventDetail.element).trigger("CornerstoneToolsMouseDownActivate", mouseEventDetail);
    }

    function mouseDoubleClick(e) {
        var eventData = e.data;
        var element = e.currentTarget;

        var startPoints = {
            page: cornerstoneMath.point.pageToPoint(e),
            image: cornerstone.pageToPixel(element, e.pageX, e.pageY),
            client: {x: e.clientX, y: e.clientY}
        };
        startPoints.canvas = cornerstone.pixelToCanvas(element, startPoints.image);

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

        var event = jQuery.Event("CornerstoneToolsMouseDoubleClick", mouseEventDetail);
        $(mouseEventDetail.element).trigger(event, mouseEventDetail);
    }

    function mouseDown(e) {
        var eventData = e.data;
        var element = e.currentTarget;

        var startPoints = {
            page: cornerstoneMath.point.pageToPoint(e),
            image: cornerstone.pageToPixel(element, e.pageX, e.pageY),
            client: {x: e.clientX, y: e.clientY}
        };
        startPoints.canvas = cornerstone.pixelToCanvas(element, startPoints.image);

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

        var event = jQuery.Event("CornerstoneToolsMouseDown", mouseEventDetail);
        $(mouseEventDetail.element).trigger(event, mouseEventDetail);

        if (event.isImmediatePropagationStopped() === false) {
            // no tools responded to this event, give the active tool a chance
            if (activateMouseDown(mouseEventDetail) === true) {
                return cornerstoneTools.pauseEvent(e);
            }
        }

        var whichMouseButton = e.which;

        function onMouseMove(e) {
            // calculate our current points in page and image coordinates
            var currentPoints = {
                page: cornerstoneMath.point.pageToPoint(e),
                image: cornerstone.pageToPixel(element, e.pageX, e.pageY),
                client: {x: e.clientX, y: e.clientY}
            };
            currentPoints.canvas = cornerstone.pixelToCanvas(element, currentPoints.image);

            // Calculate delta values in page and image coordinates
            var deltaPoints = {
                page: cornerstoneMath.point.subtract(currentPoints.page, lastPoints.page),
                image: cornerstoneMath.point.subtract(currentPoints.image, lastPoints.image),
                client: cornerstoneMath.point.subtract(currentPoints.client, lastPoints.client),
                canvas: cornerstoneMath.point.subtract(currentPoints.canvas, lastPoints.canvas)
            };

            var eventData = {
                which: whichMouseButton,
                viewport: cornerstone.getViewport(element),
                image: cornerstone.getEnabledElement(element).image,
                element: element,
                startPoints: startPoints,
                lastPoints: lastPoints,
                currentPoints: currentPoints,
                deltaPoints: deltaPoints
             };

            //element.dispatchEvent(event);

            $(mouseEventDetail.element).trigger("CornerstoneToolsMouseDrag", eventData);


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
                page: cornerstoneMath.point.pageToPoint(e),
                image: cornerstone.pageToPixel(element, e.pageX, e.pageY),
                client: {x: e.clientX, y: e.clientY}
            };
            currentPoints.canvas = cornerstone.pixelToCanvas(element, currentPoints.image);

            // Calculate delta values in page and image coordinates
            var deltaPoints = {
                page: cornerstoneMath.point.subtract(currentPoints.page, lastPoints.page),
                image: cornerstoneMath.point.subtract(currentPoints.image, lastPoints.image),
                client: cornerstoneMath.point.subtract(currentPoints.client, lastPoints.client),
                canvas: cornerstoneMath.point.subtract(currentPoints.canvas, lastPoints.canvas)
            };

            var eventData = {
                event: e,
                which: whichMouseButton,
                viewport: cornerstone.getViewport(element),
                image: cornerstone.getEnabledElement(element).image,
                element: element,
                startPoints: startPoints,
                lastPoints: lastPoints,
                currentPoints: currentPoints,
                deltaPoints: deltaPoints
            };
            //element.dispatchEvent(event);

            var event = jQuery.Event("CornerstoneToolsMouseUp", eventData);
            $(mouseEventDetail.element).trigger(event, eventData);

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
            page: cornerstoneMath.point.pageToPoint(e),
            image: cornerstone.pageToPixel(element, e.pageX, e.pageY),
            client: {x: e.clientX, y: e.clientY}
        };
        startPoints.canvas = cornerstone.pixelToCanvas(element, startPoints.image);

        var lastPoints = cornerstoneTools.copyPoints(startPoints);

        var whichMouseButton = e.which;

        // calculate our current points in page and image coordinates
        var currentPoints = {
            page: cornerstoneMath.point.pageToPoint(e),
            image: cornerstone.pageToPixel(element, e.pageX, e.pageY),
            client: {x: e.clientX, y: e.clientY}
        };
        currentPoints.canvas = cornerstone.pixelToCanvas(element, currentPoints.image);

        // Calculate delta values in page and image coordinates
        var deltaPoints = {
            page: cornerstoneMath.point.subtract(currentPoints.page, lastPoints.page),
            image: cornerstoneMath.point.subtract(currentPoints.image, lastPoints.image),
            client: cornerstoneMath.point.subtract(currentPoints.client, lastPoints.client),
            canvas: cornerstoneMath.point.subtract(currentPoints.canvas, lastPoints.canvas)
        };

        var mouseMoveEventData = {
            which: whichMouseButton,
            viewport: cornerstone.getViewport(element),
            image: cornerstone.getEnabledElement(element).image,
            element: element,
            startPoints: startPoints,
            lastPoints: lastPoints,
            currentPoints: currentPoints,
            deltaPoints: deltaPoints
        };
        $(element).trigger("CornerstoneToolsMouseMove", mouseMoveEventData);

        // update the last points
        lastPoints = cornerstoneTools.copyPoints(currentPoints);
    }

    function enable(element)
    {
        $(element).on("mousedown", mouseDown);
        $(element).on("mousemove", mouseMove);
        $(element).on("dblclick", mouseDoubleClick);
    }

    function disable(element) {
        $(element).off("mousedown", mouseDown);
        $(element).off("mousemove", mouseMove);
        $(element).off("dblclick", mouseDoubleClick);
    }

    // module exports
    cornerstoneTools.mouseInput = {
        enable : enable,
        disable : disable
    };

})($, cornerstone, cornerstoneMath, cornerstoneTools);