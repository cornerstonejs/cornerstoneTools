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
                },
                textBox: {
                    active: false,
                    hasMoved: false,
                    movesIndependently: false,
                    drawnIndependently: true,
                    allowedOutsideImage: true,
                    hasBoundingBox: true
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
        if (!toolData) {
            return;
        }

        var enabledElement = eventData.enabledElement;

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

            var handleStartCanvas = cornerstone.pixelToCanvas(eventData.element, data.handles.start);
            var handleMiddleCanvas = cornerstone.pixelToCanvas(eventData.element, data.handles.middle);
            var handleEndCanvas = cornerstone.pixelToCanvas(eventData.element, data.handles.end);

            // draw the line
            context.beginPath();
            context.strokeStyle = color;
            context.lineWidth = lineWidth;
            context.moveTo(handleStartCanvas.x, handleStartCanvas.y);
            context.lineTo(handleMiddleCanvas.x, handleMiddleCanvas.y);
            context.lineTo(handleEndCanvas.x, handleEndCanvas.y);
            context.stroke();

            // draw the handles
            var handleOptions = {
                drawHandlesIfActive: (config && config.drawHandlesOnHover)
            };

            cornerstoneTools.drawHandles(context, eventData, data.handles, color, handleOptions);

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

                var textCoords;
                if (!data.handles.textBox.hasMoved) {
                    textCoords = {
                        x: handleMiddleCanvas.x,
                        y: handleMiddleCanvas.y
                    };

                    context.font = font;
                    var textWidth = context.measureText(text).width;
                    if (handleMiddleCanvas.x < handleStartCanvas.x) {
                        textCoords.x -= distance + textWidth + 10;
                    } else {
                        textCoords.x += distance;
                    }

                    var transform = cornerstone.internal.getTransform(enabledElement);
                    transform.invert();

                    var coords = transform.transformPoint(textCoords.x, textCoords.y);
                    data.handles.textBox.x = coords.x;
                    data.handles.textBox.y = coords.y;

                } else {
                    textCoords = cornerstone.pixelToCanvas(eventData.element, data.handles.textBox);
                }

                var options = {
                    centering: {
                        x: false,
                        y: true
                    }
                };

                var boundingBox = cornerstoneTools.drawTextBox(context, text, textCoords.x, textCoords.y, color, options);
                data.handles.textBox.boundingBox = boundingBox;

                if (data.handles.textBox.hasMoved) {
                    // Draw dashed link line between tool and text
                    var link = {
                        start: {},
                        end: {}
                    };

                    var points = [ handleStartCanvas, handleEndCanvas, handleMiddleCanvas ];

                    link.end.x = textCoords.x;
                    link.end.y = textCoords.y;

                    link.start = cornerstoneMath.point.findClosestPoint(points, link.end);

                    var boundingBoxPoints = [ {
                        // Top middle point of bounding box
                        x: boundingBox.left + boundingBox.width / 2,
                        y: boundingBox.top
                    }, {
                        // Left middle point of bounding box
                        x: boundingBox.left,
                        y: boundingBox.top + boundingBox.height / 2
                    }, {
                        // Bottom middle point of bounding box
                        x: boundingBox.left + boundingBox.width / 2,
                        y: boundingBox.top + boundingBox.height
                    }, {
                        // Right middle point of bounding box
                        x: boundingBox.left + boundingBox.width,
                        y: boundingBox.top + boundingBox.height / 2
                    },
                ];

                    link.end = cornerstoneMath.point.findClosestPoint(boundingBoxPoints, link.start);

                    context.beginPath();
                    context.strokeStyle = color;
                    context.lineWidth = lineWidth;
                    context.setLineDash([ 2, 3 ]);
                    context.moveTo(link.start.x, link.start.y);
                    context.lineTo(link.end.x, link.end.y);
                    context.stroke();
                }
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

                $(element).on('CornerstoneToolsMouseMove', cornerstoneTools.simpleAngle.mouseMoveCallback);
                $(element).on('CornerstoneToolsMouseDrag', cornerstoneTools.simpleAngle.mouseMoveCallback);
                $(element).on('CornerstoneToolsMouseDown', eventData, cornerstoneTools.simpleAngle.mouseDownCallback);
                $(element).on('CornerstoneToolsMouseDownActivate', eventData, cornerstoneTools.simpleAngle.mouseDownActivateCallback);
                cornerstone.updateImage(element);
                return;
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

        cornerstoneTools.moveNewHandleTouch(touchEventData, toolType, measurementData, measurementData.handles.middle, function() {
            if (cornerstoneTools.anyHandlesOutsideImage(touchEventData, measurementData.handles)) {
                // delete the measurement
                cornerstoneTools.removeToolState(element, toolType, measurementData);
                $(element).on('CornerstoneToolsTouchDrag', cornerstoneTools.simpleAngleTouch.touchMoveCallback);
                $(element).on('CornerstoneToolsTouchStart', cornerstoneTools.simpleAngleTouch.touchStartCallback);
                $(element).on('CornerstoneToolsTouchStartActive', cornerstoneTools.simpleAngleTouch.touchDownActivateCallback);
                $(element).on('CornerstoneToolsTap', cornerstoneTools.simpleAngleTouch.tapCallback);
                cornerstone.updateImage(element);
                return;
            }

            cornerstoneTools.moveNewHandleTouch(touchEventData, toolType, measurementData, measurementData.handles.end, function() {
                if (cornerstoneTools.anyHandlesOutsideImage(touchEventData, measurementData.handles)) {
                    // delete the measurement
                    cornerstoneTools.removeToolState(element, toolType, measurementData);
                    cornerstone.updateImage(element);
                }

                $(element).on('CornerstoneToolsTouchDrag', cornerstoneTools.simpleAngleTouch.touchMoveCallback);
                $(element).on('CornerstoneToolsTouchStart', cornerstoneTools.simpleAngleTouch.touchStartCallback);
                $(element).on('CornerstoneToolsTouchStartActive', cornerstoneTools.simpleAngleTouch.touchDownActivateCallback);
                $(element).on('CornerstoneToolsTap', cornerstoneTools.simpleAngleTouch.tapCallback);
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
