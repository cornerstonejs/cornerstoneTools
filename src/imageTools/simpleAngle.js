var cornerstoneTools = (function ($, cornerstone, cornerstoneMath, cornerstoneTools) {

    "use strict";

    if (cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    var toolType = "simpleAngle";
    var configuration = {};

    ///////// BEGIN ACTIVE TOOL ///////
    function createNewMeasurement(mouseEventData) {
        // create the measurement data for this tool with the end handle activated
        var angleData = {
            visible: true,
            active: true,
            handles: {
                start: {
                    x: mouseEventData.currentPoints.image.x,
                    y: mouseEventData.currentPoints.image.y,
                    highlight: true,
                    active: false
                },
                middle: {
                    x: mouseEventData.currentPoints.image.x,
                    y: mouseEventData.currentPoints.image.y,
                    highlight: true,
                    active: true
                },
                end: {
                    x: mouseEventData.currentPoints.image.x,
                    y: mouseEventData.currentPoints.image.y,
                    highlight: true,
                    active: false
                }
            }
        };

        return angleData;
    }
    ///////// END ACTIVE TOOL ///////

    function pointNearTool(element, data, coords) {
        var lineSegment = {
            start: cornerstone.pixelToCanvas(element, data.handles.start),
            end: cornerstone.pixelToCanvas(element, data.handles.middle)
        };

        var distanceToPoint = cornerstoneMath.lineSegment.distanceToPoint(lineSegment, coords);
        if (distanceToPoint < 5)
            return true;

        lineSegment.start = cornerstone.pixelToCanvas(element, data.handles.middle);
        lineSegment.end = cornerstone.pixelToCanvas(element, data.handles.end);

        distanceToPoint = cornerstoneMath.lineSegment.distanceToPoint(lineSegment, coords);
        return (distanceToPoint < 5);
    }

    function length(vector) {
        return Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2));
    }

    ///////// BEGIN IMAGE RENDERING ///////
    function onImageRendered(e, eventData) {

        // if we have no toolData for this element, return immediately as there is nothing to do
        var toolData = cornerstoneTools.getToolState(e.currentTarget, toolType);
        if (toolData === undefined) {
            return;
        }

        // we have tool data for this element - iterate over each one and draw it
        var context = eventData.canvasContext.canvas.getContext("2d");
        context.setTransform(1, 0, 0, 1, 0, 0);
        
        //activation color 
        var color;
        var lineWidth = cornerstoneTools.toolStyle.getToolWidth();
        var font = cornerstoneTools.textStyle.getFont();

        for (var i = 0; i < toolData.data.length; i++) {
            context.save();

            var data = toolData.data[i];

            //differentiate the color of activation tool
            if (data.active) {
                color = cornerstoneTools.toolColors.getActiveColor();
            } else {
                color = cornerstoneTools.toolColors.getToolColor();
            }

            // draw the line
            context.beginPath();
            context.strokeStyle = color;
            context.lineWidth = lineWidth;

            var handleStartCanvas = cornerstone.pixelToCanvas(eventData.element, data.handles.start);
            var handleMiddleCanvas = cornerstone.pixelToCanvas(eventData.element, data.handles.middle);

            context.moveTo(handleStartCanvas.x, handleStartCanvas.y);
            context.lineTo(handleMiddleCanvas.x, handleMiddleCanvas.y);

            var handleEndCanvas = cornerstone.pixelToCanvas(eventData.element, data.handles.end);

            context.lineTo(handleEndCanvas.x, handleEndCanvas.y);
            context.stroke();

            // draw the handles
            cornerstoneTools.drawHandles(context, eventData, data.handles);

            // Draw the text
            context.fillStyle = color;

            // Default to isotropic pixel size, update suffix to reflect this
            var columnPixelSpacing = eventData.image.columnPixelSpacing || 1;
            var rowPixelSpacing = eventData.image.rowPixelSpacing || 1;
            var suffix = "";
            if (!eventData.image.rowPixelSpacing || !eventData.image.columnPixelSpacing) {
                suffix = " (isotropic)";
            }

            var sideA = {
                x: (Math.ceil(data.handles.middle.x) - Math.ceil(data.handles.start.x)) * columnPixelSpacing,
                y: (Math.ceil(data.handles.middle.y) - Math.ceil(data.handles.start.y)) * rowPixelSpacing
            };

            var sideB = {
                x: (Math.ceil(data.handles.end.x) - Math.ceil(data.handles.middle.x)) * columnPixelSpacing,
                y: (Math.ceil(data.handles.end.y) - Math.ceil(data.handles.middle.y)) * rowPixelSpacing
            };

            var sideC = {
                x: (Math.ceil(data.handles.end.x) - Math.ceil(data.handles.start.x)) * columnPixelSpacing,
                y: (Math.ceil(data.handles.end.y) - Math.ceil(data.handles.start.y)) * rowPixelSpacing
            };

            var sideALength = length(sideA);
            var sideBLength = length(sideB);
            var sideCLength = length(sideC);

            // Cosine law
            var angle = Math.acos((Math.pow(sideALength, 2) + Math.pow(sideBLength, 2) - Math.pow(sideCLength, 2)) / (2 * sideALength * sideBLength));
            angle = angle * (180 / Math.PI);

            var rAngle = cornerstoneTools.roundToDecimal(angle, 2);

            if (rAngle) {
                var str = "00B0"; // degrees symbol
                var text = rAngle.toString() + String.fromCharCode(parseInt(str, 16)) + suffix;
                
                var distance = 15;

                var textX = handleMiddleCanvas.x + distance;
                var textY = handleMiddleCanvas.y + distance;

                context.font = font;
                var textWidth = context.measureText(text).width;

                if ((handleMiddleCanvas.x - handleStartCanvas.x) < 0) {
                    textX = handleMiddleCanvas.x - distance - textWidth - 10;
                } else {
                    textX = handleMiddleCanvas.x + distance;
                }

                textY = handleMiddleCanvas.y;
                cornerstoneTools.drawTextBox(context, text, textX, textY, color);
            }

            context.restore();
        }

    }
    ///////// END IMAGE RENDERING ///////

    ///////// BEGIN ACTIVE TOOL ///////
    function addNewMeasurement(mouseEventData) {
        var measurementData = createNewMeasurement(mouseEventData);

        // associate this data with this imageId so we can render it and manipulate it
        cornerstoneTools.addToolState(mouseEventData.element, toolType, measurementData);
        
        function moveLastHandle(e, mouseEventData) {
            var handle = measurementData.handles.end;
            handle.x = mouseEventData.currentPoints.image.x;
            handle.y = mouseEventData.currentPoints.image.y;
            if (handle.x < 0) {
                handle.x = 0;
            }
            if (handle.x > mouseEventData.image.width) {
                handle.x = mouseEventData.image.width;
            }
            if (handle.y < 0) {
                handle.y = 0;
            }
            if (handle.y > mouseEventData.image.height) {
                handle.y = mouseEventData.image.height;
            }
            cornerstone.updateImage(mouseEventData.element);
        }

        function stopMovingLastHandle(mouseEventData) {
            var handle = measurementData.handles.end;
            handle.active = false;
            $(mouseEventData.element).off("CornerstoneToolsMouseMove", moveLastHandle);
            $(mouseEventData.element).off('CornerstoneToolsMouseUp', stopMovingLastHandle);
            $(mouseEventData.element).on('CornerstoneToolsMouseMove', mouseMoveCallback);
        }

        // since we are dragging to another place to drop the end point, we can just activate
        // the end point and let the moveHandle move it for us.
        $(mouseEventData.element).off('CornerstoneToolsMouseMove', mouseMoveCallback);
        cornerstoneTools.moveHandle(mouseEventData, measurementData.handles.middle, function() {
            measurementData.active = false;
            if (cornerstoneTools.anyHandlesOutsideImage(mouseEventData, measurementData.handles)) {
                // delete the measurement
                cornerstoneTools.removeToolState(mouseEventData.element, toolType, measurementData);
            }
            measurementData.handles.end.active = true;
            $(mouseEventData.element).on('CornerstoneToolsMouseMove', moveLastHandle);
            $(mouseEventData.element).on('CornerstoneToolsMouseUp', stopMovingLastHandle);
        });
    }

    function mouseDownActivateCallback(e, eventData) {
        if (cornerstoneTools.isMouseButtonEnabled(eventData.which, e.data.mouseButtonMask)) {
            addNewMeasurement(eventData);
            return false; // false = cases jquery to preventDefault() and stopPropagation() this event
        }
    }
    ///////// END ACTIVE TOOL ///////

    ///////// BEGIN DEACTIVE TOOL ///////

    function mouseMoveCallback(e, eventData) {
        cornerstoneTools.toolCoordinates.setCoords(eventData);
        // if a mouse button is down, do nothing
        if (eventData.which !== 0) {
            return;
        }
      
        // if we have no tool data for this element, do nothing
        var toolData = cornerstoneTools.getToolState(eventData.element, toolType);
        if (toolData === undefined) {
            return;
        }
        
        // We have tool data, search through all data
        // and see if we can activate a handle
        var imageNeedsUpdate = false;
        for (var i=0; i < toolData.data.length; i++) {
            // get the cursor position in canvas coordinates
            var coords = eventData.currentPoints.canvas;

            var data = toolData.data[i];
            if (cornerstoneTools.handleActivator(eventData.element, data.handles, coords) === true) {
                imageNeedsUpdate = true;
            }

            if ((pointNearTool(eventData.element, data, coords) && !data.active) ||
                (!pointNearTool(eventData.element, data, coords) && data.active)) {
                data.active = !data.active;
                imageNeedsUpdate = true;
            }
        }

        // Handle activation status changed, redraw the image
        if (imageNeedsUpdate === true) {
            cornerstone.updateImage(eventData.element);
        }
    }

    function mouseDownCallback(e, eventData) {
        var data;

        function handleDoneMove() {
            data.active = false;
            if (cornerstoneTools.anyHandlesOutsideImage(eventData, data.handles)) {
                // delete the measurement
                cornerstoneTools.removeToolState(eventData.element, toolType, data);
            }
            cornerstone.updateImage(eventData.element);
            $(eventData.element).on('CornerstoneToolsMouseMove', mouseMoveCallback);
        }

        if (cornerstoneTools.isMouseButtonEnabled(eventData.which, e.data.mouseButtonMask)) {
            var coords = eventData.startPoints.canvas;
            var toolData = cornerstoneTools.getToolState(e.currentTarget, toolType);

            var i;

            // now check to see if there is a handle we can move
            if (toolData !== undefined) {
                for (i=0; i < toolData.data.length; i++) {
                    data = toolData.data[i];
                    var handle = cornerstoneTools.getHandleNearImagePoint(eventData.element, data, coords);
                    if (handle !== undefined) {
                        $(eventData.element).off('CornerstoneToolsMouseMove', mouseMoveCallback);
                        data.active = true;
                        cornerstoneTools.moveHandle(eventData, handle, handleDoneMove);
                        e.stopImmediatePropagation();
                        return false;
                    }
                }
            }

            // Now check to see if there is a line we can move
            // now check to see if we have a tool that we can move
            if (toolData !== undefined && pointNearTool !== undefined) {
                for (i=0; i < toolData.data.length; i++) {
                    data = toolData.data[i];
                    if (pointNearTool(eventData.element, data, coords)) {
                        $(eventData.element).off('CornerstoneToolsMouseMove', mouseMoveCallback);
                        cornerstoneTools.moveAllHandles(e, data, toolData, true);
                        $(eventData.element).on('CornerstoneToolsMouseMove', mouseMoveCallback);
                        e.stopImmediatePropagation();
                        return false;
                    }
                }
            }
        }
    }
    ///////// END DEACTIVE TOOL ///////



    // not visible, not interactive
    function disable(element)
    {
        $(element).off("CornerstoneImageRendered", onImageRendered);
        $(element).off('CornerstoneToolsMouseMove', mouseMoveCallback);
        $(element).off('CornerstoneToolsMouseDown', mouseDownCallback);
        $(element).off('CornerstoneToolsMouseDownActivate', mouseDownActivateCallback);

        cornerstone.updateImage(element);
    }

    // visible but not interactive
    function enable(element)
    {
        $(element).off("CornerstoneImageRendered", onImageRendered);
        $(element).off('CornerstoneToolsMouseMove', mouseMoveCallback);
        $(element).off('CornerstoneToolsMouseDown', mouseDownCallback);
        $(element).off('CornerstoneToolsMouseDownActivate', mouseDownActivateCallback);

        $(element).on("CornerstoneImageRendered", onImageRendered);

        cornerstone.updateImage(element);
    }

    // visible, interactive and can create
    function activate(element, mouseButtonMask) {
        var eventData = {
            mouseButtonMask: mouseButtonMask,
        };

        $(element).off("CornerstoneImageRendered", onImageRendered);
        $(element).off("CornerstoneToolsMouseMove", mouseMoveCallback);
        $(element).off("CornerstoneToolsMouseDown", mouseDownCallback);
        $(element).off('CornerstoneToolsMouseDownActivate', mouseDownActivateCallback);

        $(element).on("CornerstoneImageRendered", onImageRendered);
        $(element).on("CornerstoneToolsMouseMove", eventData, mouseMoveCallback);
        $(element).on('CornerstoneToolsMouseDown', eventData, mouseDownCallback);
        $(element).on('CornerstoneToolsMouseDownActivate', eventData, mouseDownActivateCallback);

        cornerstone.updateImage(element);
    }

    // visible, interactive
    function deactivate(element, mouseButtonMask) {
        var eventData = {
            mouseButtonMask: mouseButtonMask,
        };

        $(element).off("CornerstoneImageRendered", onImageRendered);
        $(element).off("CornerstoneToolsMouseMove", mouseMoveCallback);
        $(element).off("CornerstoneToolsMouseDown", mouseDownCallback);
        $(element).off('CornerstoneToolsMouseDownActivate', mouseDownActivateCallback);

        $(element).on("CornerstoneImageRendered", onImageRendered);
        $(element).on("CornerstoneToolsMouseMove", eventData, mouseMoveCallback);
        $(element).on('CornerstoneToolsMouseDown', eventData, mouseDownCallback);

        cornerstone.updateImage(element);
    }

    function getConfiguration() {
        return configuration;
    }
    
    function setConfiguration(config) {
        configuration = config;
    }

    cornerstoneTools.simpleAngle = {
        enable: enable,
        disable : disable,
        activate: activate,
        deactivate: deactivate,
        getConfiguration: getConfiguration,
        setConfiguration: setConfiguration,
        pointNearTool: pointNearTool
    };

    return cornerstoneTools;
} ($, cornerstone, cornerstoneMath, cornerstoneTools));
