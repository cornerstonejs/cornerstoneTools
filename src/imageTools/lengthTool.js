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
        if (toolData === undefined) {
            return;
        }

        // we have tool data for this element - iterate over each one and draw it
        var context = eventData.canvasContext.canvas.getContext('2d');
        context.setTransform(1, 0, 0, 1, 0, 0);

        var color;
        var lineWidth = cornerstoneTools.toolStyle.getToolWidth();
        var font = cornerstoneTools.textStyle.getFont();
        var config = cornerstoneTools.length.getConfiguration();

        for (var i = 0; i < toolData.data.length; i++) {
            context.save();
            // configurable shadow
            if (config && config.shadow) {
                context.shadowColor = '#000000';
                context.shadowOffsetX = +1;
                context.shadowOffsetY = +1;
            }
            
            var data = toolData.data[i];

            if (data.active) {
                color = cornerstoneTools.toolColors.getActiveColor();
            } else {
                color = cornerstoneTools.toolColors.getToolColor();
            }

            // draw the line
            var handleStartCanvas = cornerstone.pixelToCanvas(eventData.element, data.handles.start);
            var handleEndCanvas = cornerstone.pixelToCanvas(eventData.element, data.handles.end);

            context.beginPath();
            context.strokeStyle = color;
            context.lineWidth = lineWidth;
            context.moveTo(handleStartCanvas.x, handleStartCanvas.y);
            context.lineTo(handleEndCanvas.x, handleEndCanvas.y);
            context.stroke();

            // draw the handles
            cornerstoneTools.drawHandles(context, eventData, data.handles, color);

            // Draw the text
            context.fillStyle = color;
            context.font = font;

            var suffix = ' mm';
            if (!eventData.image.rowPixelSpacing || !eventData.image.columnPixelSpacing) {
                suffix = ' pixels';
            }

            var vector = {
                x: handleStartCanvas.x - handleEndCanvas.x,
                y: handleStartCanvas.y - handleEndCanvas.y,
            };

            var midpoint = {
                x: (handleStartCanvas.x + handleEndCanvas.x) / 2,
                y: (handleStartCanvas.y + handleEndCanvas.y) / 2
            };

            var magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y);

            var normal = {
                x: -vector.y / magnitude,
                y: vector.x / magnitude
            };

            // Set rowPixelSpacing and columnPixelSpacing to 1 if they are undefined (or zero)
            var dx = (data.handles.end.x - data.handles.start.x) * (eventData.image.columnPixelSpacing || 1);
            var dy = (data.handles.end.y - data.handles.start.y) * (eventData.image.rowPixelSpacing || 1);
            
            var length = Math.sqrt(dx * dx + dy * dy);
            var text = '' + length.toFixed(2) + suffix;

            var fontSize = cornerstoneTools.textStyle.getFontSize();
            var textWidth = context.measureText(text).width;

            var distance = {
                x: Math.min(10, textWidth / 2),
                y: Math.min(25, fontSize),
            };

            if (handleEndCanvas.y < handleStartCanvas.y) {
                distance.x = -distance.x;
                distance.y = -distance.y;
            }
        
            var textCoords = {
                x: midpoint.x + normal.x * distance.x,
                y: midpoint.y + normal.y * distance.y
            };

            cornerstoneTools.drawTextBox(context, text, textCoords.x, textCoords.y, color);
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
