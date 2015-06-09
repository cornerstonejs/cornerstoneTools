var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    var toolType = "textMarker";

    ///////// BEGIN ACTIVE TOOL ///////
    function createNewMeasurement(mouseEventData)
    {
        var config = cornerstoneTools.textMarker.getConfiguration();

        // create the measurement data for this tool with the end handle activated
        var measurementData = {
            visible: true,
            text: config.current,
            handles: {
                end: {
                    x: mouseEventData.currentPoints.image.x,
                    y: mouseEventData.currentPoints.image.y,
                    highlight: true,
                    active: true
                }
            }
        };

        // Update the current marker for the next marker
        var currentIndex = config.markers.indexOf(config.current);
        if (config.ascending) {
            currentIndex += 1;
            if (currentIndex >= config.markers.length) {
                currentIndex -= config.markers.length;
            }
        } else {
            currentIndex -= 1;
            if (currentIndex < 0) {
                currentIndex += config.markers.length;
            }
        }
        config.current = config.markers[currentIndex];

        return measurementData;
    }
    ///////// END ACTIVE TOOL ///////

    ///////// BEGIN IMAGE RENDERING ///////
    function pointNearTool(data, coords) {
        return cornerstoneMath.point.distance(data.handles.end, coords) < 5;
    }

    function onImageRendered(e, eventData) {

        // if we have no toolData for this element, return immediately as there is nothing to do
        var toolData = cornerstoneTools.getToolState(e.currentTarget, toolType);
        if(toolData === undefined) {
            return;
        }

        // we have tool data for this element - iterate over each one and draw it
        var context = eventData.canvasContext.canvas.getContext("2d");
        cornerstone.setToPixelCoordinateSystem(eventData.enabledElement, context);
        var color;

        // Start the toolData loop at 1, since the first element is just used to store
        // ascending / current / marker data
        for(var i=0; i < toolData.data.length; i++) {
            context.save();
            var data = toolData.data[i];
            
            if (pointNearTool(data, cornerstoneTools.toolCoordinates.getCoords())) {
                data.active = true;
                color = cornerstoneTools.toolColors.getActiveColor();
            } else {
                data.active = false;
                color = cornerstoneTools.toolColors.getToolColor();
            }

            // Draw text
            var fontParameters = cornerstoneTools.setContextToDisplayFontSize(eventData.enabledElement, eventData.canvasContext, 15);
            context.font = "" + fontParameters.fontSize + "px Arial";

            // translate the x/y away from the cursor
            var textX = data.handles.end.x - 4;
            var textY = data.handles.end.y + 3;
            textX = textX / fontParameters.fontScale;
            textY = textY / fontParameters.fontScale;

            context.fillStyle = color;
            context.fillText(data.text, textX, textY);
            context.restore();
        }
    }
    ///////// END IMAGE RENDERING ///////

    // module exports
    cornerstoneTools.textMarker = cornerstoneTools.mouseButtonTool({
        createNewMeasurement : createNewMeasurement,
        onImageRendered: onImageRendered,
        toolType : toolType,
    });

    cornerstoneTools.textMarkerTouch = cornerstoneTools.touchTool({
        createNewMeasurement: createNewMeasurement,
        onImageRendered: onImageRendered,
        toolType: toolType
    });

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));
