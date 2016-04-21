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

        // Create a rectangle representing the image
        var imageRect = {
            left: 0,
            top: 0,
            width: mouseEventData.image.width,
            height: mouseEventData.image.height
        };

        // Check if the current handle is outside the image,
        // If it is, prevent the handle creation
        if (!cornerstoneMath.point.insideRect(measurementData.handles.end, imageRect)) {
            return;
        }

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
        if (!data.textBoundingBox) {
            return;
        }

        var distanceToPoint = cornerstoneMath.rect.distanceToPoint(data.textBoundingBox, coords);
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
            context.fillStyle = color;
            var measureText = context.measureText(data.text);
            data.textWidth = measureText.width + 10;

            var textCoords = cornerstone.pixelToCanvas(eventData.element, data.handles.end);

            var options = {
                centering: {
                    x: true,
                    y: true
                }
            };

            var boundingBox = cornerstoneTools.drawTextBox(context, data.text, textCoords.x, textCoords.y - 10, color, options);
            data.textBoundingBox = boundingBox;

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

            var mouseButtonData = {
                mouseButtonMask: e.data.mouseButtonMask
            };

            $(element).on('CornerstoneToolsMouseMove', mouseButtonData, cornerstoneTools.textMarker.mouseMoveCallback);
            $(element).on('CornerstoneToolsMouseDown', mouseButtonData, cornerstoneTools.textMarker.mouseDownCallback);
            $(element).on('CornerstoneToolsMouseDownActivate', mouseButtonData, cornerstoneTools.textMarker.mouseDownActivateCallback);
            $(element).on('CornerstoneToolsMouseDoubleClick', mouseButtonData, cornerstoneTools.textMarker.mouseDoubleClickCallback);
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
                config.changeTextCallback(data, eventData, doneChangingTextCallback);
                
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

            $(element).on('CornerstoneToolsTouchDrag', cornerstoneTools.textMarkerTouch.touchMoveCallback);
            $(element).on('CornerstoneToolsTouchStartActive', cornerstoneTools.textMarkerTouch.touchDownActivateCallback);
            $(element).on('CornerstoneToolsTouchStart', cornerstoneTools.textMarkerTouch.touchStartCallback);
            $(element).on('CornerstoneToolsTap', cornerstoneTools.textMarkerTouch.tapCallback);
            $(element).on('CornerstoneToolsTouchPress', cornerstoneTools.textMarkerTouch.pressCallback);
        }

        var config = cornerstoneTools.textMarker.getConfiguration();

        var coords = eventData.currentPoints.canvas;
        var toolData = cornerstoneTools.getToolState(element, toolType);

        // now check to see if there is a handle we can move
        if (!toolData) {
            return false;
        }

        if (eventData.handlePressed) {
            eventData.handlePressed.active = true;
            cornerstone.updateImage(element);

            $(element).off('CornerstoneToolsTouchDrag', cornerstoneTools.textMarkerTouch.touchMoveCallback);
            $(element).off('CornerstoneToolsTouchStartActive', cornerstoneTools.textMarkerTouch.touchDownActivateCallback);
            $(element).off('CornerstoneToolsTouchStart', cornerstoneTools.textMarkerTouch.touchStartCallback);
            $(element).off('CornerstoneToolsTap', cornerstoneTools.textMarkerTouch.tapCallback);
            $(element).off('CornerstoneToolsTouchPress', cornerstoneTools.textMarkerTouch.pressCallback);
            
            // Allow relabelling via a callback
            config.changeTextCallback(eventData.handlePressed, eventData, doneChangingTextCallback);
            
            e.stopImmediatePropagation();
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
                config.changeTextCallback(data, eventData, doneChangingTextCallback);
                
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
