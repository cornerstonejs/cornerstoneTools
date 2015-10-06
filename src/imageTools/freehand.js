(function($, cornerstone, cornerstoneMath, cornerstoneTools) {

    'use strict';

    var toolType = 'freehand';
    var configuration = {
        mouseLocation: {
            handles: {
                start: {
                    highlight: true,
                    active: true,
                }
            }
        },
        freehand: false,
        modifying: false,
        currentHandle: 0,
        currentTool: -1
    };

    ///////// BEGIN ACTIVE TOOL ///////
    function addPoint(eventData) {
        var toolData = cornerstoneTools.getToolState(eventData.element, toolType);
        if (toolData === undefined) {
            return;
        }

        var config = cornerstoneTools.freehand.getConfiguration();

        // Get the toolData from the last-drawn drawing
        // (this should change when modification is added)
        var data = toolData.data[config.currentTool];

        var handleData = {
            x: eventData.currentPoints.image.x,
            y: eventData.currentPoints.image.y,
            highlight: true,
            active: true,
            lines: []
        };

        // If this is not the first handle
        if (data.handles.length){
            // Add the line from the current handle to the new handle
            data.handles[config.currentHandle - 1].lines.push(eventData.currentPoints.image);
        }

        // Add the new handle
        data.handles.push(handleData);

        // Increment the current handle value
        config.currentHandle += 1;

        // Reset freehand value
        config.freehand = false;

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

        var mousePoint = eventData.currentPoints.canvas;
        for (var i = 0; i < data.handles.length; i++) {
            var handleCanvas = cornerstone.pixelToCanvas(eventData.element, data.handles[i]);
            if (cornerstoneMath.point.distance(handleCanvas, mousePoint) < 5) {
                return i;
            }
        }

        return;
    }

    function pointNearHandleAllTools(eventData) {
        var toolData = cornerstoneTools.getToolState(eventData.element, toolType);
        if (toolData === undefined) {
            return;
        }

        var handleNearby;
        for (var toolIndex = 0; toolIndex < toolData.data.length; toolIndex++) {
            handleNearby = pointNearHandle(eventData, toolIndex);
            if (handleNearby !== undefined) {
                return {
                    handleNearby: handleNearby,
                    toolIndex: toolIndex
                };
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

    function mouseUpCallback(e, eventData) {
        $(eventData.element).off('CornerstoneToolsMouseUp', mouseUpCallback);

        // Check if drawing is finished
        var toolData = cornerstoneTools.getToolState(eventData.element, toolType);
        if (toolData === undefined) {
            return;
        }

        var config = cornerstoneTools.freehand.getConfiguration();

        if (!eventData.event.shiftKey) {
            config.freehand = false;
        }

        cornerstone.updateImage(eventData.element);
    }

    function mouseMoveCallback(e, eventData) {
        var toolData = cornerstoneTools.getToolState(eventData.element, toolType);
        if (toolData === undefined) {
            return;
        }

        var config = cornerstoneTools.freehand.getConfiguration();

        var data = toolData.data[config.currentTool];

        // Set the mouseLocation handle
        config.mouseLocation.handles.start.x = eventData.currentPoints.image.x;
        config.mouseLocation.handles.start.y = eventData.currentPoints.image.y;

        var currentHandle = config.currentHandle;

        if (config.modifying) {
            // Move the handle
            data.active = true;
            data.highlight = true;
            data.handles[currentHandle].x = config.mouseLocation.handles.start.x;
            data.handles[currentHandle].y = config.mouseLocation.handles.start.y;
            if (currentHandle) {
                var lastLineIndex = data.handles[currentHandle - 1].lines.length - 1;
                var lastLine = data.handles[currentHandle - 1].lines[lastLineIndex];
                lastLine.x = config.mouseLocation.handles.start.x;
                lastLine.y = config.mouseLocation.handles.start.y;
            }
        }

        if (config.freehand) {
            data.handles[currentHandle - 1].lines.push(eventData.currentPoints.image);
        } else {
            // No snapping in freehand mode
            var handleNearby = pointNearHandle(eventData, config.currentTool);

            // If there is a handle nearby to snap to
            // (and it's not the actual mouse handle)
            if (handleNearby !== undefined && handleNearby < (data.handles.length - 1)) {
                config.mouseLocation.handles.start.x = data.handles[handleNearby].x;
                config.mouseLocation.handles.start.y = data.handles[handleNearby].y;
            }
        }

        // Force onImageRendered
        cornerstone.updateImage(eventData.element);
    }

    function startDrawing(eventData) {
        $(eventData.element).on('CornerstoneToolsMouseMove', mouseMoveCallback);
        $(eventData.element).on('CornerstoneToolsMouseUp', mouseUpCallback);

        var measurementData = {
            visible: true,
            active: true,
            handles: [],
        };

        var config = cornerstoneTools.freehand.getConfiguration();
        config.mouseLocation.handles.start.x = eventData.currentPoints.image.x;
        config.mouseLocation.handles.start.y = eventData.currentPoints.image.y;

        cornerstoneTools.addToolState(eventData.element, toolType, measurementData);

        var toolData = cornerstoneTools.getToolState(eventData.element, toolType);
        config.currentTool = toolData.data.length - 1;
    }

    function endDrawing(eventData, handleNearby) {
        var toolData = cornerstoneTools.getToolState(eventData.element, toolType);
        if (toolData === undefined) {
            return;
        }

        var config = cornerstoneTools.freehand.getConfiguration();

        var data = toolData.data[config.currentTool];

        data.active = false;
        data.highlight = false;

        // Connect the end of the drawing to the handle nearest to the click
        if (handleNearby !== undefined){
            data.handles[config.currentHandle - 1].lines.push(data.handles[handleNearby]);
        }

        if (config.modifying) {
            config.modifying = false;
        }

        // Reset the current handle
        config.currentHandle = 0;
        config.currentTool = -1;

        $(eventData.element).off('CornerstoneToolsMouseMove', mouseMoveCallback);

        cornerstone.updateImage(eventData.element);
    }

    function mouseDownCallback(e, eventData) {
        if (cornerstoneTools.isMouseButtonEnabled(eventData.which, e.data.mouseButtonMask)) {
            var toolData = cornerstoneTools.getToolState(eventData.element, toolType);

            var handleNearby, toolIndex;

            var config = cornerstoneTools.freehand.getConfiguration();
            var currentTool = config.currentTool;

            if (config.modifying) {
                endDrawing(eventData);
                return;
            }

            if (currentTool < 0) {
                var nearby = pointNearHandleAllTools(eventData);
                if (nearby) {
                    handleNearby = nearby.handleNearby;
                    toolIndex = nearby.toolIndex;
                    // This means the user is trying to modify a point
                    if (handleNearby !== undefined) {
                        $(eventData.element).on('CornerstoneToolsMouseMove', mouseMoveCallback);
                        $(eventData.element).on('CornerstoneToolsMouseUp', mouseUpCallback);
                        config.modifying = true;
                        config.currentHandle = handleNearby;
                        config.currentTool = toolIndex;
                    }
                } else {
                    startDrawing(eventData);
                    addPoint(eventData);
                }
            } else if (currentTool >= 0 && toolData.data[currentTool].active) {
                handleNearby = pointNearHandle(eventData, currentTool);
                if (handleNearby !== undefined) {
                    endDrawing(eventData, handleNearby);
                } else if (eventData.event.shiftKey) {
                    config.freehand = true;
                } else {
                    addPoint(eventData);
                }
            }

            return false; // false = causes jquery to preventDefault() and stopPropagation() this event
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

        var config = cornerstoneTools.freehand.getConfiguration();

        // we have tool data for this element - iterate over each one and draw it
        var context = eventData.canvasContext.canvas.getContext('2d');
        context.setTransform(1, 0, 0, 1, 0, 0);

        var color;
        var lineWidth = cornerstoneTools.toolStyle.getToolWidth();
        var fillColor = cornerstoneTools.toolColors.getFillColor();

        for (var i = 0; i < toolData.data.length; i++) {
            context.save();

            var data = toolData.data[i];

            if (data.active) {
                color = cornerstoneTools.toolColors.getActiveColor();
                fillColor = cornerstoneTools.toolColors.getFillColor();
            } else {
                color = cornerstoneTools.toolColors.getToolColor();
                fillColor = cornerstoneTools.toolColors.getToolColor();
            }

            var handleStart;

            if (data.handles.length) {
                for (var j = 0; j < data.handles.length; j++) {
                    // Draw a line between handle j and j+1
                    handleStart = data.handles[j];
                    var handleStartCanvas = cornerstone.pixelToCanvas(eventData.element, handleStart);

                    context.beginPath();
                    context.strokeStyle = color;
                    context.lineWidth = lineWidth;
                    context.moveTo(handleStartCanvas.x, handleStartCanvas.y);

                    for (var k = 0; k < data.handles[j].lines.length; k++) {
                        var lineCanvas = cornerstone.pixelToCanvas(eventData.element, data.handles[j].lines[k]);
                        context.lineTo(lineCanvas.x, lineCanvas.y);
                        context.stroke();
                    }

                    var mouseLocationCanvas = cornerstone.pixelToCanvas(eventData.element, config.mouseLocation.handles.start);
                    if (j === (data.handles.length - 1)) {
                        if (data.active && !config.freehand && !config.modifying) {
                            // If it's still being actively drawn, keep the last line to 
                            // the mouse location
                            context.lineTo(mouseLocationCanvas.x, mouseLocationCanvas.y);
                            context.stroke();
                        }
                    }
                }
            }
            
            // If the tool is active, draw a handle at the cursor location
            if (data.active){
                cornerstoneTools.drawHandles(context, eventData, config.mouseLocation.handles, color, fillColor);
            }
            // draw the handles
            cornerstoneTools.drawHandles(context, eventData, data.handles, color, fillColor);

            context.restore();
        }
    }
    ///////// END IMAGE RENDERING ///////
    function enable(element) {
        $(element).off('CornerstoneToolsMouseDown', mouseDownCallback);
        $(element).off('CornerstoneToolsMouseUp', mouseUpCallback);
        $(element).off('CornerstoneToolsMouseMove', mouseMoveCallback);
        $(element).off('CornerstoneImageRendered', onImageRendered);

        $(element).on('CornerstoneImageRendered', onImageRendered);
        cornerstone.updateImage(element);
    }

    // disables the reference line tool for the given element
    function disable(element) {
        $(element).off('CornerstoneToolsMouseDown', mouseDownCallback);
        $(element).off('CornerstoneToolsMouseUp', mouseUpCallback);
        $(element).off('CornerstoneToolsMouseMove', mouseMoveCallback);
        $(element).off('CornerstoneImageRendered', onImageRendered);
        cornerstone.updateImage(element);
    }

    // visible and interactive
    function activate(element, mouseButtonMask) {
        var eventData = {
            mouseButtonMask: mouseButtonMask,
        };

        $(element).off('CornerstoneToolsMouseDown', eventData, mouseDownCallback);
        $(element).off('CornerstoneToolsMouseUp', mouseUpCallback);
        $(element).off('CornerstoneToolsMouseMove', mouseMoveCallback);
        $(element).off('CornerstoneImageRendered', onImageRendered);

        $(element).on('CornerstoneImageRendered', onImageRendered);
        $(element).on('CornerstoneToolsMouseDown', eventData, mouseDownCallback);

        cornerstone.updateImage(element);
    }

    // visible, but not interactive
    function deactivate(element) {
        $(element).off('CornerstoneToolsMouseDown', mouseDownCallback);
        $(element).off('CornerstoneToolsMouseUp', mouseUpCallback);
        $(element).off('CornerstoneToolsMouseMove', mouseMoveCallback);
        $(element).off('CornerstoneImageRendered', onImageRendered);

        $(element).on('CornerstoneImageRendered', onImageRendered);

        cornerstone.updateImage(element);
    }

    function getConfiguration() {
        return configuration;
    }

    function setConfiguration(config) {
        configuration = config;
    }

    // module/private exports
    cornerstoneTools.freehand = {
        enable: enable,
        disable: disable,
        activate: activate,
        deactivate: deactivate,
        getConfiguration: getConfiguration,
        setConfiguration: setConfiguration
    };

})($, cornerstone, cornerstoneMath, cornerstoneTools);
