var cornerstoneTools = (function ($, cornerstone, cornerstoneMath, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
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

    ///////// BEGIN ACTIVE TOOL ///////
    function addPoint(eventData)
    {
        // create the measurement data for this tool with the end handle activated
        var toolData = cornerstoneTools.getToolState(eventData.element, toolType);
        if(toolData === undefined) {
            return;
        }

        var handleData = {
                    x : eventData.currentPoints.image.x,
                    y : eventData.currentPoints.image.y,
                    highlight: true,
                    active: true
                };

        toolData.data[toolData.data.length - 1].handles.push(handleData);
        cornerstone.updateImage(eventData.element);
    }

    function pointNearHandle(eventData) {

        var toolData = cornerstoneTools.getToolState(eventData.element, toolType);
        if(toolData === undefined) {
            return;
        }
        var data = toolData.data[toolData.data.length - 1];
        if (data.handles === undefined) {
            return;
        }

        var mousePoint = eventData.currentPoints.image;
        for (var i=0; i < data.handles.length; i++) {
            if (cornerstoneMath.point.distance(data.handles[i], mousePoint) < 5) {
                return true;
            }
        }
        return false;
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
        if(toolData === undefined) {
            return;
        }

        if (!toolData.data[toolData.data.length - 1].active){
            $(eventData.element).off("CornerstoneToolsMouseMove", mouseMoveCallback);
        }
        cornerstone.updateImage(eventData.element);
    }

    function mouseMoveCallback(e, eventData)
    {
        console.log('moving');

        // Check if near a corner (handle, even if invisible)
        // Make the handle show up, make it movable

        mouseLocation.handles.start.x = eventData.currentPoints.image.x;
        mouseLocation.handles.start.y = eventData.currentPoints.image.y;
        cornerstone.updateImage(eventData.element);
    }

    function startDrawing(eventData)
    {
        $(eventData.element).on("CornerstoneToolsMouseMove", mouseMoveCallback);
        $(eventData.element).on("CornerstoneToolsMouseUp", mouseUpCallback);

        var measurementData = {
            visible : true,
            active: true,
            handles: []
        };

        cornerstoneTools.addToolState(eventData.element, toolType, measurementData);

        cornerstone.updateImage(eventData.element);
    }

    function endDrawing(eventData)
    {
        var toolData = cornerstoneTools.getToolState(eventData.element, toolType);
        if(toolData === undefined) {
            return;
        }

        toolData.data[toolData.data.length - 1].active = false;
        toolData.data[toolData.data.length - 1].highlight = false;

        cornerstone.updateImage(eventData.element);
    }

    function mouseDownCallback(e, eventData)
    {
        if(cornerstoneTools.isMouseButtonEnabled(eventData.which, e.data.mouseButtonMask)) {
            var toolData = cornerstoneTools.getToolState(eventData.element, toolType);
            
            if (toolData === undefined || !toolData.data[toolData.data.length - 1].active) {
                startDrawing(eventData);
                addPoint(eventData);

            } else if (toolData.data[toolData.data.length - 1].active) {
                if (pointNearHandle(eventData)) {
                    endDrawing(eventData);
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
        if(toolData === undefined) {
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
            } else {
                color = cornerstoneTools.toolColors.getToolColor();
            }
            

            var handleStart,
                handleEnd;

            if (data.handles.length > 0) {
                for (var j=0; j < data.handles.length; j++) {

                    // Draw a line between handle j and j+1
                    handleStart = data.handles[j];
                    if (j === (data.handles.length - 1)) {
                        if (data.active) {
                            handleEnd = mouseLocation.handles.start;
                        } else {
                            handleEnd = data.handles[0];
                        }
                    } else {
                        handleEnd = data.handles[j+1];
                    }
                
                    context.beginPath();
                    context.strokeStyle = color;
                    context.lineWidth = toolWidth / eventData.viewport.scale;
                    context.moveTo(handleStart.x, handleStart.y);
                    context.lineTo(handleEnd.x, handleEnd.y);
                    context.stroke();
                }
            }
            
            // draw the handles
            if (data.active) {
                context.beginPath();
                cornerstoneTools.drawHandles(context, eventData, mouseLocation.handles, color, fillColor);
                cornerstoneTools.drawHandles(context, eventData, data.handles, color, fillColor);
                context.stroke();
            }
            context.restore();
        }

    }
    ///////// END IMAGE RENDERING ///////
    function enable(element, mouseButtonMask)
    {
        var eventData = {
            mouseButtonMask: mouseButtonMask,
        };

        $(element).off("CornerstoneToolsMouseDown", mouseDownCallback);
        $(element).off("CornerstoneImageRendered", onImageRendered);

        $(element).on("CornerstoneToolsMouseDown", eventData, mouseDownCallback);
        $(element).on("CornerstoneImageRendered", onImageRendered);
        cornerstone.updateImage(element);
    }

    // disables the reference line tool for the given element
    function disable(element)
    {
        $(element).off("CornerstoneToolsMouseDown", mouseDownCallback);
        $(element).off("CornerstoneImageRendered", onImageRendered);
        cornerstone.updateImage(element);
    }

    // module/private exports
    cornerstoneTools.freehand = {
        enable: enable,
        disable: disable

    };

    return cornerstoneTools;
}($, cornerstone, cornerstoneMath, cornerstoneTools));
