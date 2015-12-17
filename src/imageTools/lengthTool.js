(function($, cornerstone, cornerstoneMath, cornerstoneTools) {

    'use strict';

    var toolType = 'length';

    ///////// BEGIN ACTIVE TOOL ///////
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
                    active: true
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

        // we have tool data for this element - iterate over each one and draw it
        var context = eventData.canvasContext.canvas.getContext('2d');
        context.setTransform(1, 0, 0, 1, 0, 0);

        var lineWidth = cornerstoneTools.toolStyle.getToolWidth();
        var config = cornerstoneTools.length.getConfiguration();

        for (var i = 0; i < toolData.data.length; i++) {
            context.save();

            // configurable shadow
            if (config && config.shadow) {
                context.shadowColor = config.shadowColor || '#000000';
                context.shadowOffsetX = config.shadowOffsetX || 1;
                context.shadowOffsetY = config.shadowOffsetY || 1;
            }

            var data = toolData.data[i];
            var color = cornerstoneTools.toolColors.getColorIfActive(data.active);

            // Get the handle positions in canvas coordinates
            var handleStartCanvas = cornerstone.pixelToCanvas(eventData.element, data.handles.start);
            var handleEndCanvas = cornerstone.pixelToCanvas(eventData.element, data.handles.end);

            // Draw the measurement line
            context.beginPath();
            context.strokeStyle = color;
            context.lineWidth = lineWidth;
            context.moveTo(handleStartCanvas.x, handleStartCanvas.y);
            context.lineTo(handleEndCanvas.x, handleEndCanvas.y);
            context.stroke();

            // Draw the handles
            var handleOptions = {
                drawHandlesIfActive: (config && config.drawHandlesOnHover)
            };

            cornerstoneTools.drawHandles(context, eventData, data.handles, color, handleOptions);

            // Draw the text
            context.fillStyle = color;

            // Set rowPixelSpacing and columnPixelSpacing to 1 if they are undefined (or zero)
            var dx = (data.handles.end.x - data.handles.start.x) * (eventData.image.columnPixelSpacing || 1);
            var dy = (data.handles.end.y - data.handles.start.y) * (eventData.image.rowPixelSpacing || 1);

            // Calculate the length, and create the text variable with the millimeters or pixels suffix            
            var length = Math.sqrt(dx * dx + dy * dy);

            // Store the length inside the tool for outside access
            data.length = length;

            // Set the length text suffix depending on whether or not pixelSpacing is available
            var suffix = ' mm';
            if (!eventData.image.rowPixelSpacing || !eventData.image.columnPixelSpacing) {
                suffix = ' pixels';
            }

            // Store the length measurement text
            var text = '' + length.toFixed(2) + suffix;

            if (!data.handles.textBox.hasMoved) {
                var coords = {
                    x: Math.max(data.handles.start.x, data.handles.end.x),
                };

                // Depending on which handle has the largest x-value, 
                // set the y-value for the text box
                if (coords.x === data.handles.start.x) {
                    coords.y = data.handles.start.y;
                } else {
                    coords.y = data.handles.end.y;
                }

                data.handles.textBox.x = coords.x;
                data.handles.textBox.y = coords.y;
            }
            
            var textCoords = cornerstone.pixelToCanvas(eventData.element, data.handles.textBox);

            // Move the textbox slightly to the right and upwards
            // so that it sits beside the length tool handle
            textCoords.x += 10;

            var options = {
                centering: {
                    x: false,
                    y: true
                }
            };

            // Draw the textbox
            var boundingBox = cornerstoneTools.drawTextBox(context, text, textCoords.x, textCoords.y, color, options);
            data.handles.textBox.boundingBox = boundingBox;

            if (data.handles.textBox.hasMoved) {
                // Draw dashed link line between ellipse and text
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

            context.restore();
        }
    }
    ///////// END IMAGE RENDERING ///////

    // module exports
    cornerstoneTools.length = cornerstoneTools.mouseButtonTool({
        createNewMeasurement: createNewMeasurement,
        onImageRendered: onImageRendered,
        pointNearTool: pointNearTool,
        toolType: toolType
    });

    cornerstoneTools.lengthTouch = cornerstoneTools.touchTool({
        createNewMeasurement: createNewMeasurement,
        onImageRendered: onImageRendered,
        pointNearTool: pointNearTool,
        toolType: toolType
    });

})($, cornerstone, cornerstoneMath, cornerstoneTools);
