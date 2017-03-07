(function($, cornerstone, cornerstoneMath, cornerstoneTools) {

    'use strict';

    var toolType = 'arrowAnnotate';

    // Define a callback to get your text annotation
    // This could be used, e.g. to open a modal
    function getTextCallback(doneChangingTextCallback) {
        doneChangingTextCallback(prompt('Enter your annotation:'));
    }

    function changeTextCallback(data, eventData, doneChangingTextCallback) {
        doneChangingTextCallback(prompt('Change your annotation:'));
    }

    var configuration = {
        getTextCallback: getTextCallback,
        changeTextCallback: changeTextCallback,
        drawHandles: false,
        drawHandlesOnHover: true,
        arrowFirst: true
    };

    /// --- Mouse Tool --- ///

    ///////// BEGIN ACTIVE TOOL ///////
    function addNewMeasurement(mouseEventData) {
        var measurementData = createNewMeasurement(mouseEventData);

        var eventData = {
            mouseButtonMask: mouseEventData.which,
        };

        function doneChangingTextCallback(text) {
            if (text !== null) {
                measurementData.text = text;
            } else {
                cornerstoneTools.removeToolState(mouseEventData.element, toolType, measurementData);
            }

            measurementData.active = false;
            cornerstone.updateImage(mouseEventData.element);

            $(mouseEventData.element).on('CornerstoneToolsMouseMove', eventData, cornerstoneTools.arrowAnnotate.mouseMoveCallback);
            $(mouseEventData.element).on('CornerstoneToolsMouseDown', eventData, cornerstoneTools.arrowAnnotate.mouseDownCallback);
            $(mouseEventData.element).on('CornerstoneToolsMouseDownActivate', eventData, cornerstoneTools.arrowAnnotate.mouseDownActivateCallback);
            $(mouseEventData.element).on('CornerstoneToolsMouseDoubleClick', eventData, cornerstoneTools.arrowAnnotate.mouseDoubleClickCallback);
        }

        // associate this data with this imageId so we can render it and manipulate it
        cornerstoneTools.addToolState(mouseEventData.element, toolType, measurementData);

        // since we are dragging to another place to drop the end point, we can just activate
        // the end point and let the moveHandle move it for us.
        $(mouseEventData.element).off('CornerstoneToolsMouseMove', cornerstoneTools.arrowAnnotate.mouseMoveCallback);
        $(mouseEventData.element).off('CornerstoneToolsMouseDown', cornerstoneTools.arrowAnnotate.mouseDownCallback);
        $(mouseEventData.element).off('CornerstoneToolsMouseDownActivate', cornerstoneTools.arrowAnnotate.mouseDownActivateCallback);
        $(mouseEventData.element).off('CornerstoneToolsMouseDoubleClick', cornerstoneTools.arrowAnnotate.mouseDoubleClickCallback);

        cornerstone.updateImage(mouseEventData.element);
        cornerstoneTools.moveNewHandle(mouseEventData, toolType, measurementData, measurementData.handles.end, function() {
            if (cornerstoneTools.anyHandlesOutsideImage(mouseEventData, measurementData.handles)) {
                // delete the measurement
                cornerstoneTools.removeToolState(mouseEventData.element, toolType, measurementData);
            }

            var config = cornerstoneTools.arrowAnnotate.getConfiguration();
            if (measurementData.text === undefined) {
                config.getTextCallback(doneChangingTextCallback);
            }

            cornerstone.updateImage(mouseEventData.element);
        });
    }

    function createNewMeasurement(mouseEventData) {
        // create the measurement data for this tool with the end handle activated
        var measurementData = {
            visible: true,
            active: true,
            handles: {
                start: {
                    x: mouseEventData.currentPoints.image.x,
                    y: mouseEventData.currentPoints.image.y,
                    highlight: true,
                    active: false
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

        return measurementData;
    }
    ///////// END ACTIVE TOOL ///////

    function pointNearTool(element, data, coords) {
        var lineSegment = {
            start: cornerstone.pixelToCanvas(element, data.handles.start),
            end: cornerstone.pixelToCanvas(element, data.handles.end)
        };

        var distanceToPoint = cornerstoneMath.lineSegment.distanceToPoint(lineSegment, coords);
        return (distanceToPoint < 25);
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

        var color;
        var lineWidth = cornerstoneTools.toolStyle.getToolWidth();
        var font = cornerstoneTools.textStyle.getFont();
        var config = cornerstoneTools.arrowAnnotate.getConfiguration();

        for (var i = 0; i < toolData.data.length; i++) {
            context.save();

            if (config && config.shadow) {
                context.shadowColor = config.shadowColor || '#000000';
                context.shadowOffsetX = config.shadowOffsetX || 1;
                context.shadowOffsetY = config.shadowOffsetY || 1;
            }

            var data = toolData.data[i];

            if (data.active) {
                color = cornerstoneTools.toolColors.getActiveColor();
            } else {
                color = cornerstoneTools.toolColors.getToolColor();
            }

            // Draw the arrow
            var handleStartCanvas = cornerstone.pixelToCanvas(eventData.element, data.handles.start);
            var handleEndCanvas = cornerstone.pixelToCanvas(eventData.element, data.handles.end);

            //config.arrowFirst = false;
            if (config.arrowFirst) {
                cornerstoneTools.drawArrow(context, handleEndCanvas, handleStartCanvas, color, lineWidth);
            } else {
                cornerstoneTools.drawArrow(context, handleStartCanvas, handleEndCanvas, color, lineWidth);
            }

            var handleOptions = {
                drawHandlesIfActive: (config && config.drawHandlesOnHover)
            };

            if (config.drawHandles) {
                cornerstoneTools.drawHandles(context, eventData, data.handles, color, handleOptions);
            }

            // Draw the text
            if (data.text && data.text !== '') {
                context.font = font;

                // Calculate the text coordinates.
                var textWidth = context.measureText(data.text).width + 10;
                var textHeight = cornerstoneTools.textStyle.getFontSize() + 10;

                var distance = Math.max(textWidth, textHeight) / 2 + 5;
                if (handleEndCanvas.x < handleStartCanvas.x) {
                    distance = -distance;
                }

                var textCoords;
                if (!data.handles.textBox.hasMoved) {
                    if (config.arrowFirst) {
                        textCoords = {
                            x: handleEndCanvas.x - textWidth / 2 + distance,
                            y: handleEndCanvas.y - textHeight / 2
                        };
                    } else {
                        // If the arrow is at the End position, the text should
                        // be placed near the Start position
                        textCoords = {
                            x: handleStartCanvas.x - textWidth / 2 - distance,
                            y: handleStartCanvas.y - textHeight / 2
                        };
                    }

                    var transform = cornerstone.internal.getTransform(enabledElement);
                    transform.invert();

                    var coords = transform.transformPoint(textCoords.x, textCoords.y);
                    data.handles.textBox.x = coords.x;
                    data.handles.textBox.y = coords.y;
                }

                textCoords = cornerstone.pixelToCanvas(eventData.element, data.handles.textBox);

                var boundingBox = cornerstoneTools.drawTextBox(context, data.text, textCoords.x, textCoords.y, color);
                data.handles.textBox.boundingBox = boundingBox;

                if (data.handles.textBox.hasMoved) {
                    // Draw dashed link line between tool and text
                    var link = {
                        start: {},
                        end: {}
                    };

                    var midpointCanvas = {
                        x: (handleStartCanvas.x + handleEndCanvas.x) / 2,
                        y: (handleStartCanvas.y + handleEndCanvas.y) / 2,
                    };

                    var points = [ handleStartCanvas, handleEndCanvas, midpointCanvas ];

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
    // ---- Touch tool ----

    ///////// BEGIN ACTIVE TOOL ///////
    function addNewMeasurementTouch(touchEventData) {
        var element = touchEventData.element;
        var measurementData = createNewMeasurement(touchEventData);

        function doneChangingTextCallback(text) {
            if (text !== null) {
                measurementData.text = text;
            } else {
                cornerstoneTools.removeToolState(element, toolType, measurementData);
            }

            measurementData.active = false;
            cornerstone.updateImage(element);

            $(element).on('CornerstoneToolsTouchPress', cornerstoneTools.arrowAnnotateTouch.pressCallback);
            $(element).on('CornerstoneToolsTouchStartActive', cornerstoneTools.arrowAnnotateTouch.touchDownActivateCallback);
            $(element).on('CornerstoneToolsTap', cornerstoneTools.arrowAnnotateTouch.tapCallback);
        }

        cornerstoneTools.addToolState(element, toolType, measurementData);
        $(element).off('CornerstoneToolsTouchPress', cornerstoneTools.arrowAnnotateTouch.pressCallback);
        $(element).off('CornerstoneToolsTouchStartActive', cornerstoneTools.arrowAnnotateTouch.touchDownActivateCallback);
        $(element).off('CornerstoneToolsTap', cornerstoneTools.arrowAnnotateTouch.tapCallback);
        cornerstone.updateImage(element);

        cornerstoneTools.moveNewHandleTouch(touchEventData, toolType, measurementData, measurementData.handles.end, function() {
            cornerstone.updateImage(element);

            if (cornerstoneTools.anyHandlesOutsideImage(touchEventData, measurementData.handles)) {
                // delete the measurement
                cornerstoneTools.removeToolState(element, toolType, measurementData);
            }

            var config = cornerstoneTools.arrowAnnotate.getConfiguration();
            if (measurementData.text === undefined) {
                config.getTextCallback(doneChangingTextCallback);
            }
        });
    }

    function doubleClickCallback(e, eventData) {
        var element = eventData.element;
        var data;

        function doneChangingTextCallback(data, updatedText, deleteTool) {
            if (deleteTool === true) {
                cornerstoneTools.removeToolState(element, toolType, data);
            } else {
                data.text = updatedText;
            }

            data.active = false;
            cornerstone.updateImage(element);
        }

        if (e.data && e.data.mouseButtonMask && !cornerstoneTools.isMouseButtonEnabled(eventData.which, e.data.mouseButtonMask)) {
            return;
        }

        var config = cornerstoneTools.arrowAnnotate.getConfiguration();

        var coords = eventData.currentPoints.canvas;
        var toolData = cornerstoneTools.getToolState(element, toolType);

        // now check to see if there is a handle we can move
        if (!toolData) {
            return;
        }

        for (var i = 0; i < toolData.data.length; i++) {
            data = toolData.data[i];
            if (pointNearTool(element, data, coords) ||
                cornerstoneTools.pointInsideBoundingBox(data.handles.textBox, coords)) {
                data.active = true;
                cornerstone.updateImage(element);
                // Allow relabelling via a callback
                config.changeTextCallback(data, eventData, doneChangingTextCallback);

                e.stopImmediatePropagation();
                return false;
            }
        }
    }

    function pressCallback(e, eventData) {
        var element = eventData.element;
        var data;

        function doneChangingTextCallback(data, updatedText, deleteTool) {
            console.log('pressCallback doneChangingTextCallback');
            if (deleteTool === true) {
                cornerstoneTools.removeToolState(element, toolType, data);
            } else {
                data.text = updatedText;
            }

            data.active = false;
            cornerstone.updateImage(element);

            $(element).on('CornerstoneToolsTouchStart', cornerstoneTools.arrowAnnotateTouch.touchStartCallback);
            $(element).on('CornerstoneToolsTouchStartActive', cornerstoneTools.arrowAnnotateTouch.touchDownActivateCallback);
            $(element).on('CornerstoneToolsTap', cornerstoneTools.arrowAnnotateTouch.tapCallback);
        }

        if (e.data && e.data.mouseButtonMask && !cornerstoneTools.isMouseButtonEnabled(eventData.which, e.data.mouseButtonMask)) {
            return;
        }

        var config = cornerstoneTools.arrowAnnotate.getConfiguration();

        var coords = eventData.currentPoints.canvas;
        var toolData = cornerstoneTools.getToolState(element, toolType);

        // now check to see if there is a handle we can move
        if (!toolData) {
            return;
        }

        if (eventData.handlePressed) {
            $(element).off('CornerstoneToolsTouchStart', cornerstoneTools.arrowAnnotateTouch.touchStartCallback);
            $(element).off('CornerstoneToolsTouchStartActive', cornerstoneTools.arrowAnnotateTouch.touchDownActivateCallback);
            $(element).off('CornerstoneToolsTap', cornerstoneTools.arrowAnnotateTouch.tapCallback);

            // Allow relabelling via a callback
            config.changeTextCallback(eventData.handlePressed, eventData, doneChangingTextCallback);

            e.stopImmediatePropagation();
            return false;
        }

        for (var i = 0; i < toolData.data.length; i++) {
            data = toolData.data[i];
            if (pointNearTool(element, data, coords) ||
                cornerstoneTools.pointInsideBoundingBox(data.handles.textBox, coords)) {
                data.active = true;
                cornerstone.updateImage(element);

                $(element).off('CornerstoneToolsTouchStart', cornerstoneTools.arrowAnnotateTouch.touchStartCallback);
                $(element).off('CornerstoneToolsTouchStartActive', cornerstoneTools.arrowAnnotateTouch.touchDownActivateCallback);
                $(element).off('CornerstoneToolsTap', cornerstoneTools.arrowAnnotateTouch.tapCallback);

                // Allow relabelling via a callback
                config.changeTextCallback(data, eventData, doneChangingTextCallback);

                e.stopImmediatePropagation();
                return false;
            }
        }

        return false; // false = causes jquery to preventDefault() and stopPropagation() this event
    }

    cornerstoneTools.arrowAnnotate = cornerstoneTools.mouseButtonTool({
        addNewMeasurement: addNewMeasurement,
        createNewMeasurement: createNewMeasurement,
        onImageRendered: onImageRendered,
        pointNearTool: pointNearTool,
        toolType: toolType,
        mouseDoubleClickCallback: doubleClickCallback
    });

    cornerstoneTools.arrowAnnotate.setConfiguration(configuration);

    cornerstoneTools.arrowAnnotateTouch = cornerstoneTools.touchTool({
        addNewMeasurement: addNewMeasurementTouch,
        createNewMeasurement: createNewMeasurement,
        onImageRendered: onImageRendered,
        pointNearTool: pointNearTool,
        toolType: toolType,
        pressCallback: pressCallback
    });

})($, cornerstone, cornerstoneMath, cornerstoneTools);
