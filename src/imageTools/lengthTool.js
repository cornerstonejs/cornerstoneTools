/**
 * lengthTool.js
 */
var cornerstoneTools = (function ($, cornerstone, csc, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    var toolType = "length";

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

    ///////// BEGIN IMAGE RENDERING ///////

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

            // draw the line
            context.beginPath();
            context.strokeStyle = 'white';
            context.lineWidth = 1 / renderData.viewport.scale;
            context.moveTo(data.handles.start.x, data.handles.start.y);
            context.lineTo(data.handles.end.x, data.handles.end.y);
            context.stroke();

            // draw the handles
            context.beginPath();
            cornerstoneTools.drawHandles(context, renderData, data.handles);
            context.stroke();

            // Draw the text
            context.fillStyle = "white";
            var dx = data.handles.start.x - data.handles.end.x * renderData.image.columnPixelSpacing;
            var dy = data.handles.start.y - data.handles.end.y * renderData.image.rowPixelSpacing;
            var length = Math.sqrt(dx * dx + dy * dy);
            var text = "" + length.toFixed(2) + " mm";

            var fontParameters = csc.setToFontCoordinateSystem(renderData.enabledElement, renderData.canvasContext, 15);
            context.font = "" + fontParameters.fontSize + "px Arial";

            var textX = (data.handles.start.x + data.handles.end.x) / 2 / fontParameters.fontScale;
            var textY = (data.handles.start.y + data.handles.end.y) / 2 / fontParameters.fontScale;
            context.fillText(text, textX, textY);
            context.restore();
        }

    }
    ///////// END IMAGE RENDERING ///////


    // module exports
    cornerstoneTools.length = cornerstoneTools.mouseButtonTool({
        createNewMeasurement : createNewMeasurement,
        onImageRendered: onImageRendered,
        toolType : toolType
    });

    return cornerstoneTools;
}($, cornerstone, cornerstoneCore, cornerstoneTools));