var cornerstoneTools = (function ($, cornerstone, cornerstoneMath, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    var startPoint,
        endPoint;

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

    function applyWWWCRegion(eventData)
    {
        var width = Math.abs(startPoint.x - endPoint.x);
        var height = Math.abs(startPoint.y - endPoint.y);
        var left = Math.min(startPoint.x, endPoint.x);
        var top = Math.min(startPoint.y, endPoint.y);

        var pixels = cornerstone.getPixels(eventData.element, left, top, width, height);
        
        var minMax = calculateMinMax(pixels);

        var viewport = cornerstone.getViewport(eventData.element);
        viewport.voi.windowWidth = minMax.max - minMax.min;
        viewport.voi.windowCenter = (minMax.max - minMax.min) / 2;

        cornerstone.setViewport(eventData.element, viewport);
    }

    function mouseDownCallback(e, eventData)
    {
        if(cornerstoneTools.isMouseButtonEnabled(eventData.which, e.data.mouseButtonMask)) {
            $(eventData.element).on("CornerstoneToolsMouseDrag", dragCallback);
            $(eventData.element).on("CornerstoneToolsMouseUp", mouseUpCallback);
            recordStartPoint(eventData);
        }
    }

    function recordStartPoint(eventData)
    {
        startPoint = {
            x : eventData.currentPoints.image.x,
            y : eventData.currentPoints.image.y
        };
    }

    function dragCallback(e, eventData)
    {
        endPoint = {
            x : eventData.currentPoints.image.x,
            y : eventData.currentPoints.image.y
        };
        cornerstone.updateImage(eventData.element);

        var canvas = $(eventData.element).find("canvas").get(0);
        var context = canvas.getContext("2d");
        var enabledElement = cornerstone.getEnabledElement(eventData.element);
        cornerstone.setToPixelCoordinateSystem(enabledElement, context);
        var color = cornerstoneTools.toolColors.getActiveColor();
        
        context.save();

        var width = Math.abs(startPoint.x - endPoint.x);
        var height = Math.abs(startPoint.y - endPoint.y);
        var left = Math.min(startPoint.x, endPoint.x);
        var top = Math.min(startPoint.y, endPoint.y);

        context.beginPath();
        context.strokeStyle = color;
        context.lineWidth = 1 / eventData.viewport.scale;
        context.rect(left, top, width, height);
        context.stroke();

        context.restore();
    }

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
        disable: disable
    };

    cornerstoneTools.wwwcRegionTouch = {
        activate: activateTouchDrag,
        disable: disableTouchDrag
    };

    return cornerstoneTools;
}($, cornerstone, cornerstoneMath, cornerstoneTools));
