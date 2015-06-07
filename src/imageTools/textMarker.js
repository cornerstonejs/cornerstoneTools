var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    var toolType = "textMarker";

    ///////// BEGIN ACTIVE TOOL ///////
    function createNewMeasurement(mouseEventData)
    {
        var toolData = cornerstoneTools.getToolState(element, toolType);
        if (!toolData) {
            return;
        }

        var data = toolData.data[0];

        // create the measurement data for this tool with the end handle activated
        var measurementData = {
            visible: true,
            text: data.current,
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
        var currentIndex = data.markers.indexOf(data.current);
        if (data.ascending) {
            currentIndex += 1;
            if (currentIndex >= data.markers.length) {
                currentIndex -= data.markers.length;
            }
        } else {
            currentIndex -= 1;
            if (currentIndex < 0) {
                currentIndex += data.markers.length;
            }
        }
        data.current = data.markers[currentIndex];

        return measurementData;
    }
    ///////// END ACTIVE TOOL ///////

    ///////// BEGIN IMAGE RENDERING ///////
    function pointNearTool(data, coords) {
        return  cornerstoneMath.point.distance(data.handles.end, coords) < 5;
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
        for(var i=1; i < toolData.data.length; i++) {
            context.save();
            var data = toolData.data[i];
            
            if (pointNearTool(data, cornerstoneTools.toolCoordinates.getCoords())) {
                data.active = true;
                color = cornerstoneTools.toolColors.getActiveColor();
            } else {
                data.active = false;
                color = cornerstoneTools.toolColors.getToolColor();
            }

            // draw the handles
            context.beginPath();
            cornerstoneTools.drawHandles(context, eventData, data.handles, color);
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

            context.fillStyle = color;
            context.fillText(data.text, textX, textY);
            context.restore();
        }
    }
    ///////// END IMAGE RENDERING ///////

    function enable(element, options)
    {
        console.log(options);
        var toolData = cornerstoneTools.getToolState(element, toolType);
        if (toolData === undefined) {
            if (options === undefined) {
                options = {
                    'markers' : ['C1', 'C2', 'C3', 'C3', 'C4', 'C5'],
                    'current': 'C1',
                    'ascending': true
                };
            }
            cornerstoneTools.addToolState(element, toolType, options);
        }

        $(element).off("CornerstoneImageRendered", onImageRendered);
        $(element).off('CornerstoneToolsMouseMove', cornerstoneTools.mouseButtonTool.mouseMoveCallback);
        $(element).off('CornerstoneToolsMouseDown', cornerstoneTools.mouseButtonTool.mouseDownCallback);
        $(element).off('CornerstoneToolsMouseDownActivate', cornerstoneTools.mouseButtonTool.mouseDownActivateCallback);

        $(element).on("CornerstoneImageRendered", onImageRendered);

        cornerstone.updateImage(element);
    }

    // module exports
    cornerstoneTools.textMarker = cornerstoneTools.mouseButtonTool({
        createNewMeasurement : createNewMeasurement,
        onImageRendered: onImageRendered,
        toolType : toolType,
    });

    cornerstoneTools.textMarker.enable = enable;

    cornerstoneTools.textMarkerTouch = cornerstoneTools.touchTool({
        createNewMeasurement: createNewMeasurement,
        onImageRendered: onImageRendered,
        toolType: toolType
    });

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));
