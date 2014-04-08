var cornerstoneTools = (function ($, cornerstone, csc, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    var toolType = "rectangleRoi";

    ///////// BEGIN ACTIVE TOOL ///////
    function createNewMeasurement(mouseEventData)
    {
        // create the measurement data for this tool with the end handle activated
        var measurementData = {
            visible : true,
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
        var rect = {
            left : Math.min(data.handles.start.x, data.handles.end.x),
            top : Math.min(data.handles.start.y, data.handles.end.y),
            width : Math.abs(data.handles.start.x - data.handles.end.x),
            height : Math.abs(data.handles.start.y - data.handles.end.y)
        };

        var distanceToPoint = cornerstoneTools.rect.distanceToPoint(rect, coords);
        return (distanceToPoint < 5);
    }

    ///////// BEGIN IMAGE RENDERING ///////

    function calculateMeanStdDev(sp, ellipse)
    {
        // TODO: Get a real statistics library here that supports large counts

        var sum = 0;
        var sumSquared =0;
        var count = 0;
        var index =0;

        for(var y=ellipse.top; y < ellipse.top + ellipse.height; y++) {
            for(var x=ellipse.left; x < ellipse.left + ellipse.width; x++) {
               sum += sp[index];
                sumSquared += sp[index] * sp[index];
                count++;
                index++;
            }
        }

        if(count === 0) {
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


    function onImageRendered(e) {

        // if we have no toolData for this element, return immediately as there is nothing to do
        var toolData = cornerstoneTools.getToolState(e.currentTarget, toolType);
        if(toolData === undefined) {
            return;
        }

        // we have tool data for this element - iterate over each one and draw it
        var renderData = e.originalEvent.detail;
        var context = renderData.canvasContext.canvas.getContext("2d");
        csc.setToPixelCoordinateSystem(renderData.enabledElement, context);

        for(var i=0; i < toolData.data.length; i++) {
            context.save();
            var data = toolData.data[i];

            // draw the ellipse
            var width = Math.abs(data.handles.start.x - data.handles.end.x);
            var height = Math.abs(data.handles.start.y - data.handles.end.y);
            var left = Math.min(data.handles.start.x, data.handles.end.x);
            var top = Math.min(data.handles.start.y, data.handles.end.y);
            var centerX = (data.handles.start.x + data.handles.end.x) / 2;
            var centerY = (data.handles.start.y + data.handles.end.y) / 2;

            context.beginPath();
            context.strokeStyle = 'white';
            context.lineWidth = 1 / renderData.viewport.scale;
            context.rect(left, top, width, height);
            context.stroke();

            // draw the handles
            context.beginPath();
            cornerstoneTools.drawHandles(context, renderData, data.handles);
            context.stroke();

            // Calculate the mean, stddev, and area
            // TODO: calculate this in web worker for large pixel counts...
            var storedPixels = cornerstone.getStoredPixels(renderData.element, left, top, width, height);
            var ellipse = {
                left: left,
                top: top,
                width: width,
                height: height
            };
            var meanStdDev = calculateMeanStdDev(storedPixels, ellipse);
            var area = (width * renderData.image.columnPixelSpacing) * (height * renderData.image.rowPixelSpacing);
            var areaText = "Area: " + area.toFixed(2) + " mm^2";

            // Draw text
            var fontParameters = csc.setToFontCoordinateSystem(renderData.enabledElement, renderData.canvasContext, 15);
            context.font = "" + fontParameters.fontSize + "px Arial";

            var textSize = context.measureText(area);

            var offset = fontParameters.lineHeight;
            var textX  = centerX < (renderData.image.columns / 2) ? centerX + (width /2): centerX - (width/2) - textSize.width * fontParameters.fontScale;
            var textY  = centerY < (renderData.image.rows / 2) ? centerY + (height /2): centerY - (height/2);

            textX = textX / fontParameters.fontScale;
            textY = textY / fontParameters.fontScale;

            context.fillStyle = "white";
            context.fillText("Mean: " + meanStdDev.mean.toFixed(2), textX, textY - offset);
            context.fillText("StdDev: " + meanStdDev.stdDev.toFixed(2), textX, textY);
            context.fillText(areaText, textX, textY + offset);
            context.restore();
        }
    }
    ///////// END IMAGE RENDERING ///////


    // module exports
    cornerstoneTools.rectangleRoi = cornerstoneTools.mouseButtonTool({
        createNewMeasurement : createNewMeasurement,
        onImageRendered: onImageRendered,
        pointNearTool : pointNearTool,
        toolType : toolType
    });

    return cornerstoneTools;
}($, cornerstone, cornerstoneCore, cornerstoneTools));