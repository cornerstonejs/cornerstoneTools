(function($, cornerstone, cornerstoneMath, cornerstoneTools) {

    'use strict';

    var isClickEvent;
    var preventClickTimeout;
    var clickDelay = 200;

    function preventClickHandler() {
        isClickEvent = false;
    }

    function activateMouseDown(mouseEventDetail) {
        $(mouseEventDetail.element).trigger('CornerstoneToolsMouseDownActivate', mouseEventDetail);
    }

    function mouseDoubleClick(e) {
        var element = e.currentTarget;
        var eventType = 'CornerstoneToolsMouseDoubleClick';

        var startPoints = {
            page: cornerstoneMath.point.pageToPoint(e),
            image: cornerstone.pageToPixel(element, e.pageX, e.pageY),
            client: {
                x: e.clientX,
                y: e.clientY
            }
        };
        startPoints.canvas = cornerstone.pixelToCanvas(element, startPoints.image);

        var lastPoints = cornerstoneTools.copyPoints(startPoints);
        var eventData = {
            event: e,
            which: e.which,
            viewport: cornerstone.getViewport(element),
            image: cornerstone.getEnabledElement(element).image,
            element: element,
            startPoints: startPoints,
            lastPoints: lastPoints,
            currentPoints: startPoints,
            deltaPoints: {
                x: 0,
                y: 0
            },
            type: eventType
        };

        var event = $.Event(eventType, eventData);
        $(eventData.element).trigger(event, eventData);
    }

    function mouseDown(e) {
        preventClickTimeout = setTimeout(preventClickHandler, clickDelay);

        var element = e.currentTarget;
        var eventType = 'CornerstoneToolsMouseDown';

        // Prevent CornerstoneToolsMouseMove while mouse is down
        $(element).off('mousemove', mouseMove);

        var startPoints = {
            page: cornerstoneMath.point.pageToPoint(e),
            image: cornerstone.pageToPixel(element, e.pageX, e.pageY),
            client: {
                x: e.clientX,
                y: e.clientY
            }
        };
        startPoints.canvas = cornerstone.pixelToCanvas(element, startPoints.image);

        var lastPoints = cornerstoneTools.copyPoints(startPoints);
        var eventData = {
            event: e,
            which: e.which,
            viewport: cornerstone.getViewport(element),
            image: cornerstone.getEnabledElement(element).image,
            element: element,
            startPoints: startPoints,
            lastPoints: lastPoints,
            currentPoints: startPoints,
            deltaPoints: {
                x: 0,
                y: 0
            },
            type: eventType
        };

        var event = $.Event(eventType, eventData);
        $(eventData.element).trigger(event, eventData);

        if (event.isImmediatePropagationStopped() === false) {
            // no tools responded to this event, give the active tool a chance
            if (activateMouseDown(eventData) === true) {
                return cornerstoneTools.pauseEvent(e);
            }
        }

        var whichMouseButton = e.which;

        function onMouseMove(e) {
            // calculate our current points in page and image coordinates
            var eventType = 'CornerstoneToolsMouseDrag';
            var currentPoints = {
                page: cornerstoneMath.point.pageToPoint(e),
                image: cornerstone.pageToPixel(element, e.pageX, e.pageY),
                client: {
                    x: e.clientX,
                    y: e.clientY
                }
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
                deltaPoints: deltaPoints,
                type: eventType
            };

            $(eventData.element).trigger(eventType, eventData);

            // update the last points
            lastPoints = cornerstoneTools.copyPoints(currentPoints);

            // prevent left click selection of DOM elements
            return cornerstoneTools.pauseEvent(e);
        }

        // hook mouseup so we can unbind our event listeners
        // when they stop dragging
        function onMouseUp(e) {
            // Cancel the timeout preventing the click event from triggering
            clearTimeout(preventClickTimeout);

            var eventType = 'CornerstoneToolsMouseUp';
            if (isClickEvent) {
                eventType = 'CornerstoneToolsMouseClick';
            }

            // calculate our current points in page and image coordinates
            var currentPoints = {
                page: cornerstoneMath.point.pageToPoint(e),
                image: cornerstone.pageToPixel(element, e.pageX, e.pageY),
                client: {
                    x: e.clientX,
                    y: e.clientY
                }
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
                deltaPoints: deltaPoints,
                type: eventType
            };

            var event = $.Event(eventType, eventData);
            $(eventData.element).trigger(event, eventData);

            $(document).off('mousemove', onMouseMove);
            $(document).off('mouseup', onMouseUp);

            $(eventData.element).on('mousemove', mouseMove);

            isClickEvent = true;
        }

        $(document).on('mousemove', onMouseMove);
        $(document).on('mouseup', onMouseUp);

        return cornerstoneTools.pauseEvent(e);
    }

    function mouseMove(e) {
        var element = e.currentTarget;
        var eventType = 'CornerstoneToolsMouseMove';

        var startPoints = {
            page: cornerstoneMath.point.pageToPoint(e),
            image: cornerstone.pageToPixel(element, e.pageX, e.pageY),
            client: {
                x: e.clientX,
                y: e.clientY
            }
        };
        startPoints.canvas = cornerstone.pixelToCanvas(element, startPoints.image);

        var lastPoints = cornerstoneTools.copyPoints(startPoints);

        var whichMouseButton = e.which;

        // calculate our current points in page and image coordinates
        var currentPoints = {
            page: cornerstoneMath.point.pageToPoint(e),
            image: cornerstone.pageToPixel(element, e.pageX, e.pageY),
            client: {
                x: e.clientX,
                y: e.clientY
            }
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
            deltaPoints: deltaPoints,
            type: eventType
        };
        $(element).trigger(eventType, eventData);

        // update the last points
        lastPoints = cornerstoneTools.copyPoints(currentPoints);
    }

    function disable(element) {
        $(element).off('mousedown', mouseDown);
        $(element).off('mousemove', mouseMove);
        $(element).off('dblclick', mouseDoubleClick);
    }

    function enable(element) {
        // Prevent handlers from being attached multiple times
        disable(element);
        
        $(element).on('mousedown', mouseDown);
        $(element).on('mousemove', mouseMove);
        $(element).on('dblclick', mouseDoubleClick);
    }

    // module exports
    cornerstoneTools.mouseInput = {
        enable: enable,
        disable: disable
    };

})($, cornerstone, cornerstoneMath, cornerstoneTools);
