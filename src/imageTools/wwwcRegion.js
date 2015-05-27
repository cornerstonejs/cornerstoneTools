var cornerstoneTools = (function ($, cornerstone, cornerstoneMath, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    var startPoint,
        endPoint;

    /** Calculates the minimum and maximum value in the given pixel array */
    function calculateMinMax(storedPixelData)
    {
        var min = 65535;
        var max = -32768;
        var numPixels = storedPixelData.length;
        var pixelData = storedPixelData;
        for(var index = 0; index < numPixels; index++) {
            var spv = pixelData[index];
            min = Math.min(min, spv);
            max = Math.max(max, spv);
        }

        return {
            min: min,
            max: max
        };
    }

    /** Applies the windowing procedure when the mouse drag ends */
    function mouseUpCallback(e, eventData)
    {
        $(eventData.element).off("CornerstoneToolsMouseDrag", dragCallback);
        $(eventData.element).off("CornerstoneToolsMouseUp", mouseUpCallback);
        
        endPoint = {
            x : eventData.currentPoints.image.x,
            y : eventData.currentPoints.image.y
        };

        applyWWWCRegion(eventData);
    }

    /** Calculates the minimum and maximum value in the given pixel array */
    function applyWWWCRegion(eventData)
    {
        // Get the rectangular region defined by the handles
        var width = Math.abs(startPoint.x - endPoint.x);
        var height = Math.abs(startPoint.y - endPoint.y);
        var left = Math.min(startPoint.x, endPoint.x);
        var top = Math.min(startPoint.y, endPoint.y);

        // Get the pixel data in the rectangular region
        var pixels = cornerstone.getPixels(eventData.element, left, top, width, height);

        // Calculate the minimum and maximum pixel values
        var minMax = calculateMinMax(pixels);

        // Adjust the viewport window width and center based on the calculated values
        var viewport = cornerstone.getViewport(eventData.element);
        viewport.voi.windowWidth = minMax.max - minMax.min;
        viewport.voi.windowCenter = (minMax.max - minMax.min) / 2;
        cornerstone.setViewport(eventData.element, viewport);
    }

    /** Records the start point and attaches the drag event handler */
    function mouseDownCallback(e, eventData)
    {
        if(cornerstoneTools.isMouseButtonEnabled(eventData.which, e.data.mouseButtonMask)) {
            $(eventData.element).on("CornerstoneToolsMouseDrag", dragCallback);
            $(eventData.element).on("CornerstoneToolsMouseUp", mouseUpCallback);
            recordStartPoint(eventData);
        }
    }

    /** Records the start point of the click or touch */
    function recordStartPoint(eventData)
    {
        startPoint = {
            x : eventData.currentPoints.image.x,
            y : eventData.currentPoints.image.y
        };
    }

    /** Draws the rectangular region while the touch or mouse event drag occurs */
    function dragCallback(e, eventData)
    {
        // Update the endpoint as the mouse/touch is dragged
        endPoint = {
            x : eventData.currentPoints.image.x,
            y : eventData.currentPoints.image.y
        };

        // Clear the image so the rectangle can be redrawn
        cornerstone.updateImage(eventData.element);

        // Get the current element's canvas
        var canvas = $(eventData.element).find("canvas").get(0);
        var context = canvas.getContext("2d");
        var enabledElement = cornerstone.getEnabledElement(eventData.element);
        cornerstone.setToPixelCoordinateSystem(enabledElement, context);

        // Set to the active tool color
        var color = cornerstoneTools.toolColors.getActiveColor();
        
        // Calculate the rectangle parameters
        var width = Math.abs(startPoint.x - endPoint.x);
        var height = Math.abs(startPoint.y - endPoint.y);
        var left = Math.min(startPoint.x, endPoint.x);
        var top = Math.min(startPoint.y, endPoint.y);

        context.save();

        // Draw the rectangle
        context.beginPath();
        context.strokeStyle = color;
        context.lineWidth = 1 / eventData.viewport.scale;
        context.rect(left, top, width, height);
        context.stroke();

        context.restore();
    }

    // --- Mouse tool enable / disable --- ///
    function disable(element)
    {
        $(element).off('CornerstoneToolsMouseDown', mouseDownCallback);

        cornerstone.updateImage(element);
    }

    function activate(element, mouseButtonMask) {
        var eventData = {
            mouseButtonMask: mouseButtonMask,
        };

        $(element).off("CornerstoneToolsMouseDown", mouseDownCallback);

        $(element).on('CornerstoneToolsMouseDown', eventData, mouseDownCallback);
        cornerstone.updateImage(element);
    }

    // --- Touch tool enable / disable --- //
    function disableTouchDrag(element)
    {
        $(element).off('CornerstoneToolsTouchDrag', dragCallback);
        $(element).off('CornerstoneToolsDragStart', recordStartPoint);
        $(element).off('CornerstoneToolsDragEnd', applyWWWCRegion);
    }

    function activateTouchDrag(element) {
        $(element).off('CornerstoneToolsTouchDrag', dragCallback);
        $(element).off('CornerstoneToolsDragStart', recordStartPoint);
        $(element).off('CornerstoneToolsDragEnd', applyWWWCRegion);

        $(element).on('CornerstoneToolsTouchDrag', dragCallback);
        $(element).on('CornerstoneToolsDragStart', recordStartPoint);
        $(element).on('CornerstoneToolsDragEnd', applyWWWCRegion);
    }

    // module exports
    cornerstoneTools.wwwcRegion = {
        activate: activate,
        deactivate: disable,
        disable: disable
    };

    cornerstoneTools.wwwcRegionTouch = {
        activate: activateTouchDrag,
        deactivate: disableTouchDrag,
        disable: disableTouchDrag
    };

    return cornerstoneTools;
}($, cornerstone, cornerstoneMath, cornerstoneTools));
