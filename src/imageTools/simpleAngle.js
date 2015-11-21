(function($, cornerstone, cornerstoneMath, cornerstoneTools) {

    'use strict';

    var toolType = 'simpleAngle';

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
        if (distanceToPoint < 25) {
            return true;
        }

        lineSegment.start = cornerstone.pixelToCanvas(element, data.handles.middle);
        lineSegment.end = cornerstone.pixelToCanvas(element, data.handles.end);

        distanceToPoint = cornerstoneMath.lineSegment.distanceToPoint(lineSegment, coords);
        return (distanceToPoint < 25);
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
        var context = eventData.canvasContext.canvas.getContext('2d');
        context.setTransform(1, 0, 0, 1, 0, 0);
        
        //activation color 
        var color;
        var lineWidth = cornerstoneTools.toolStyle.getToolWidth();
        var font = cornerstoneTools.textStyle.getFont();
        var config = cornerstoneTools.simpleAngle.getConfiguration();

        for (var i = 0; i < toolData.data.length; i++) {
            context.save();

            if (config && config.shadow) {
                context.shadowColor = config.shadowColor || '#000000';
                context.shadowOffsetX = config.shadowOffsetX || 1;
                context.shadowOffsetY = config.shadowOffsetY || 1;
            }

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
            cornerstoneTools.drawHandles(context, eventData, data.handles, color);

            // Draw the text
            context.fillStyle = color;

            // Default to isotropic pixel size, update suffix to reflect this
            var columnPixelSpacing = eventData.image.columnPixelSpacing || 1;
            var rowPixelSpacing = eventData.image.rowPixelSpacing || 1;
            var suffix = '';
            if (!eventData.image.rowPixelSpacing || !eventData.image.columnPixelSpacing) {
                suffix = ' (isotropic)';
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
                var str = '00B0'; // degrees symbol
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
        var element = mouseEventData.element;

        var eventData = {
            mouseButtonMask: mouseEventData.which,
        };

        // associate this data with this imageId so we can render it and manipulate it
        cornerstoneTools.addToolState(element, toolType, measurementData);

        // since we are dragging to another place to drop the end point, we can just activate
        // the end point and let the moveHandle move it for us.
        $(element).off('CornerstoneToolsMouseMove', cornerstoneTools.simpleAngle.mouseMoveCallback);
        $(element).off('CornerstoneToolsMouseDrag', cornerstoneTools.simpleAngle.mouseMoveCallback);
        $(element).off('CornerstoneToolsMouseDown', cornerstoneTools.simpleAngle.mouseDownCallback);
        $(element).off('CornerstoneToolsMouseDownActivate', cornerstoneTools.simpleAngle.mouseDownActivateCallback);
        cornerstone.updateImage(element);

        cornerstoneTools.moveNewHandle(mouseEventData, toolType, measurementData, measurementData.handles.middle, function() {
            measurementData.active = false;
            if (cornerstoneTools.anyHandlesOutsideImage(mouseEventData, measurementData.handles)) {
                // delete the measurement
                cornerstoneTools.removeToolState(element, toolType, measurementData);
            }

            measurementData.handles.end.active = true;
            cornerstone.updateImage(element);

            cornerstoneTools.moveNewHandle(mouseEventData, toolType, measurementData, measurementData.handles.end, function() {
                measurementData.active = false;
                if (cornerstoneTools.anyHandlesOutsideImage(mouseEventData, measurementData.handles)) {
                    // delete the measurement
                    cornerstoneTools.removeToolState(element, toolType, measurementData);
                }

                $(element).on('CornerstoneToolsMouseMove', cornerstoneTools.simpleAngle.mouseMoveCallback);
                $(element).on('CornerstoneToolsMouseDrag', cornerstoneTools.simpleAngle.mouseMoveCallback);
                $(element).on('CornerstoneToolsMouseDown', eventData, cornerstoneTools.simpleAngle.mouseDownCallback);
                $(element).on('CornerstoneToolsMouseDownActivate', eventData, cornerstoneTools.simpleAngle.mouseDownActivateCallback);
                cornerstone.updateImage(element);
            });
        });
    }

    function addNewMeasurementTouch(touchEventData) {
        var measurementData = createNewMeasurement(touchEventData);
        var element = touchEventData.element;

        // associate this data with this imageId so we can render it and manipulate it
        cornerstoneTools.addToolState(element, toolType, measurementData);

        // since we are dragging to another place to drop the end point, we can just activate
        // the end point and let the moveHandle move it for us.
        $(element).off('CornerstoneToolsTouchDrag', cornerstoneTools.simpleAngleTouch.touchMoveCallback);
        $(element).off('CornerstoneToolsTouchStartActive', cornerstoneTools.simpleAngleTouch.touchDownActivateCallback);
        $(element).off('CornerstoneToolsTouchStart', cornerstoneTools.simpleAngleTouch.touchStartCallback);
        $(element).off('CornerstoneToolsTap', cornerstoneTools.simpleAngleTouch.tapCallback);
        cornerstone.updateImage(element);

        cornerstoneTools.moveNewHandleTouch(touchEventData, measurementData.handles.middle, function() {
            measurementData.active = false;
            if (cornerstoneTools.anyHandlesOutsideImage(touchEventData, measurementData.handles)) {
                // delete the measurement
                cornerstoneTools.removeToolState(element, toolType, measurementData);
            }

            measurementData.handles.end.active = true;
            cornerstone.updateImage(element);

            cornerstoneTools.moveNewHandleTouch(touchEventData, measurementData.handles.end, function() {
                measurementData.active = false;
                if (cornerstoneTools.anyHandlesOutsideImage(touchEventData, measurementData.handles)) {
                    // delete the measurement
                    cornerstoneTools.removeToolState(element, toolType, measurementData);
                }

                $(element).on('CornerstoneToolsTouchDrag', cornerstoneTools.simpleAngleTouch.touchMoveCallback);
                $(element).on('CornerstoneToolsTouchStart', cornerstoneTools.simpleAngleTouch.touchStartCallback);
                $(element).on('CornerstoneToolsTouchStartActive', cornerstoneTools.simpleAngleTouch.touchDownActivateCallback);
                $(element).on('CornerstoneToolsTap', cornerstoneTools.simpleAngleTouch.tapCallback);
                cornerstone.updateImage(element);
            });
        });
    }

    cornerstoneTools.simpleAngle = cornerstoneTools.mouseButtonTool({
        createNewMeasurement: createNewMeasurement,
        addNewMeasurement: addNewMeasurement,
        onImageRendered: onImageRendered,
        pointNearTool: pointNearTool,
        toolType: toolType
    });

    cornerstoneTools.simpleAngleTouch = cornerstoneTools.touchTool({
        createNewMeasurement: createNewMeasurement,
        addNewMeasurement: addNewMeasurementTouch,
        onImageRendered: onImageRendered,
        pointNearTool: pointNearTool,
        toolType: toolType
    });

})($, cornerstone, cornerstoneMath, cornerstoneTools);
