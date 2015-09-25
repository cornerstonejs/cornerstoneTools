(function($, cornerstone, cornerstoneTools) {

    'use strict';

    // --- Strategies --- //
    function defaultStrategy(eventData) {
        // Calculate distance from the center of the image
        var rect = eventData.element.getBoundingClientRect(eventData.element);

        var points = {
            x: eventData.currentPoints.client.x, y: eventData.currentPoints.client.y
        };

        var width = eventData.element.clientWidth;
        var height = eventData.element.clientHeight;

        var pointsFromCenter = {
            x: points.x - rect.left - width / 2,
            // Invert the coordinate system so that up is positive
            y: -1 * (points.y - rect.top - height / 2)
        };

        var rotationRadians = Math.atan2(pointsFromCenter.y, pointsFromCenter.x);
        var rotationDegrees = rotationRadians * (180 / Math.PI);
        var rotation = -1 * rotationDegrees + 90;
        eventData.viewport.rotation = rotation;
        cornerstone.setViewport(eventData.element, eventData.viewport);
    }

    function horizontalStrategy(eventData) {
        eventData.viewport.rotation += (eventData.deltaPoints.page.x / eventData.viewport.scale);
        cornerstone.setViewport(eventData.element, eventData.viewport);
    }

    function verticalStrategy(eventData) {
        eventData.viewport.rotation += (eventData.deltaPoints.page.y / eventData.viewport.scale);
        cornerstone.setViewport(eventData.element, eventData.viewport);
    }

    // --- Mouse event callbacks --- //
    function mouseUpCallback(e, eventData) {
        $(eventData.element).off('CornerstoneToolsMouseDrag', dragCallback);
        $(eventData.element).off('CornerstoneToolsMouseUp', mouseUpCallback);
    }

    function mouseDownCallback(e, eventData) {
        if (cornerstoneTools.isMouseButtonEnabled(eventData.which, e.data.mouseButtonMask)) {
            $(eventData.element).on('CornerstoneToolsMouseDrag', dragCallback);
            $(eventData.element).on('CornerstoneToolsMouseUp', mouseUpCallback);
            return false; // false = causes jquery to preventDefault() and stopPropagation() this event
        }
    }

    function dragCallback(e, eventData) {
        cornerstoneTools.rotate.strategy(eventData);
        cornerstone.setViewport(eventData.element, eventData.viewport);
        return false; // false = causes jquery to preventDefault() and stopPropagation() this event
    }

    cornerstoneTools.rotate = cornerstoneTools.simpleMouseButtonTool(mouseDownCallback);
    cornerstoneTools.rotate.strategies = {
        default: defaultStrategy,
        horizontal: horizontalStrategy,
        vertical: verticalStrategy
    };
    
    cornerstoneTools.rotate.strategy = defaultStrategy;

    cornerstoneTools.rotateTouchDrag = cornerstoneTools.touchDragTool(dragCallback);

})($, cornerstone, cornerstoneTools);
