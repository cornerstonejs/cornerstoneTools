var cornerstoneTools = (function ($, cornerstone, cornerstoneMath, cornerstoneTools) {

    "use strict";

    if (cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    var toolType = "ellipticalRoi";

    var cachedEllipseData = [];

    ///////// BEGIN ACTIVE TOOL ///////
    function createNewMeasurement(mouseEventData) {
        // create the measurement data for this tool with the end handle activated
        var measurementData = {
            visible : true,
            active: true,
            invalidated: true,
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

    function pointNearTool(element, data, coords) {
        // TODO: Find a formula for shortest distance between point and ellipse.  Rectangle is close enough
        var rect = {
            width : Math.abs(data.handles.start.x - data.handles.end.x),
            height : Math.abs(data.handles.start.y - data.handles.end.y)
        };

        var canvasRect = cornerstone.pixelToCanvas(element, {
            x: Math.min(data.handles.start.x, data.handles.end.x),
            y: Math.min(data.handles.start.y, data.handles.end.y)
        });
        rect.left = canvasRect.x;
        rect.top = canvasRect.y;

        // TODO: Convert pixel width/height to canvas width/height!

        var distanceToPoint = cornerstoneMath.rect.distanceToPoint(rect, coords);
        return (distanceToPoint < 5);
    }

    ///////// BEGIN IMAGE RENDERING ///////
    function pointInEllipse(ellipse, location) {
        var xRadius = ellipse.width / 2;
        var yRadius = ellipse.height / 2;

        if (xRadius <= 0.0 || yRadius <= 0.0) {
            return false;
        }

        var center = {
            x: ellipse.left + xRadius,
            y: ellipse.top + yRadius
        };

        /* This is a more general form of the circle equation
         *
         * X^2/a^2 + Y^2/b^2 <= 1
         */

        var normalized = {
            x: location.x - center.x,
            y: location.y - center.y
        };

        var inEllipse = ((normalized.x * normalized.y) / (xRadius * xRadius)) + ((normalized.y * normalized.y) / (yRadius * yRadius)) <= 1.0;
        return inEllipse;
    }

    function calculateMeanStdDev(sp, ellipse) {
        // TODO: Get a real statistics library here that supports large counts

        var sum = 0;
        var sumSquared = 0;
        var count = 0;
        var index = 0;

        for (var y=ellipse.top; y < ellipse.top + ellipse.height; y++) {
            for (var x=ellipse.left; x < ellipse.left + ellipse.width; x++) {
                if (pointInEllipse(ellipse, {x: x, y: y}) === true) {
                    sum += sp[index];
                    sumSquared += sp[index] * sp[index];
                    count++;
                }
                index++;
            }
        }

        if (count === 0) {
            return {
                count: count,
                mean: 0.0,
                variance: 0.0,
                stdDev: 0.0
            };
        }

        var mean = sum / count;
        var variance = sumSquared / count - mean * mean;

        return {
            count: count,
            mean: mean,
            variance: variance,
            stdDev: Math.sqrt(variance)
        };
    }


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
        var fontHeight = cornerstoneTools.textStyle.getFontSize();

        for (var i=0; i < toolData.data.length; i++) {
            context.save();

            var data = toolData.data[i];

            //differentiate the color of activation tool
            if (data.active) {
                color = cornerstoneTools.toolColors.getActiveColor();
            } else {
                color = cornerstoneTools.toolColors.getToolColor();
            }

            // draw the ellipse
            var handleStartCanvas = cornerstone.pixelToCanvas(eventData.element, data.handles.start);
            var handleEndCanvas = cornerstone.pixelToCanvas(eventData.element, data.handles.end);

            var widthCanvas = Math.abs(handleStartCanvas.x - handleEndCanvas.x);
            var heightCanvas = Math.abs(handleStartCanvas.y - handleEndCanvas.y);
            var leftCanvas = Math.min(handleStartCanvas.x, handleEndCanvas.x);
            var topCanvas = Math.min(handleStartCanvas.y, handleEndCanvas.y);
            var centerX = (handleStartCanvas.x + handleEndCanvas.x) / 2;
            var centerY = (handleStartCanvas.y + handleEndCanvas.y) / 2;

            context.beginPath();
            context.strokeStyle = color;
            context.lineWidth = lineWidth;
            cornerstoneTools.drawEllipse(context, leftCanvas, topCanvas, widthCanvas, heightCanvas);
            context.closePath();

            // draw the handles
            cornerstoneTools.drawHandles(context, eventData, data.handles);
            
            context.font = font;

            var textX,
                textY,
                meanStdDev,
                areaText;

            if (!data.invalidated) {
                textX = data.textX;
                textY = data.textY;
                meanStdDev = data.meanStdDev;
                areaText = data.areaText;
            } else {
                // TODO: calculate this in web worker for large pixel counts...
                var width = Math.abs(data.handles.start.x - data.handles.end.x);
                var height = Math.abs(data.handles.start.y - data.handles.end.y);
                var left = Math.min(data.handles.start.x, data.handles.end.x);
                var top = Math.min(data.handles.start.y, data.handles.end.y);

                var pixels = cornerstone.getPixels(eventData.element, left, top, width, height);

                var ellipse = {
                    left: left,
                    top: top,
                    width: width,
                    height: height
                };

                // Calculate the mean, stddev, and area
                meanStdDev = calculateMeanStdDev(pixels, ellipse);
                var area = Math.PI * (width * eventData.image.columnPixelSpacing / 2) * (height * eventData.image.rowPixelSpacing / 2);
                areaText = "Area: " + area.toFixed(2) + " mm" + String.fromCharCode(178); // Char code 178 is a superscript 2

                data.invalidated = false;
                data.areaText = areaText;
                data.meanStdDev = meanStdDev;
            }
            // Draw text
            var textSize = context.measureText(areaText);
            textX = centerX < (eventData.image.columns / 2) ? centerX + (widthCanvas / 2): centerX - (widthCanvas / 2) - textSize.width;
            textY = centerY < (eventData.image.rows / 2) ? centerY + (heightCanvas / 2): centerY - (heightCanvas / 2);

            context.fillStyle = color;
            cornerstoneTools.drawTextBox(context, "Mean: " + meanStdDev.mean.toFixed(2), textX, textY - fontHeight - 5, color);
            cornerstoneTools.drawTextBox(context, "StdDev: " + meanStdDev.stdDev.toFixed(2), textX, textY, color);
            cornerstoneTools.drawTextBox(context, areaText, textX, textY + fontHeight + 5, color);
            context.restore();
        }
    }
    ///////// END IMAGE RENDERING ///////


    // module exports
    cornerstoneTools.ellipticalRoi = cornerstoneTools.mouseButtonTool({
        createNewMeasurement : createNewMeasurement,
        onImageRendered: onImageRendered,
        pointNearTool : pointNearTool,
        toolType : toolType
    });
    cornerstoneTools.ellipticalRoiTouch = cornerstoneTools.touchTool({
        createNewMeasurement: createNewMeasurement,
        onImageRendered: onImageRendered,
        pointNearTool: pointNearTool,
        toolType: toolType
    });

    return cornerstoneTools;
}($, cornerstone, cornerstoneMath, cornerstoneTools));
