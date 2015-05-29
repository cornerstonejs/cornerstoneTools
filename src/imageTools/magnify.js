var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    var toolType = "magnify";

    /** Remove the magnifying glass when the mouse event ends */
    function mouseUpCallback(e, eventData)
    {
        $(eventData.element).off("CornerstoneToolsMouseDrag", dragCallback);
        $(eventData.element).off("CornerstoneToolsMouseUp", mouseUpCallback);
        hideTool(eventData);
    }

    function hideTool(eventData)
    {
        $(eventData.element).find(".magnifyTool").hide();
        // Re-enable the mouse cursor
        document.body.style.cursor = "default";
    }

    /** Draw the magnifying glass on mouseDown, and begin tracking mouse movements */
    function mouseDownCallback(e, eventData)
    {
        if(cornerstoneTools.isMouseButtonEnabled(eventData.which, e.data.mouseButtonMask)) {
            $(eventData.element).on("CornerstoneToolsMouseDrag", eventData, dragCallback);
            $(eventData.element).on("CornerstoneToolsMouseUp", eventData, mouseUpCallback);
            drawMagnificationTool(eventData);
            return false; // false = causes jquery to preventDefault() and stopPropagation() this event
        }
    }

    /** Drag callback is triggers by both the touch and mouse magnify tools */
    function dragCallback(e, eventData)
    {
        drawMagnificationTool(eventData);
        return false; // false = causes jquery to preventDefault() and stopPropagation() this event
    }

    /** Draws the magnifying glass */
    function drawMagnificationTool(eventData)
    {
        var toolData = cornerstoneTools.getToolState(eventData.element, toolType);
        if (toolData === undefined) {
            return;
        }

        var magnify = $(eventData.element).find(".magnifyTool").get(0);

        if (magnify === undefined) {
            createMagnificationCanvas(element);
        }

        var magnifySize = toolData.data[0].magnifySize;
        var magnificationLevel = toolData.data[0].magnificationLevel;

        var canvas = $(eventData.element).find("canvas").get(0);
        var zoomCtx = magnify.getContext("2d");

        // Calculate the on-canvas location of the mouse pointer / touch
        var rect = canvas.getBoundingClientRect();
        var canvasLocation = {
            x: eventData.currentPoints.client.x - rect.left,
            y: eventData.currentPoints.client.y - rect.top
        };

        // Clear the rectangle
        zoomCtx.clearRect(0,0, magnify.width, magnify.height);
        zoomCtx.fillStyle = "transparent";

        // Fill it with the pixels that the mouse is clicking on
        zoomCtx.fillRect(0,0, magnify.width, magnify.height);
        zoomCtx.drawImage(canvas, canvasLocation.x - magnifySize / 4, canvasLocation.y - magnifySize / 4, magnifySize, magnifySize, 0, 0, magnifySize * magnificationLevel, magnifySize * magnificationLevel);

        // Place the magnification tool at the same location as the pointer
        magnify.style.top = canvasLocation.y - magnifySize / 2 + "px";
        magnify.style.left = canvasLocation.x - magnifySize / 2 + "px";
        magnify.style.display = "block";

        // Hide the mouse cursor, so the user can see better
        document.body.style.cursor = "none";
    }

    /** Creates the magnifying glass canvas */
    function createMagnificationCanvas(element)
    {
        // If the magnifying glass canvas doesn't already exist
        if ($(element).find(".magnifyTool").length === 0)
        {
            // Create a canvas and append it as a child to the element
            var magnify = document.createElement('canvas');
            // The magnifyTool class is used to find the canvas later on
            magnify.classList.add("magnifyTool");

            var toolData = cornerstoneTools.getToolState(element, toolType);
            if (toolData === undefined) {
                return;
            }

            magnify.width = toolData.data[0].magnifySize;
            magnify.height = toolData.data[0].magnifySize;

            // Make sure position is absolute so the canvas can follow the mouse / touch
            magnify.style.position = "absolute";
            element.appendChild(magnify);
        }
    }

    /** Find the magnifying glass canvas and remove it */
    function removeMagnificationCanvas(element)
    {
        $(element).find(".magnifyTool").remove();
    }

    // --- Mouse tool activate / disable --- //
    function disable(element)
    {
        $(element).off('CornerstoneToolsMouseDown', mouseDownCallback);
        removeMagnificationCanvas(element);
    }

    function enable(element, magnifySize, magnificationLevel)
    {
        var toolData = cornerstoneTools.getToolState(element, toolType);
        if (toolData === undefined) {
            if (magnifySize === undefined){
                magnifySize = 100;
            }

            if (magnificationLevel === undefined){
                magnificationLevel = 2;
            }

            var data = {
                magnifySize: magnifySize,
                magnificationLevel: magnificationLevel,
            };
            cornerstoneTools.addToolState(element, toolType, data);
        }
        createMagnificationCanvas(element);
    }

    function activate(element, mouseButtonMask)
    {
        var eventData = {
            mouseButtonMask: mouseButtonMask,
        };

        $(element).off('CornerstoneToolsMouseDown', mouseDownCallback);

        $(element).on('CornerstoneToolsMouseDown', eventData, mouseDownCallback);
        createMagnificationCanvas(element);
    }

    // --- Touch tool activate / disable --- //
    function disableTouchDrag(element)
    {
        $(element).off('CornerstoneToolsTouchDrag', dragCallback);
        $(element).off('CornerstoneToolsDragStart', dragCallback);
        removeMagnificationCanvas(element);
    }

    function activateTouchDrag(element)
    {
        $(element).off('CornerstoneToolsTouchDrag', dragCallback);
        $(element).off('CornerstoneToolsDragStart', dragCallback);

        $(element).on('CornerstoneToolsTouchDrag', dragCallback);
        $(element).on('CornerstoneToolsDragStart', dragCallback);
        createMagnificationCanvas(element);
    }

    // module exports
    cornerstoneTools.magnify = {
        enable: enable,
        activate: activate,
        deactivate: disable,
        disable : disable,
    };

    cornerstoneTools.magnifyTouchDrag = {
        enable: enable,
        activate: activateTouchDrag,
        deactivate: disableTouchDrag,
        disable: disableTouchDrag
    };

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));
