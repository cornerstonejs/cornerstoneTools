(function($, cornerstone, cornerstoneTools) {

    'use strict';

    var toolType = 'textMarker';

    ///////// BEGIN ACTIVE TOOL ///////
    function createNewMeasurement(mouseEventData) {
        var config = cornerstoneTools.textMarker.getConfiguration();

        if (!config.current) {
            return;
        }

        // create the measurement data for this tool with the end handle activated
        var measurementData = {
            visible: true, active: true, text: config.current, handles: {
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
                if (!config.loop) {
                    currentIndex = -1;
                } else {
                    currentIndex -= config.markers.length;
                }
            }
        } else {
            currentIndex -= 1;
            if (currentIndex < 0) {
                if (!config.loop) {
                    currentIndex = -1;
                } else {
                    currentIndex += config.markers.length;
                }
            }
        }

        config.current = config.markers[currentIndex];

        return measurementData;
    }
    ///////// END ACTIVE TOOL ///////

    ///////// BEGIN IMAGE RENDERING ///////
    function pointNearTool(element, data, coords) {
        var endCanvas = cornerstone.pixelToCanvas(element, data.handles.end);

        var rect = {
            left: endCanvas.x - data.textWidth / 2,
            top: endCanvas.y,
            width: data.textWidth,
            height: data.textHeight
        };

        var distanceToPoint = cornerstoneMath.rect.distanceToPoint(rect, coords);
        return (distanceToPoint < 10);
    }

    function onImageRendered(e, eventData) {
        // if we have no toolData for this element, return immediately as there is nothing to do
        var toolData = cornerstoneTools.getToolState(eventData.element, toolType);
        if (!toolData) {
            return;
        }

        // we have tool data for this element - iterate over each one and draw it
        var context = eventData.canvasContext.canvas.getContext('2d');
        context.setTransform(1, 0, 0, 1, 0, 0);

        var font = cornerstoneTools.textStyle.getFont();
        var fontSize = cornerstoneTools.textStyle.getFontSize();

        for (var i = 0; i < toolData.data.length; i++) {
            var data = toolData.data[i];

            var color = cornerstoneTools.toolColors.getToolColor();
            if (data.active) {
                color = cornerstoneTools.toolColors.getActiveColor();
            }

            context.save();

            // Draw text
            context.font = font;
            context.fillStyle = color;

            var measureText = context.measureText(data.text);
            data.textWidth = measureText.width;
            data.textHeight = fontSize;

            var coords = {
                x: data.handles.end.x - data.textWidth / 2,
                y: data.handles.end.y
            };

            var textCoords = cornerstone.pixelToCanvas(eventData.element, coords);

            cornerstoneTools.drawTextBox(context, data.text, textCoords.x, textCoords.y, color);

            context.restore();
        }
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
            return false;
        }

        var config = cornerstoneTools.textMarker.getConfiguration();

        var coords = eventData.currentPoints.canvas;
        var toolData = cornerstoneTools.getToolState(element, toolType);

        // now check to see if there is a handle we can move
        if (!toolData) {
            return false;
        }

        for (var i = 0; i < toolData.data.length; i++) {
            data = toolData.data[i];
            if (pointNearTool(element, data, coords)) {
                data.active = true;
                cornerstone.updateImage(element);
                // Allow relabelling via a callback
                config.changeTextCallback(data, doneChangingTextCallback);
                
                e.stopImmediatePropagation();
                return false;
            }
        }

        return false; // false = causes jquery to preventDefault() and stopPropagation() this event
    }

    cornerstoneTools.textMarker = cornerstoneTools.mouseButtonTool({
        createNewMeasurement: createNewMeasurement,
        onImageRendered: onImageRendered,
        pointNearTool: pointNearTool,
        toolType: toolType,
        mouseDoubleClickCallback: doubleClickCallback
    });

    cornerstoneTools.textMarkerTouch = cornerstoneTools.touchTool({
        createNewMeasurement: createNewMeasurement,
        onImageRendered: onImageRendered,
        pointNearTool: pointNearTool,
        toolType: toolType,
        pressCallback: doubleClickCallback
    });

    ///////// END IMAGE RENDERING ///////

})($, cornerstone, cornerstoneTools);
