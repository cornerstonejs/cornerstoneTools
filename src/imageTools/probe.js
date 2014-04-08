var cornerstoneTools = (function ($, cornerstone, csc, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    var toolType = "probe";

    function createNewMeasurement(mouseEventData)
    {
        // create the measurement data for this tool with the end handle activated
        var measurementData = {
            visible : true,
            handles : {
                end: {
                    x : mouseEventData.currentPoints.image.x,
                    y : mouseEventData.currentPoints.image.y,
                    highlight: true,
                    active: true
                }
            }
        };

        // associate this data with this imageId so we can render it and manipulate it
        cornerstoneTools.addToolState(mouseEventData.element, toolType, measurementData);

        // since we are dragging to another place to drop the end point, we can just activate
        // the end point and let the moveHandle move it for us.
        $(mouseEventData.element).off('CornerstoneToolsMouseMove', mouseMoveCallback);
        cornerstoneTools.moveHandle(mouseEventData, measurementData.handles.end, function() {
            if(cornerstoneTools.anyHandlesOutsideImage(mouseEventData, measurementData.handles))
            {
                // delete the measurement
                cornerstoneTools.removeToolState(mouseEventData.element, toolType, measurementData);
            }
            $(mouseEventData.element).on('CornerstoneToolsMouseMove', mouseMoveCallback);
        });
    }


    function mouseMoveCallback(e) {

        var eventData = e.data;
        var mouseMoveData = e.originalEvent.detail;

        // if a mouse button is down, do nothing
        if(e.originalEvent.detail.which !== 0) {
            return;
        }

        // if we have no tool data for this element, do nothing
        var toolData = cornerstoneTools.getToolState(mouseMoveData.element, toolType);
        if(toolData === undefined) {
            return;
        }

        // We have tool data, search through all data
        // and see if we can activate a handle
        var imageNeedsUpdate = false;
        for(var i=0; i < toolData.data.length; i++) {
            // get the cursor position in image coordinates
            var data = toolData.data[i];
            if(cornerstoneTools.handleActivator(data.handles, mouseMoveData.currentPoints.image, mouseMoveData.viewport.scale ) === true)
            {
                imageNeedsUpdate = true;
            }
        }

        // Handle activation status changed, redraw the image
        if(imageNeedsUpdate === true) {
            cornerstone.updateImage(mouseMoveData.element);
        }
    }

    function pointNearTool(data, coords)
    {
        var distanceSquared = cornerstoneTools.point.distanceSquared(data.handles.end, coords);
        return (distanceSquared < 25);
    }

    function mouseDownCallback(e) {
        console.log('probe - mouseDownCallback');
        var eventData = e.data;
        var mouseDownData = e.originalEvent.detail;
        var data;

        function handleDoneMove()
        {
            if(cornerstoneTools.anyHandlesOutsideImage(mouseDownData, data.handles))
            {
                // delete the measurement
                cornerstoneTools.removeToolState(mouseDownData.element, toolType, data);
            }
            $(mouseDownData.element).on('CornerstoneToolsMouseMove', mouseMoveCallback);
        }

        if(cornerstoneTools.isMouseButtonEnabled(mouseDownData.which, eventData.mouseButtonMask)) {
            var element = mouseDownData.element;
            var viewport = mouseDownData.viewport;
            var coords = mouseDownData.startPoints.image;
            var toolData = cornerstoneTools.getToolState(e.currentTarget, toolType);

            // now check to see if we have a tool that we can move
            if(toolData !== undefined) {
                for(var i=0; i < toolData.data.length; i++) {
                    data = toolData.data[i];
                    if(pointNearTool(data, coords)) {
                        $(mouseDownData.element).off('CornerstoneToolsMouseMove', mouseMoveCallback);
                        cornerstoneTools.moveHandle(mouseDownData, data.handles.end, handleDoneMove);
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        return;
                    }
                }
            }

            // If we are "active" start drawing a new measurement
            if(eventData.active === true) {
                // no existing measurements care about this, draw a new measurement
                createNewMeasurement(mouseDownData);
                e.preventDefault();
                e.stopImmediatePropagation();
                return false;
            }

        }
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

            // draw the handles
            context.beginPath();
            cornerstoneTools.drawHandles(context, renderData, data.handles);
            context.stroke();

            // Draw text
            var fontParameters = csc.setToFontCoordinateSystem(renderData.enabledElement, renderData.canvasContext, 15);
            context.font = "" + fontParameters.fontSize + "px Arial";

            // translate the x/y away from the cursor
            var x = Math.round(data.handles.end.x);
            var y = Math.round(data.handles.end.y);
            textX = data.handles.end.x + 3;
            textY = data.handles.end.y - 3;

            var textX = textX / fontParameters.fontScale;
            var textY = textY / fontParameters.fontScale;

            context.fillStyle = "white";

            var storedPixels = cornerstone.getStoredPixels(renderData.element, x, y, 1, 1);
            var sp = storedPixels[0];
            var mo = sp * renderData.image.slope + renderData.image.intercept;

            context.fillText("" + x + "," + y, textX, textY);
            context.fillText("SP: " + sp + " MO: " + mo, textX, textY + fontParameters.lineHeight);

            context.restore();
        }
    }

    // not visible, not interactive
    function disable(element)
    {
        $(element).off("CornerstoneImageRendered", onImageRendered);
        $(element).off('CornerstoneToolsMouseMove', mouseMoveCallback);
        $(element).off('CornerstoneToolsMouseDown', mouseDownCallback);
        cornerstone.updateImage(element);
    }

    // visible but not interactive
    function enable(element)
    {
        $(element).on("CornerstoneImageRendered", onImageRendered);
        $(element).off('CornerstoneToolsMouseMove', mouseMoveCallback);
        $(element).off('CornerstoneToolsMouseDown', mouseDownCallback);
        cornerstone.updateImage(element);
    }

    // visible, interactive and can create
    function activate(element, mouseButtonMask) {
        var eventData = {
            mouseButtonMask: mouseButtonMask,
            active: true
        };
        $(element).off("CornerstoneToolsMouseMove", mouseMoveCallback);
        $(element).off("CornerstoneToolsMouseDown", mouseDownCallback);
        $(element).on("CornerstoneImageRendered", onImageRendered);
        $(element).on("CornerstoneToolsMouseMove", eventData, mouseMoveCallback);
        $(element).on('CornerstoneToolsMouseDown', eventData, mouseDownCallback);
        cornerstone.updateImage(element);
    }

    // visible, interactive
    function deactivate(element, mouseButtonMask) {
        var eventData = {
            mouseButtonMask: mouseButtonMask,
            active: false
        };
        $(element).off("CornerstoneToolsMouseMove", mouseMoveCallback);
        $(element).off("CornerstoneToolsMouseDown", mouseDownCallback);
        $(element).on("CornerstoneImageRendered", onImageRendered);
        $(element).on("CornerstoneToolsMouseMove", eventData, mouseMoveCallback);
        $(element).on('CornerstoneToolsMouseDown', eventData, mouseDownCallback);
        cornerstone.updateImage(element);
    }

    // module exports
    cornerstoneTools.probe = {
        enable: enable,
        disable : disable,
        activate: activate,
        deactivate: deactivate
    };

    return cornerstoneTools;
}($, cornerstone, cornerstoneCore, cornerstoneTools));