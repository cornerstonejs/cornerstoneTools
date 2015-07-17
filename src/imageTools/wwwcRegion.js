var cornerstoneTools = (function ($, cornerstone, cornerstoneMath, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    var toolType = 'wwwcRegion';

    /** Calculates the minimum and maximum value in the given pixel array */
    function calculateMinMax(storedPixelData, globalMin, globalMax) {
        var numPixels = storedPixelData.length;

        if (numPixels < 2) {
            return {
                min: globalMin,
                max: globalMax,
            };
        }
        
        var min = globalMax;
        var max = globalMin;

        for (var index = 0; index < numPixels; index++) {
            var spv = storedPixelData[index];
            min = Math.min(min, spv);
            max = Math.max(max, spv);
        }

        return {
            min: min,
            max: max
        };
    }

    /** Applies the windowing procedure when the mouse drag ends */
    function mouseUpCallback(e, eventData) {
        $(eventData.element).off("CornerstoneToolsMouseDrag", dragCallback);
        $(eventData.element).off("CornerstoneToolsMouseUp", mouseUpCallback);
        
        var toolData = cornerstoneTools.getToolState(eventData.element, toolType);
        if (toolData === undefined) {
            return;
        }

        if (!toolData.data.length) {
            return;
        }

        // Update the endpoint as the mouse/touch is dragged
        var endPoint = {
            x : eventData.currentPoints.image.x,
            y : eventData.currentPoints.image.y
        };

        toolData.data[0].endPoint = endPoint;

        applyWWWCRegion(eventData);

        $(eventData.element).on("CornerstoneToolsMouseDown", eventData, mouseDownCallback);
    }

    /** Calculates the minimum and maximum value in the given pixel array */
    function applyWWWCRegion(eventData) {
        var toolData = cornerstoneTools.getToolState(eventData.element, toolType);
        if (toolData === undefined) {
            return;
        }

        if (!toolData.data.length) {
            return;
        }

        var startPoint = toolData.data[0].startPoint;
        var endPoint = toolData.data[0].endPoint;

        // Get the rectangular region defined by the handles
        var width = Math.abs(startPoint.x - endPoint.x);
        var height = Math.abs(startPoint.y - endPoint.y);

        var left = Math.min(startPoint.x, endPoint.x);
        var top = Math.min(startPoint.y, endPoint.y);

        // Bound the rectangle so we don't get undefined pixels
        left = Math.max(left, 0);
        left = Math.min(left, eventData.image.width);
        top = Math.max(top, 0);
        top = Math.min(top, eventData.image.height);
        width = Math.min(width, Math.abs(eventData.image.width - left));
        height = Math.min(height, Math.abs(eventData.image.height - top));

        // Get the pixel data in the rectangular region
        var pixels = cornerstone.getPixels(eventData.element, left, top, width, height);

        // Calculate the minimum and maximum pixel values
        var minMax = calculateMinMax(pixels, eventData.image.minPixelValue, eventData.image.maxPixelValue);

        // Adjust the viewport window width and center based on the calculated values
        var viewport = cornerstone.getViewport(eventData.element);
        viewport.voi.windowWidth = Math.abs(minMax.max - minMax.min);
        viewport.voi.windowCenter = (minMax.max - minMax.min) / 2;
        cornerstone.setViewport(eventData.element, viewport);

        // Clear the toolData
        toolData.data = [];

        cornerstone.updateImage(eventData.element);
    }

    /** Records the start point and attaches the drag event handler */
    function mouseDownCallback(e, eventData) {
        if(cornerstoneTools.isMouseButtonEnabled(eventData.which, e.data.mouseButtonMask)) {
            $(eventData.element).on("CornerstoneToolsMouseDrag", dragCallback);
            $(eventData.element).on("CornerstoneToolsMouseUp", mouseUpCallback);
            recordStartPoint(eventData);
            return false;
        }
    }

    /** Records the start point of the click or touch */
    function recordStartPoint(eventData) {
        var toolData = cornerstoneTools.getToolState(eventData.element, toolType);
        if (toolData && toolData.data) {
            toolData.data = [];
        }

        var measurementData = {
            startPoint: {
                x : eventData.currentPoints.image.x,
                y : eventData.currentPoints.image.y
            }
        };

        cornerstoneTools.addToolState(eventData.element, toolType, measurementData);
    }

    /** Draws the rectangular region while the touch or mouse event drag occurs */
    function dragCallback(e, eventData) {
        // if we have no toolData for this element, return immediately as there is nothing to do
        var toolData = cornerstoneTools.getToolState(eventData.element, toolType);
        if (toolData === undefined) {
            return;
        }

        if (!toolData.data.length) {
            return;
        }

        // Update the endpoint as the mouse/touch is dragged
        var endPoint = {
            x : eventData.currentPoints.image.x,
            y : eventData.currentPoints.image.y
        };

        toolData.data[0].endPoint = endPoint;
        cornerstone.updateImage(eventData.element);
    }

    function onImageRendered(e, eventData) {
        var toolData = cornerstoneTools.getToolState(eventData.element, toolType);
        if (toolData === undefined) {
            return;
        }

        if (!toolData.data.length) {
            return;
        }

        var startPoint = toolData.data[0].startPoint;
        var endPoint = toolData.data[0].endPoint;

        if (!startPoint) {
            return;
        }

        // Get the current element's canvas
        var canvas = $(eventData.element).find("canvas").get(0);
        var context = canvas.getContext("2d");
        context.setTransform(1, 0, 0, 1, 0, 0);

        // Set to the active tool color
        var color = cornerstoneTools.toolColors.getActiveColor();
        
        // Calculate the rectangle parameters
        var startPointCanvas = cornerstone.pixelToCanvas(eventData.element, startPoint);
        var endPointCanvas = cornerstone.pixelToCanvas(eventData.element, endPoint);

        var left = Math.min(startPointCanvas.x, endPointCanvas.x);
        var top = Math.min(startPointCanvas.y, endPointCanvas.y);
        var width = Math.abs(startPointCanvas.x - endPointCanvas.x);
        var height = Math.abs(startPointCanvas.y - endPointCanvas.y);

        var lineWidth = cornerstoneTools.toolStyle.getToolWidth();

        // Draw the rectangle
        context.save();

        context.beginPath();
        context.strokeStyle = color;
        context.lineWidth = lineWidth;
        context.rect(left, top, width, height);
        context.stroke();

        context.restore();
    }

    // --- Mouse tool enable / disable --- ///
    function disable(element) {
        $(element).off('CornerstoneToolsMouseDown', mouseDownCallback);
        $(element).off('CornerstoneImageRendered', onImageRendered);

        cornerstone.updateImage(element);
    }

    function activate(element, mouseButtonMask) {
        var eventData = {
            mouseButtonMask: mouseButtonMask,
        };

        var toolData = cornerstoneTools.getToolState(element, toolType);
        if (toolData === undefined) {
            var data = [];
            cornerstoneTools.addToolState(element, toolType, data);
        }

        $(element).off("CornerstoneToolsMouseDown", mouseDownCallback);
        $(element).off("CornerstoneToolsMouseUp", mouseUpCallback);
        $(element).off("CornerstoneToolsMouseDrag", dragCallback);
        $(element).off('CornerstoneImageRendered', onImageRendered);

        $(element).on('CornerstoneToolsMouseDown', eventData, mouseDownCallback);
        $(element).on("CornerstoneToolsMouseUp", mouseUpCallback);
        $(element).on("CornerstoneToolsMouseDrag", dragCallback);
        $(element).on('CornerstoneImageRendered', onImageRendered);
        cornerstone.updateImage(element);
    }

    // --- Touch tool enable / disable --- //
    function disableTouchDrag(element) {
        $(element).off('CornerstoneToolsTouchDrag', dragCallback);
        $(element).off('CornerstoneToolsDragStart', recordStartPoint);
        $(element).off('CornerstoneToolsDragEnd', applyWWWCRegion);
        $(element).off('CornerstoneImageRendered', onImageRendered);
    }

    function activateTouchDrag(element) {
        var toolData = cornerstoneTools.getToolState(element, toolType);
        if (toolData === undefined) {
            var data = [];
            cornerstoneTools.addToolState(element, toolType, data);
        }

        $(element).off('CornerstoneToolsTouchDrag', dragCallback);
        $(element).off('CornerstoneToolsDragStart', recordStartPoint);
        $(element).off('CornerstoneToolsDragEnd', applyWWWCRegion);
        $(element).off('CornerstoneImageRendered', onImageRendered);

        $(element).on('CornerstoneToolsTouchDrag', dragCallback);
        $(element).on('CornerstoneToolsDragStart', recordStartPoint);
        $(element).on('CornerstoneToolsDragEnd', applyWWWCRegion);
        $(element).on('CornerstoneImageRendered', onImageRendered);
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