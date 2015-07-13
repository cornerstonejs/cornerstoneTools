var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if (cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    var toolType = "textMarker";
    var configuration = {};

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
            width : data.textWidth,
            height : data.textHeight
        };

        var distanceToPoint = cornerstoneMath.rect.distanceToPoint(rect, coords);
        return (distanceToPoint < 10);
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

        var color;
        var font = cornerstoneTools.textStyle.getFont();
        var fontSize = cornerstoneTools.textStyle.getFontSize();

        var viewport = cornerstone.getViewport(eventData.element);

        for (var i=0; i < toolData.data.length; i++) {
            var data = toolData.data[i];

            if (data.active) {
                color = cornerstoneTools.toolColors.getActiveColor();
            } else {
                color = cornerstoneTools.toolColors.getToolColor();
            }

            context.save();

            // Draw text
            context.font = font;
            context.fillStyle = color;

            var measureText = context.measureText(data.text);
            data.textWidth = measureText.width / viewport.scale;
            data.textHeight = fontSize / viewport.scale;

            var coords = {
                x: data.handles.end.x - data.textWidth / 2,
                y: data.handles.end.y
            };

            var textCoords = cornerstone.pixelToCanvas(eventData.element, coords);

            cornerstoneTools.drawTextBox(context, data.text, textCoords.x, textCoords.y, color);

            context.restore();
        }
    }

    ///////// BEGIN ACTIVE TOOL ///////
    function addNewMeasurement(mouseEventData) {
        var measurementData = createNewMeasurement(mouseEventData);

        if (!measurementData) {
            return;
        }
        // associate this data with this imageId so we can render it and manipulate it
        cornerstoneTools.addToolState(mouseEventData.element, toolType, measurementData);
       

        // since we are dragging to another place to drop the end point, we can just activate
        // the end point and let the moveHandle move it for us.
        $(mouseEventData.element).off('CornerstoneToolsMouseMove', mouseMoveCallback);
        cornerstoneTools.moveHandle(mouseEventData, measurementData.handles.end, function() {
            measurementData.active = false;
            if (cornerstoneTools.anyHandlesOutsideImage(mouseEventData, measurementData.handles)) {
                // delete the measurement
                cornerstoneTools.removeToolState(mouseEventData.element, toolType, measurementData);
            }
            $(mouseEventData.element).on('CornerstoneToolsMouseMove', mouseMoveCallback);
        });
    }

    function mouseDoubleClickCallback(e, eventData) {
        var data;

        function doneChangingTextCallback(data, updatedText) {
            data.text = updatedText;
            cornerstone.updateImage(eventData.element);
        }

        if (cornerstoneTools.isMouseButtonEnabled(eventData.which, e.data.mouseButtonMask)) {
            var config = cornerstoneTools.textMarker.getConfiguration();

            var coords = eventData.startPoints.canvas;
            var toolData = cornerstoneTools.getToolState(e.currentTarget, toolType);
            
            var i;

            // now check to see if there is a handle we can move
            if (toolData !== undefined) {
                for (i=0; i < toolData.data.length; i++) {
                    data = toolData.data[i];
                    if (pointNearTool(eventData.element, data, coords)) {
                        // Allow relabelling via a callback
                        config.changeTextCallback(data, doneChangingTextCallback);
                        
                        e.stopImmediatePropagation();
                        return false;
                    }
                }
            }
            return false; // false = causes jquery to preventDefault() and stopPropagation() this event
        }
    }

    function mouseDownActivateCallback(e, eventData) {
        if (cornerstoneTools.isMouseButtonEnabled(eventData.which, e.data.mouseButtonMask)) {
            addNewMeasurement(eventData);
            return false; // false = causes jquery to preventDefault() and stopPropagation() this event
        }
    }
    ///////// END ACTIVE TOOL ///////

    ///////// BEGIN DEACTIVE TOOL ///////

    function mouseMoveCallback(e, eventData) {
        cornerstoneTools.toolCoordinates.setCoords(eventData);
        // if a mouse button is down, do nothing
        if (eventData.which !== 0) {
            return;
        }
      
        
        // if we have no tool data for this element, do nothing
        var toolData = cornerstoneTools.getToolState(eventData.element, toolType);
        if (toolData === undefined) {
            return;
        }
        
        var coords = eventData.startPoints.canvas;

        // We have tool data, search through all data
        // and see if we can activate a handle
        var imageNeedsUpdate = false;
        for (var i=0; i < toolData.data.length; i++) {
            var data = toolData.data[i];
            if (cornerstoneTools.handleActivator(eventData.element, data.handles, coords) === true) {
                imageNeedsUpdate = true;
            }
            
            if ((pointNearTool(eventData.element, data, coords) && !data.active) ||
                (!pointNearTool(eventData.element, data, coords) && data.active)) {
                data.active = !data.active;
                imageNeedsUpdate = true;
            }
        }

        // Handle activation status changed, redraw the image
        if (imageNeedsUpdate === true) {
            cornerstone.updateImage(eventData.element);
        }
    }

    function mouseDownCallback(e, eventData) {
        var data;

        function handleDoneMove() {
            data.active = false;
            if (cornerstoneTools.anyHandlesOutsideImage(eventData, data.handles)) {
                // delete the measurement
                cornerstoneTools.removeToolState(eventData.element, toolType, data);
            }
            cornerstone.updateImage(eventData.element);
            $(eventData.element).on('CornerstoneToolsMouseMove', mouseMoveCallback);
        }

        if (cornerstoneTools.isMouseButtonEnabled(eventData.which, e.data.mouseButtonMask)) {
            var coords = eventData.startPoints.canvas;
            var toolData = cornerstoneTools.getToolState(e.currentTarget, toolType);

            var i;

            // now check to see if there is a handle we can move
            if (toolData !== undefined) {
                for (i=0; i < toolData.data.length; i++) {
                    data = toolData.data[i];
                    var handle = cornerstoneTools.getHandleNearImagePoint(eventData.element, data, coords);
                    if (handle !== undefined) {
                        data.active = true;

                        // Allow tool data deletion if shift key is held
                        if (eventData.event.shiftKey) {
                            cornerstoneTools.removeToolState(eventData.element, toolType, data);
                            cornerstone.updateImage(eventData.element);

                            e.stopImmediatePropagation();
                            return false;
                        }

                        $(eventData.element).off('CornerstoneToolsMouseMove', mouseMoveCallback);
                        cornerstoneTools.moveHandle(eventData, handle, handleDoneMove);
                        e.stopImmediatePropagation();
                        return false;
                    }
                }
            }

            // Now check to see if there is a line we can move
            // now check to see if we have a tool that we can move
            if (toolData !== undefined && pointNearTool !== undefined) {
                for (i=0; i < toolData.data.length; i++) {
                    data = toolData.data[i];
                    if (pointNearTool(eventData.element, data, coords)) {
                        $(eventData.element).off('CornerstoneToolsMouseMove', mouseMoveCallback);
                        cornerstoneTools.moveAllHandles(e, data, toolData, true);
                        $(eventData.element).on('CornerstoneToolsMouseMove', mouseMoveCallback);
                        e.stopImmediatePropagation();
                        return false;
                    }
                }
            }
        }
    }
    ///////// END DEACTIVE TOOL ///////



    // not visible, not interactive
    function disable(element) {
        $(element).off("CornerstoneImageRendered", onImageRendered);
        $(element).off('CornerstoneToolsMouseMove', mouseMoveCallback);
        $(element).off('CornerstoneToolsMouseDown', mouseDownCallback);
        $(element).off('CornerstoneToolsMouseDownActivate', mouseDownActivateCallback);
        $(element).off('CornerstoneToolsMouseDoubleClick', mouseDoubleClickCallback);

        cornerstone.updateImage(element);
    }

    // visible but not interactive
    function enable(element) {
        $(element).off("CornerstoneImageRendered", onImageRendered);
        $(element).off('CornerstoneToolsMouseMove', mouseMoveCallback);
        $(element).off('CornerstoneToolsMouseDown', mouseDownCallback);
        $(element).off('CornerstoneToolsMouseDownActivate', mouseDownActivateCallback);
        $(element).off('CornerstoneToolsMouseDoubleClick', mouseDoubleClickCallback);

        $(element).on("CornerstoneImageRendered", onImageRendered);

        cornerstone.updateImage(element);
    }

    // visible, interactive and can create
    function activate(element, mouseButtonMask) {
        var eventData = {
            mouseButtonMask: mouseButtonMask,
        };

        $(element).off("CornerstoneImageRendered", onImageRendered);
        $(element).off("CornerstoneToolsMouseMove", mouseMoveCallback);
        $(element).off("CornerstoneToolsMouseDown", mouseDownCallback);
        $(element).off('CornerstoneToolsMouseDownActivate', mouseDownActivateCallback);
        $(element).off('CornerstoneToolsMouseDoubleClick', mouseDoubleClickCallback);

        $(element).on("CornerstoneImageRendered", onImageRendered);
        $(element).on("CornerstoneToolsMouseMove", eventData, mouseMoveCallback);
        $(element).on('CornerstoneToolsMouseDown', eventData, mouseDownCallback);
        $(element).on('CornerstoneToolsMouseDownActivate', eventData, mouseDownActivateCallback);
        $(element).on('CornerstoneToolsMouseDoubleClick', eventData, mouseDoubleClickCallback);

        cornerstone.updateImage(element);
    }

    // visible, interactive
    function deactivate(element, mouseButtonMask) {
        var eventData = {
            mouseButtonMask: mouseButtonMask,
        };

        $(element).off("CornerstoneImageRendered", onImageRendered);
        $(element).off("CornerstoneToolsMouseMove", mouseMoveCallback);
        $(element).off("CornerstoneToolsMouseDown", mouseDownCallback);
        $(element).off('CornerstoneToolsMouseDownActivate', mouseDownActivateCallback);
        $(element).off('CornerstoneToolsMouseDoubleClick', mouseDoubleClickCallback);

        $(element).on("CornerstoneImageRendered", onImageRendered);
        $(element).on("CornerstoneToolsMouseMove", eventData, mouseMoveCallback);
        $(element).on('CornerstoneToolsMouseDown', eventData, mouseDownCallback);
        $(element).on('CornerstoneToolsMouseDoubleClick', eventData, mouseDoubleClickCallback);

        cornerstone.updateImage(element);
    }

    function getConfiguration() {
        return configuration;
    }
    
    function setConfiguration(config) {
        configuration = config;
    }

    cornerstoneTools.textMarker = {
        enable: enable,
        disable : disable,
        activate: activate,
        deactivate: deactivate,
        getConfiguration: getConfiguration,
        setConfiguration: setConfiguration,
        pointNearTool: pointNearTool
    };
    ///////// END IMAGE RENDERING ///////

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));
