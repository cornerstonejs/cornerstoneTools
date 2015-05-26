var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    var magnificationCanvasId = "magnify";

    function mouseUpCallback(e, eventData)
    {
        $(eventData.element).off("CornerstoneToolsMouseDrag", dragCallback);
        $(eventData.element).off("CornerstoneToolsMouseUp", mouseUpCallback);

        var magnify = document.getElementById(magnificationCanvasId);
        magnify.style.display = "none";
    }

    function drawMagnificationBox(eventData)
    {
        var main = $(eventData.element).find("canvas").get(0);
        var magnify = document.getElementById(magnificationCanvasId);
        var zoomCtx = magnify.getContext("2d");

        var canvasLocation = {
            x: eventData.currentPoints.image.x * eventData.viewport.scale,
            y: eventData.currentPoints.image.y * eventData.viewport.scale
        };

        zoomCtx.clearRect(0,0, magnify.width, magnify.height);
        zoomCtx.fillStyle = "transparent";

        zoomCtx.fillRect(0,0, magnify.width, magnify.height);
        zoomCtx.drawImage(main, canvasLocation.x - 25, canvasLocation.y - 25, 100, 100, 0, 0, 200, 200);

        magnify.style.top = canvasLocation.y - 45 + "px";
        magnify.style.left = canvasLocation.x - 45 + "px";
        magnify.style.display = "block";
    }

    function mouseDownCallback(e, eventData)
    {
        if(cornerstoneTools.isMouseButtonEnabled(eventData.which, e.data.mouseButtonMask)) {
            $(eventData.element).on("CornerstoneToolsMouseDrag", dragCallback);
            $(eventData.element).on("CornerstoneToolsMouseUp", mouseUpCallback);
            drawMagnificationBox(eventData);
            return false; // false = causes jquery to preventDefault() and stopPropagation() this event
        }
    }

    function dragCallback(e, eventData)
    {
        drawMagnificationBox(eventData);
        return false; // false = causes jquery to preventDefault() and stopPropagation() this event
    }

    function createMagnificationCanvas()
    {
        var magnify = document.createElement('canvas');
        magnify.id = magnificationCanvasId;
        magnify.width = 100;
        magnify.height = 100;
        magnify.style.position = "absolute";
        element.appendChild(magnify); // adds the canvas to #someBox
    }

    function removeMagnificationCanvas()
    {
        var canvas = document.getElementById(magnificationCanvasId);
        canvas.remove();
    }

    // not visible, not interactive
    function disable(element)
    {
        $(element).off('CornerstoneToolsMouseDown', mouseDownCallback);

        removeMagnificationCanvas();
    }

    // visible but not interactive
    function activate(element, mouseButtonMask) {
        var eventData = {
            mouseButtonMask: mouseButtonMask,
        };
        $(element).off('CornerstoneToolsMouseDown', mouseDownCallback);

        $(element).on('CornerstoneToolsMouseDown', eventData, mouseDownCallback);
        createMagnificationCanvas();
    }

    function disableTouchDrag(element)
    {
        $(element).off('CornerstoneToolsTouchDrag', dragCallback);
        $(element).off('CornerstoneToolsDragStart', dragCallback);

        removeMagnificationCanvas();
    }

    // visible but not interactive
    function activateTouchDrag(element) {
        $(element).off('CornerstoneToolsTouchDrag', dragCallback);
        $(element).off('CornerstoneToolsDragStart', dragCallback);

        $(element).on('CornerstoneToolsTouchDrag', dragCallback);
        $(element).on('CornerstoneToolsDragStart', dragCallback);
        createMagnificationCanvas();
    }

    // module exports
    cornerstoneTools.magnify = {
        activate: activate,
        disable : disable,
    };

    cornerstoneTools.magnifyTouchDrag = {
        activate: activateTouchDrag,
        disable: disableTouchDrag
    };

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));
