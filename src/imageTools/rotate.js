var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    // --- Strategies --- //
    function defaultStrategy(eventData) {
        // Calculate distance from the center of the image
        var pointsFromCenter = {
            x: eventData.lastPoints.image.x - eventData.image.columns / 2,
            // Invert the coordinate system so that up is positive
            y: -1 * (eventData.lastPoints.image.y - eventData.image.rows / 2)
        };
        var rotationRadians = Math.atan2(pointsFromCenter.y, pointsFromCenter.x);
        var rotationDegrees = rotationRadians * (180 / Math.PI);
        var rotation = -1 * rotationDegrees  + 90;
        eventData.viewport.rotation = rotation;
    }

    function horizontalStrategy(eventData) {
        eventData.viewport.rotation += (eventData.deltaPoints.page.x / eventData.viewport.scale);
    }

    function verticalStrategy(eventData) {
        eventData.viewport.rotation += (eventData.deltaPoints.page.y / eventData.viewport.scale);
    }

    // --- Mouse event callbacks --- //
    function mouseUpCallback(e, eventData) {
        $(eventData.element).off("CornerstoneToolsMouseDrag", mouseDragCallback);
        $(eventData.element).off("CornerstoneToolsMouseUp", mouseUpCallback);
    }

    function mouseDownCallback(e, eventData) {
        if(cornerstoneTools.isMouseButtonEnabled(eventData.which, e.data.mouseButtonMask)) {
            $(eventData.element).on("CornerstoneToolsMouseDrag", mouseDragCallback);
            $(eventData.element).on("CornerstoneToolsMouseUp", mouseUpCallback);
            return false; // false = causes jquery to preventDefault() and stopPropagation() this event
        }
    }

    function mouseDragCallback(e, eventData) {
        cornerstoneTools.rotate.strategy(eventData);
        cornerstone.setViewport(eventData.element, eventData.viewport);
        e.stopPropagation();
        return false; // false = causes jquery to preventDefault() and stopPropagation() this event
    }

    function onDrag(e, eventData) {
        cornerstoneTools.rotate.strategy(eventData);
        cornerstone.setViewport(eventData.element, eventData.viewport);
        return false; // false = causes jquery to preventDefault() and stopPropagation() this event
    }

    cornerstoneTools.rotate = cornerstoneTools.simpleMouseButtonTool(mouseDownCallback);
    cornerstoneTools.rotate.strategies = {
        default : defaultStrategy,
        horizontal : horizontalStrategy,
        vertical : verticalStrategy
    };
    cornerstoneTools.rotate.strategy = defaultStrategy;

    cornerstoneTools.rotateTouchDrag = cornerstoneTools.touchDragTool(onDrag);

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));
