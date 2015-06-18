var cornerstoneTools = (function ($, cornerstone, cornerstoneMath, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    var toolType = "arrowAnnotate";
    var configuration = {};

    /// --- Mouse Tool --- ///

    ///////// BEGIN ACTIVE TOOL ///////
    function addNewMeasurement(mouseEventData) {

        var annotationText;
        function doneChangingTextCallback(annotationText) {
            if (annotationText !== null) {
                measurementData.annotationText = annotationText;
            } else {
                cornerstoneTools.removeToolState(mouseEventData.element, toolType, measurementData);
            }
            cornerstone.updateImage(mouseEventData.element);
        }

        var measurementData = createNewMeasurement(mouseEventData);

        // associate this data with this imageId so we can render it and manipulate it
        cornerstoneTools.addToolState(mouseEventData.element, toolType, measurementData);
       

        // since we are dragging to another place to drop the end point, we can just activate
        // the end point and let the moveHandle move it for us.
        $(mouseEventData.element).off('CornerstoneToolsMouseMove', mouseMoveCallback);
        cornerstoneTools.moveHandle(mouseEventData, measurementData.handles.end, function() {
            measurementData.active = false;
            if(cornerstoneTools.anyHandlesOutsideImage(mouseEventData, measurementData.handles))
            {
                // delete the measurement
                cornerstoneTools.removeToolState(mouseEventData.element, toolType, measurementData);
            }

            var config = cornerstoneTools.arrowAnnotate.getConfiguration();
            if (measurementData.annotationText === undefined) {
                config.getTextCallback(doneChangingTextCallback);
            }
            
            $(mouseEventData.element).on('CornerstoneToolsMouseMove', mouseMoveCallback);
        });
    }

    function mouseDownActivateCallback(e, eventData) {
        if (cornerstoneTools.isMouseButtonEnabled(eventData.which, e.data.mouseButtonMask)) {
            addNewMeasurement(eventData);
            return false; // false = causes jquery to preventDefault() and stopPropagation() this event
        }
    }
    ///////// END ACTIVE TOOL ///////

    ///////// BEGIN DEACTIVE TOOL ///////

    function mouseMoveCallback(e, eventData)
    {
        cornerstoneTools.toolCoordinates.setCoords(eventData);
        // if a mouse button is down, do nothing
        if(eventData.which !== 0) {
            return;
        }
      
        
        // if we have no tool data for this element, do nothing
        var toolData = cornerstoneTools.getToolState(eventData.element, toolType);
        if(toolData === undefined) {
            return;
        }
        
        // We have tool data, search through all data
        // and see if we can activate a handle
        var imageNeedsUpdate = false;
        for(var i=0; i < toolData.data.length; i++) {
            // get the cursor position in image coordinates
            var data = toolData.data[i];
            if(cornerstoneTools.handleActivator(data.handles, eventData.currentPoints.image, eventData.viewport.scale ) === true) {
                imageNeedsUpdate = true;
            }

            if ((pointNearTool(data, eventData.currentPoints.image) && !data.active) ||
                (!pointNearTool(data, eventData.currentPoints.image) && data.active)) {
                data.active = !data.active;
                imageNeedsUpdate = true;
            }
        }

        // Handle activation status changed, redraw the image
        if(imageNeedsUpdate === true) {
            cornerstone.updateImage(eventData.element);
        }
        return false;
    }

    function getHandleNearImagePoint(data, coords)
    {
        for(var handle in data.handles) {
            var distanceSquared = cornerstoneMath.point.distanceSquared(data.handles[handle], coords);
            if(distanceSquared < 25)
            {
                return data.handles[handle];
            }
        }
    }

    function mouseDownCallback(e, eventData) {
        var data;

        function handleDoneMove()
        {
            data.active = false;
            if(cornerstoneTools.anyHandlesOutsideImage(eventData, data.handles))
            {
                // delete the measurement
                cornerstoneTools.removeToolState(eventData.element, toolType, data);
            }
            cornerstone.updateImage(eventData.element);
            $(eventData.element).on('CornerstoneToolsMouseMove', mouseMoveCallback);
        }

        if(cornerstoneTools.isMouseButtonEnabled(eventData.which, e.data.mouseButtonMask)) {
            var coords = eventData.startPoints.image;
            var toolData = cornerstoneTools.getToolState(e.currentTarget, toolType);

            var i;

            // now check to see if there is a handle we can move
            if(toolData !== undefined) {
                for(i=0; i < toolData.data.length; i++) {
                    data = toolData.data[i];
                    var handle = getHandleNearImagePoint(data, coords);
                    if(handle !== undefined) {
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
            if(toolData !== undefined && pointNearTool !== undefined) {
                for(i=0; i < toolData.data.length; i++) {
                    data = toolData.data[i];
                    if(pointNearTool(data, coords)) {
                        $(eventData.element).off('CornerstoneToolsMouseMove', mouseMoveCallback);
                        cornerstoneTools.moveAllHandles(e, data, toolData, true);
                        $(eventData.element).on('CornerstoneToolsMouseMove', mouseMoveCallback);
                        e.stopImmediatePropagation();
                        return false;
                    }
                }
            }
            return false;
        }
    }


    function createNewMeasurement(mouseEventData)
    {
        // create the measurement data for this tool with the end handle activated
        var measurementData = {
            visible : true,
            active: true,
            handles : {
                start : {
                    x : mouseEventData.currentPoints.image.x,
                    y : mouseEventData.currentPoints.image.y,
                    highlight: true,
                    active: false
                },
                end: {
                    x : mouseEventData.currentPoints.image.x,
                    y : mouseEventData.currentPoints.image.y,
                    highlight: true,
                    active: true
                }
            }
        };

        return measurementData;
    }
    ///////// END ACTIVE TOOL ///////

    function pointNearTool(data, coords)
    {
        var lineSegment = {
            start: data.handles.start,
            end: data.handles.end
        };
        var distanceToPoint = cornerstoneMath.lineSegment.distanceToPoint(lineSegment, coords);
        return (distanceToPoint < 25);
    }

    function drawArrow(context, start, end, color, lineWidth) {
        //variables to be used when creating the arrow
        var headLength = 10;

        var angle = Math.atan2(end.y - start.y, end.x - start.x);

        //starting path of the arrow from the start square to the end square and drawing the stroke
        context.beginPath();
        context.moveTo(start.x, start.y);
        context.lineTo(end.x, end.y);
        context.strokeStyle = color;
        context.lineWidth = lineWidth;
        context.stroke();

        //starting a new path from the head of the arrow to one of the sides of the point
        context.beginPath();
        context.moveTo(end.x, end.y);
        context.lineTo(end.x - headLength * Math.cos(angle - Math.PI / 7), end.y - headLength * Math.sin(angle - Math.PI / 7));

        //path from the side point of the arrow, to the other side point
        context.lineTo(end.x - headLength * Math.cos(angle + Math.PI / 7), end.y - headLength * Math.sin(angle + Math.PI / 7));

        //path from the side point back to the tip of the arrow, and then again to the opposite side point
        context.lineTo(end.x, end.y);
        context.lineTo(end.x - headLength * Math.cos(angle - Math.PI / 7), end.y - headLength * Math.sin(angle - Math.PI / 7));

        //draws the paths created above
        context.strokeStyle = color;
        context.lineWidth = lineWidth;
        context.stroke();
        context.fillStyle = color;
        context.fill();
    }

    ///////// BEGIN IMAGE RENDERING ///////
    function onImageRendered(e, eventData)
    {
        // if we have no toolData for this element, return immediately as there is nothing to do
        var toolData = cornerstoneTools.getToolState(e.currentTarget, toolType);
        if(toolData === undefined) {
            return;
        }

        var config = cornerstoneTools.arrowAnnotate.getConfiguration();

        // we have tool data for this element - iterate over each one and draw it
        var context = eventData.canvasContext.canvas.getContext("2d");
        context.setTransform(1, 0, 0, 1, 0, 0);

        var color;
        var lineWidth = cornerstoneTools.toolStyle.getToolWidth();
        var font = cornerstoneTools.textStyle.getFont();
        var fontHeight = cornerstoneTools.textStyle.getFontSize();

        for(var i=0; i < toolData.data.length; i++) {
            context.save();

            var data = toolData.data[i];

            if (data.active) {
                color = cornerstoneTools.toolColors.getActiveColor();
            } else {
                color = cornerstoneTools.toolColors.getToolColor();
            }
            
            // Draw the arrow
            var handleStartCanvas = cornerstone.pixelToCanvas(eventData.element, data.handles.start);
            var handleEndCanvas = cornerstone.pixelToCanvas(eventData.element, data.handles.end);

            if (config.arrowFirst) {
                drawArrow(context, handleEndCanvas, handleStartCanvas, color, lineWidth);
            } else {
                drawArrow(context, handleStartCanvas, handleEndCanvas, color, lineWidth);
            }

            // If statement !== false so that by default the handles are drawn
            if (config.drawHandles !== false) {
                cornerstoneTools.drawHandles(context, eventData, data.handles, color);
            }

            // Draw the text
            if (data.annotationText !== undefined && data.annotationText !== null) {
                context.font = font;
                
                var distance = 13;

                // TODO: add 2 dimensional vector operations to cornerstoneMath
                var vector;
                
                var displacement = {
                    x: distance,
                    y: distance / 2
                };

                vector = {
                        x: handleEndCanvas.x - handleStartCanvas.x,
                        y: handleEndCanvas.y - handleStartCanvas.y
                };

                var textCoords;
                if (config.arrowFirst) {
                    // Fix text placement if arrow faces right
                    if (vector.x < 0) {
                        displacement.x = -displacement.x - context.measureText(data.annotationText).width;
                    }

                    textCoords = {
                        x: vector.x + handleStartCanvas.x + displacement.x,
                        y: vector.y + handleStartCanvas.y + displacement.y
                    };
                } else {
                    // Fix text placement if arrow faces right
                    if (vector.x > 0) {
                        displacement.x = -displacement.x - context.measureText(data.annotationText).width;
                    }

                    textCoords = {
                        x: -vector.x + handleEndCanvas.x + displacement.x,
                        y: -vector.y + handleEndCanvas.y + displacement.y
                    };
                }

                cornerstoneTools.drawTextBox(context, data.annotationText, textCoords.x, textCoords.y, color);
            }

            context.restore();
        }
    }

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

    // ---- Touch tool ----

    ///////// BEGIN ACTIVE TOOL ///////
    function addNewMeasurementTouch(touchEventData) {
        
        var annotationText;
        function doneChangingTextCallback(annotationText) {
            if (annotationText !== null) {
                measurementData.annotationText = annotationText;
            } else {
                cornerstoneTools.removeToolState(touchEventData.element, toolType, measurementData);
            }
            cornerstone.updateImage(touchEventData.element);
        }

        var measurementData = createNewMeasurement(touchEventData);
        cornerstoneTools.addToolState(touchEventData.element, toolType, measurementData);
        $(touchEventData.element).off('CornerstoneToolsTouchDrag', touchMoveCallback);
        cornerstoneTools.touchmoveHandle(touchEventData, measurementData.handles.end, function() {
            if (cornerstoneTools.anyHandlesOutsideImage(touchEventData, measurementData.handles))
            {
                // delete the measurement
                cornerstoneTools.removeToolState(touchEventData.element, toolType, measurementData);
            }

            var config = cornerstoneTools.arrowAnnotate.getConfiguration();
            if (measurementData.annotationText === undefined) {
                config.getTextCallback(doneChangingTextCallback);
            }

            $(touchEventData.element).on('CornerstoneToolsTouchDrag', touchMoveCallback);
        });
    }

    function touchDownActivateCallback(e, eventData)
    {
        addNewMeasurementTouch(eventData);
        return false; // false = causes jquery to preventDefault() and stopPropagation() this event
    }
    ///////// END ACTIVE TOOL ///////

    ///////// BEGIN INACTIVE TOOL ///////

    function touchMoveCallback(e, eventData)
    {
        cornerstoneTools.toolCoordinates.setCoords(eventData);
  
        // if we have no tool data for this element, do nothing
        var toolData = cornerstoneTools.getToolState(eventData.element, toolType);
        if (toolData === undefined) {
            return;
        }

        // We have tool data, search through all data
        // and see if we can activate a handle
        var imageNeedsUpdate = false;
        for (var i = 0; i < toolData.data.length; i++) {
            // get the touch position in image coordinates
            var data = toolData.data[i];
            if (cornerstoneTools.handleActivator(data.handles, eventData.currentPoints.image, eventData.viewport.scale) === true) {
                imageNeedsUpdate = true;
            }
        }

        // Handle activation status changed, redraw the image
        if (imageNeedsUpdate === true) {
            cornerstone.updateImage(eventData.element);
        }
        return false;
    }

    function getHandleNearImagePointTouch(data, coords)
    {
        for (var handle in data.handles) {
            var distanceSquared = cornerstoneMath.point.distanceSquared(data.handles[handle], coords);
            if (distanceSquared < 30)
            {
                return data.handles[handle];
            }
        }
    }

    function touchStartCallback(e, eventData){
        var data;
        function handleDoneMove()
        {
            if (cornerstoneTools.anyHandlesOutsideImage(eventData, data.handles))
            {
                // delete the measurement
                cornerstoneTools.removeToolState(eventData.element, toolType, data);
            }
            $(eventData.element).on('CornerstoneToolsTouchDrag', touchMoveCallback);
        }

        var coords = eventData.startPoints.image;
        var toolData = cornerstoneTools.getToolState(e.currentTarget, toolType);
        var i;

        // now check to see if there is a handle we can move
        if (toolData !== undefined) {
            for (i = 0; i < toolData.data.length; i++) {
                data = toolData.data[i];
                var handle = getHandleNearImagePointTouch(data, coords);
                if (handle !== undefined) {
                    $(eventData.element).off('CornerstoneToolsTouchDrag', touchMoveCallback);
                    cornerstoneTools.touchmoveHandle(eventData, handle, handleDoneMove);
                    e.stopImmediatePropagation();
                    return false; // false = causes jquery to preventDefault() and stopPropagation() this event
                }
            }
        }

        // Now check to see if there is a line we can move
        // now check to see if we have a tool that we can move
        if (toolData !== undefined && pointNearTool !== undefined) {
            for (i = 0; i < toolData.data.length; i++) {
                data = toolData.data[i];
                if (pointNearTool(data, coords)) {
                    $(eventData.element).off('CornerstoneToolsTouchDrag', touchMoveCallback);
                    cornerstoneTools.touchmoveAllHandles(e, data, toolData, true);
                    e.stopImmediatePropagation();
                    return false; // false = causes jquery to preventDefault() and stopPropagation() this event
                }
            }
        }
        return false;
    }

    // not visible, not interactive
    function disableTouch(element)
    {
        $(element).off("CornerstoneImageRendered", onImageRendered);
        $(element).off('CornerstoneToolsTouchDrag', touchMoveCallback);
        $(element).off('CornerstoneToolsDragStart', touchStartCallback);
        $(element).off('CornerstoneToolsDragStartActive', touchDownActivateCallback);

        cornerstone.updateImage(element);
    }

    // visible but not interactive
    function enableTouch(element)
    {
        $(element).off("CornerstoneImageRendered", onImageRendered);
        $(element).off('CornerstoneToolsTouchDrag', touchMoveCallback);
        $(element).off('CornerstoneToolsDragStart', touchStartCallback);
        $(element).off('CornerstoneToolsDragStartActive', touchDownActivateCallback);

        $(element).on("CornerstoneImageRendered", onImageRendered);

        cornerstone.updateImage(element);
    }

    // visible, interactive and can create
    function activateTouch(element) {
        $(element).off("CornerstoneImageRendered", onImageRendered);
        $(element).off("CornerstoneToolsTouchDrag", touchMoveCallback);
        $(element).off("CornerstoneToolsDragStart", touchStartCallback);
        $(element).off('CornerstoneToolsDragStartActive', touchDownActivateCallback);

        $(element).on("CornerstoneImageRendered", onImageRendered);
        $(element).on("CornerstoneToolsTouchDrag", touchMoveCallback);
        $(element).on('CornerstoneToolsDragStart', touchStartCallback);
        $(element).on('CornerstoneToolsDragStartActive', eventData, touchDownActivateCallback);

        cornerstone.updateImage(element);
    }

    // visible, interactive
    function deactivateTouch(element) {
        $(element).off("CornerstoneImageRendered", onImageRendered);
        $(element).off('CornerstoneToolsTouchDrag', touchMoveCallback);
        $(element).off('CornerstoneToolsDragStart', touchStartCallback);
        $(element).off('CornerstoneToolsDragStartActive', touchDownActivateCallback);

        $(element).on("CornerstoneImageRendered", onImageRendered);
        $(element).on("CornerstoneToolsTouchDrag", touchMoveCallback);
        $(element).on('CornerstoneToolsDragStart', touchStartCallback);

        cornerstone.updateImage(element);
    }

    function getConfiguration() {
        return configuration;
    }
    
    function setConfiguration(config) {
        configuration = config;
    }

    cornerstoneTools.arrowAnnotate = {
        enable: enable,
        disable: disable,
        activate: activate,
        deactivate: deactivate,
        getConfiguration: getConfiguration,
        setConfiguration: setConfiguration
    };

    cornerstoneTools.arrowAnnotateTouch = {
        enable: enableTouch,
        disable: disableTouch,
        activate: activateTouch,
        deactivate: deactivateTouch
    };

    cornerstoneTools.getConfiguration = getConfiguration;

    return cornerstoneTools;
}($, cornerstone, cornerstoneMath, cornerstoneTools));
