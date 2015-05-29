var cornerstoneTools = (function ($, cornerstone, cornerstoneMath, cornerstoneTools) {

    "use strict";

    if (cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    var toolType = "freehand";
    var mouseLocation = {
        handles : {
            start: {
                highlight: true,
                active: true,
            }
        }
    };

    var currentHandle = -1;
    var currentTool = 0;
    var freehand = true;
    var modifying = false;

    ///////// BEGIN ACTIVE TOOL ///////
    function addPoint(eventData)
    {
        var toolData = cornerstoneTools.getToolState(eventData.element, toolType);
        if (toolData === undefined) {
            return;
        }

        // Get the toolData from the last-drawn drawing
        // (this should change when modification is added)
        var data = toolData.data[currentTool];

        var handleData = {
                    x : eventData.currentPoints.image.x,
                    y : eventData.currentPoints.image.y,
                    highlight: true,
                    active: true,
                    lines: []
                };

        // If this is not the first handle
        if (data.handles.length !== 0){
            // Add the line from the current handle to the new handle
            data.handles[currentHandle].lines.push(eventData.currentPoints.image);
        }

        // Add the new handle
        data.handles.push(handleData);

        // Increment the current handle value
        currentHandle += 1;

        // Reset freehand value
        freehand = false;

        // Force onImageRendered to fire
        cornerstone.updateImage(eventData.element);
    }

    function pointNearHandle(eventData, toolIndex) {

        var toolData = cornerstoneTools.getToolState(eventData.element, toolType);
        if (toolData === undefined) {
            return;
        }
        var data = toolData.data[toolIndex];
        if (data.handles === undefined) {
            return;
        }

        var mousePoint = eventData.currentPoints.image;
        for (var i=0; i < data.handles.length; i++) {
            if (cornerstoneMath.point.distance(data.handles[i], mousePoint) < 5) {
                return i;
            }
        }
        return -1;
    }

    function pointNearHandleAllTools(eventData) {
        var toolData = cornerstoneTools.getToolState(eventData.element, toolType);
        if (toolData === undefined) {
            return;
        }

        var handleNearby;

        for (var toolIndex=0; toolIndex < toolData.data.length; toolIndex++) {
            handleNearby = pointNearHandle(eventData, toolIndex);
            if (handleNearby > -1) {
                return [handleNearby, toolIndex];
            }
        }
        return; // Maybe this should return false?
    }

    // --- Drawing loop ---
    // On first click, add point
    // After first click, on mouse move, record location
    // If mouse comes close to previous point, snap to it
    // On next click, add another point -- continuously
    // On each click, if it intersects with a current point, end drawing loop

    function mouseUpCallback(e, eventData)
    {
        $(eventData.element).off("CornerstoneToolsMouseUp", mouseUpCallback);

        // Check if drawing is finished
        var toolData = cornerstoneTools.getToolState(eventData.element, toolType);
        if (toolData === undefined) {
            return;
        }

        if (!eventData.event.shiftKey) {
            freehand = false;
        }

        cornerstone.updateImage(eventData.element);
    }

    function mouseMoveCallback(e, eventData)
    {
        // Check if near a corner (handle, even if invisible)
        // Make the handle show up, make it movable

        // Freehand drawing

        var toolData = cornerstoneTools.getToolState(eventData.element, toolType);
        if (toolData === undefined) {
            return;
        }

        var data = toolData.data[currentTool];

        // Set the mouseLocation handle
        mouseLocation.handles.start.x = eventData.currentPoints.image.x;
        mouseLocation.handles.start.y = eventData.currentPoints.image.y;

        if (modifying) {
            // Move the handle
            data.active = true;
            data.highlight = true;
            data.handles[currentHandle].x = mouseLocation.handles.start.x;
            data.handles[currentHandle].y = mouseLocation.handles.start.y;
            if (currentHandle !== 0) {
                var lastLineIndex = data.handles[currentHandle - 1].lines.length - 1;
                var lastLine = data.handles[currentHandle - 1].lines[lastLineIndex];
                lastLine.x = mouseLocation.handles.start.x;
                lastLine.y = mouseLocation.handles.start.y;
            }
        }


        if (freehand) {
            data.handles[currentHandle].lines.push(eventData.currentPoints.image);
        }

        var handleNearby = pointNearHandle(eventData, currentTool);

        // If there is a handle nearby to snap to
        // (and it's not the actual mouse handle)
        if (handleNearby > -1 && handleNearby < (data.handles.length - 1)) {
            mouseLocation.handles.start.x = data.handles[handleNearby].x;
            mouseLocation.handles.start.y = data.handles[handleNearby].y;
        }

        // Force onImageRendered
        cornerstone.updateImage(eventData.element);
    }

    function startDrawing(eventData)
    {
        $(eventData.element).on("CornerstoneToolsMouseMove", mouseMoveCallback);
        $(eventData.element).on("CornerstoneToolsMouseUp", mouseUpCallback);

        var measurementData = {
            visible : true,
            active: true,
            handles: [],
        };

        mouseLocation.handles.start.x = eventData.currentPoints.image.x;
        mouseLocation.handles.start.y = eventData.currentPoints.image.y;

        cornerstoneTools.addToolState(eventData.element, toolType, measurementData);

        var toolData = cornerstoneTools.getToolState(eventData.element, toolType);
        currentTool = toolData.data.length - 1;
    }

    function endDrawing(eventData, handleNearby)
    {
        var toolData = cornerstoneTools.getToolState(eventData.element, toolType);
        if (toolData === undefined) {
            return;
        }
        var data = toolData.data[currentTool];

        data.active = false;
        data.highlight = false;

        // Connect the end of the drawing to the handle nearest to the click
        if (handleNearby !== undefined){
            data.handles[currentHandle].lines.push(data.handles[handleNearby]);
        }

        if (modifying) {
            modifying = false;
        }

        // Reset the current handle
        currentHandle = -1;
        currentTool = -1;

        $(eventData.element).off("CornerstoneToolsMouseMove", mouseMoveCallback);

        cornerstone.updateImage(eventData.element);
    }

    function mouseDownCallback(e, eventData)
    {
        if (cornerstoneTools.isMouseButtonEnabled(eventData.which, e.data.mouseButtonMask)) {
            var toolData = cornerstoneTools.getToolState(eventData.element, toolType);

            var handleNearby,
                toolIndex;

            if (currentTool >= 0) {
                handleNearby = pointNearHandle(eventData, currentTool);
            }

            if (toolData === undefined) {
                currentTool = 0;
            }

            if (modifying) {
                endDrawing(eventData);
                return;
            }

            if (toolData === undefined || currentTool < 0) {
                var nearby = pointNearHandleAllTools(eventData);
                    if (nearby !== undefined) {
                        handleNearby = nearby[0];
                        toolIndex = nearby[1];
                        // This means the user is trying to modify a point
                        if (currentHandle < 0 && handleNearby >= 0) {
                            $(eventData.element).on("CornerstoneToolsMouseMove", mouseMoveCallback);
                            $(eventData.element).on("CornerstoneToolsMouseUp", mouseUpCallback);
                            modifying = true;
                            currentHandle = handleNearby;
                            currentTool = toolIndex;
                        }

                    } else {
                        startDrawing(eventData);
                        addPoint(eventData);
                    }
            } else if (toolData.data[currentTool].active) {
                if (handleNearby > -1) {
                    endDrawing(eventData, handleNearby);
                } else if (eventData.event.shiftKey) {
                    freehand = true;
                } else {
                    addPoint(eventData);
                }
            }
            return false; // false = cases jquery to preventDefault() and stopPropagation() this event
        }
    }

    ///////// END ACTIVE TOOL ///////

    ///////// BEGIN IMAGE RENDERING ///////
    function onImageRendered(e, eventData) {

        // if we have no toolData for this element, return immediately as there is nothing to do
        var toolData = cornerstoneTools.getToolState(e.currentTarget, toolType);
        if (toolData === undefined) {
            return;
        }

        // we have tool data for this element - iterate over each one and draw it
        var context = eventData.canvasContext.canvas.getContext("2d");
        cornerstone.setToPixelCoordinateSystem(eventData.enabledElement, context);
        var color;

        var toolWidth = cornerstoneTools.toolStyle.getToolWidth();

        var fillColor = cornerstoneTools.toolColors.getFillColor();

        for(var i=0; i < toolData.data.length; i++) {
            context.save();
            var data = toolData.data[i];


            if (data.active) {
                color = cornerstoneTools.toolColors.getActiveColor();
                fillColor = cornerstoneTools.toolColors.getFillColor();
            } else {
                color = cornerstoneTools.toolColors.getToolColor();
                fillColor = cornerstoneTools.toolColors.getToolColor();
            }

            var handleStart,
                handleEnd;

            if (data.handles.length > 0) {
                for (var j=0; j < data.handles.length; j++) {

                    // Draw a line between handle j and j+1
                    handleStart = data.handles[j];

                    context.beginPath();
                    context.strokeStyle = color;
                    context.lineWidth = toolWidth / eventData.viewport.scale;
                    context.moveTo(handleStart.x, handleStart.y);

                    for (var k=0; k < data.handles[j].lines.length; k++) {
                        var line = data.handles[j].lines[k];
                        context.lineTo(line.x, line.y);
                        context.stroke();
                    }

                    if (j === (data.handles.length - 1)) {
                        if (data.active && !freehand && !modifying) {
                            // If it's still being actively drawn, keep the last line to 
                            // the mouse location
                            context.lineTo(mouseLocation.handles.start.x, mouseLocation.handles.start.y);
                            context.stroke();
                        }
                    }
                }
            }
            
            // draw the handles
            context.beginPath();
            if (data.active){
                cornerstoneTools.drawHandles(context, eventData, mouseLocation.handles, color, fillColor);
            }
            cornerstoneTools.drawHandles(context, eventData, data.handles, color, fillColor);
            context.stroke();
            context.restore();
        }

    }
    ///////// END IMAGE RENDERING ///////
    function enable(element)
    {
        $(element).off("CornerstoneToolsMouseDown", mouseDownCallback);
        $(element).off("CornerstoneToolsMouseUp", mouseUpCallback);
        $(element).off("CornerstoneToolsMouseMove", mouseMoveCallback);
        $(element).off("CornerstoneImageRendered", onImageRendered);

        $(element).on("CornerstoneImageRendered", onImageRendered);
        cornerstone.updateImage(element);
    }

    // disables the reference line tool for the given element
    function disable(element)
    {
        $(element).off("CornerstoneToolsMouseDown", mouseDownCallback);
        $(element).off("CornerstoneToolsMouseUp", mouseUpCallback);
        $(element).off("CornerstoneToolsMouseMove", mouseMoveCallback);
        $(element).off("CornerstoneImageRendered", onImageRendered);
        cornerstone.updateImage(element);
    }

    // visible and interactive
    function activate(element, mouseButtonMask) {
        var eventData = {
            mouseButtonMask: mouseButtonMask,
        };

        $(element).off("CornerstoneToolsMouseDown", mouseDownCallback);
        $(element).off("CornerstoneToolsMouseUp", mouseUpCallback);
        $(element).off("CornerstoneToolsMouseMove", mouseMoveCallback);
        $(element).off("CornerstoneImageRendered", onImageRendered);

        $(element).on("CornerstoneImageRendered", onImageRendered);
        $(element).on('CornerstoneToolsMouseDown', eventData, mouseDownCallback);

        cornerstone.updateImage(element);
    }

    // visible, but not interactive
    function deactivate(element, mouseButtonMask) {
        var eventData = {
            mouseButtonMask: mouseButtonMask,
        };

        $(element).off("CornerstoneToolsMouseDown", mouseDownCallback);
        $(element).off("CornerstoneToolsMouseUp", mouseUpCallback);
        $(element).off("CornerstoneToolsMouseMove", mouseMoveCallback);
        $(element).off("CornerstoneImageRendered", onImageRendered);

        $(element).on("CornerstoneImageRendered", mouseToolInterface.onImageRendered);

        cornerstone.updateImage(element);
    }

    // module/private exports
    cornerstoneTools.freehand = {
        enable: enable,
        disable: disable,
        activate: activate,
        deactivate: deactivate
    };

    return cornerstoneTools;
}($, cornerstone, cornerstoneMath, cornerstoneTools));
