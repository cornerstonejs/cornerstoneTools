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
            visible: true,
            active: true,
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
        var config = cornerstoneTools.textMarker.getConfiguration();

        for (var i = 0; i < toolData.data.length; i++) {
            var data = toolData.data[i];

            var color = cornerstoneTools.toolColors.getToolColor();
            if (data.active) {
                color = cornerstoneTools.toolColors.getActiveColor();
            }

            context.save();

            if (config && config.shadow) {
                context.shadowColor = config.shadowColor || '#000000';
                context.shadowOffsetX = config.shadowOffsetX || 1;
                context.shadowOffsetY = config.shadowOffsetY || 1;
            }

            // Draw text
            context.font = font;
            context.fillStyle = color;

            var measureText = context.measureText(data.text);
            data.textWidth = measureText.width;
            data.textHeight = fontSize;

            var coords = {
                x: data.handles.end.x,
                y: data.handles.end.y
            };

            var textCoords = cornerstone.pixelToCanvas(eventData.element, coords);

            cornerstoneTools.drawTextBox(context, data.text, textCoords.x - data.textWidth / 2, textCoords.y, color);

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
            $(element).on('CornerstoneToolsMouseMove', eventData, cornerstoneTools.textMarker.mouseMoveCallback);
            $(element).on('CornerstoneToolsMouseDown', eventData, cornerstoneTools.textMarker.mouseDownCallback);
            $(element).on('CornerstoneToolsMouseDownActivate', eventData, cornerstoneTools.textMarker.mouseDownActivateCallback);
            $(element).on('CornerstoneToolsMouseDoubleClick', eventData, cornerstoneTools.textMarker.mouseDoubleClickCallback);
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

                $(element).off('CornerstoneToolsMouseMove', cornerstoneTools.textMarker.mouseMoveCallback);
                $(element).off('CornerstoneToolsMouseDown', cornerstoneTools.textMarker.mouseDownCallback);
                $(element).off('CornerstoneToolsMouseDownActivate', cornerstoneTools.textMarker.mouseDownActivateCallback);
                $(element).off('CornerstoneToolsMouseDoubleClick', cornerstoneTools.textMarker.mouseDoubleClickCallback);
                // Allow relabelling via a callback
                config.changeTextCallback(data, doneChangingTextCallback);
                
                e.stopImmediatePropagation();
                return false;
            }
        }

        return false; // false = causes jquery to preventDefault() and stopPropagation() this event
    }

    function touchPressCallback(e, eventData) {
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
            $(element).off('CornerstoneToolsTouchDrag', cornerstoneTools.textMarkerTouch.touchMoveCallback);
            $(element).off('CornerstoneToolsTouchStartActive', cornerstoneTools.textMarkerTouch.touchDownActivateCallback);
            $(element).off('CornerstoneToolsTouchStart', cornerstoneTools.textMarkerTouch.touchStartCallback);
            $(element).off('CornerstoneToolsTap', cornerstoneTools.textMarkerTouch.tapCallback);
            $(element).off('CornerstoneToolsTouchPress', cornerstoneTools.textMarkerTouch.pressCallback);

            $(element).on('CornerstoneToolsTouchDrag', cornerstoneTools.textMarkerTouch.touchMoveCallback);
            $(element).on('CornerstoneToolsTouchStartActive', cornerstoneTools.textMarkerTouch.touchDownActivateCallback);
            $(element).on('CornerstoneToolsTouchStart', cornerstoneTools.textMarkerTouch.touchStartCallback);
            $(element).on('CornerstoneToolsTap', cornerstoneTools.textMarkerTouch.tapCallback);
            $(element).on('CornerstoneToolsTouchPress', cornerstoneTools.textMarkerTouch.pressCallback);
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

                $(element).off('CornerstoneToolsTouchDrag', cornerstoneTools.textMarkerTouch.touchMoveCallback);
                $(element).off('CornerstoneToolsTouchStartActive', cornerstoneTools.textMarkerTouch.touchDownActivateCallback);
                $(element).off('CornerstoneToolsTouchStart', cornerstoneTools.textMarkerTouch.touchStartCallback);
                $(element).off('CornerstoneToolsTap', cornerstoneTools.textMarkerTouch.tapCallback);
                $(element).off('CornerstoneToolsTouchPress', cornerstoneTools.textMarkerTouch.pressCallback);
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
        pressCallback: touchPressCallback
    });

    ///////// END IMAGE RENDERING ///////

})($, cornerstone, cornerstoneTools);
