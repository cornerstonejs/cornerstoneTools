var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    var toolType = "probe4D";

    function updateLineSample(measurementData)
    {
        var samples = [];

        measurementData.timeSeries.stacks.forEach(function(stack) {
            cornerstone.loadAndCacheImage(stack.imageIds[measurementData.imageIdIndex]).then(function(image) {
                var offset = Math.round(measurementData.handles.end.x) + Math.round(measurementData.handles.end.y) * image.width;
                var sample = image.getPixelData()[offset];
                samples.push(sample);
                //console.log(sample);
            });
        });
        measurementData.lineSample.set(samples);
    }

    ///////// BEGIN ACTIVE TOOL ///////
    function createNewMeasurement(mouseEventData)
    {
        var timeSeriestoolData = cornerstoneTools.getToolState(mouseEventData.element, 'timeSeries');
        if(timeSeriestoolData === undefined || timeSeriestoolData.data === undefined || timeSeriestoolData.data.length === 0) {
            return;
        }
        var timeSeries = timeSeriestoolData.data[0];

        // create the measurement data for this tool with the end handle activated
        var measurementData = {
            timeSeries: timeSeries,
            lineSample : new cornerstoneTools.LineSampleMeasurement(),
            imageIdIndex: timeSeries.stacks[timeSeries.currentStackIndex].currentImageIdIndex,
            visible: true,
            handles: {
                end: {
                    x: mouseEventData.currentPoints.image.x,
                    y: mouseEventData.currentPoints.image.y,
                    highlight: true,
                    active: true
                }
            }
        };
        updateLineSample(measurementData);
        cornerstoneTools.MeasurementManager.add(measurementData);
        return measurementData;
    }
    ///////// END ACTIVE TOOL ///////


    ///////// BEGIN IMAGE RENDERING ///////

    function onImageRendered(e, eventData) {

        // if we have no toolData for this element, return immediately as there is nothing to do
        var toolData = cornerstoneTools.getToolState(e.currentTarget, toolType);
        if(toolData === undefined) {
            return;
        }

        // we have tool data for this element - iterate over each one and draw it
        var context = eventData.canvasContext.canvas.getContext("2d");
        cornerstone.setToPixelCoordinateSystem(eventData.enabledElement, context);
        var color="white";
        for(var i=0; i < toolData.data.length; i++) {
            context.save();
            var data = toolData.data[i];

            // draw the handles
            context.beginPath();
            cornerstoneTools.drawHandles(context, eventData, data.handles,color);
            context.stroke();

            // Draw text
            var fontParameters = cornerstoneTools.setContextToDisplayFontSize(eventData.enabledElement, eventData.canvasContext, 15);
            context.font = "" + fontParameters.fontSize + "px Arial";

            // translate the x/y away from the cursor
            var x = Math.round(data.handles.end.x);
            var y = Math.round(data.handles.end.y);
            textX = data.handles.end.x + 3;
            textY = data.handles.end.y - 3;

            var textX = textX / fontParameters.fontScale;
            var textY = textY / fontParameters.fontScale;

            context.fillStyle = "white";

            context.fillText("" + x + "," + y, textX, textY);

            context.restore();
        }
    }
    ///////// END IMAGE RENDERING ///////


    // module exports
    cornerstoneTools.probeTool4D = cornerstoneTools.mouseButtonTool({
        createNewMeasurement : createNewMeasurement,
        onImageRendered: onImageRendered,
        toolType : toolType
    });


    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));
