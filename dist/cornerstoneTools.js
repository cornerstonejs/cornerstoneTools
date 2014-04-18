/*! cornerstoneTools - v0.2.2 - 2014-04-18 | (c) 2014 Chris Hafey | https://github.com/chafey/cornerstoneTools */
// Begin Source: src/inputSources/mouseWheelInput.js
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function mouseWheel(e)
    {
        // !!!HACK/NOTE/WARNING!!!
        // for some reason I am getting mousewheel and DOMMouseScroll events on my
        // mac os x mavericks system when middle mouse button dragging.
        // I couldn't find any info about this so this might break other systems
        // webkit hack
        if(e.originalEvent.type === "mousewheel" && e.originalEvent.wheelDeltaY === 0) {
            return;
        }
        // firefox hack
        if(e.originalEvent.type === "DOMMouseScroll" && e.originalEvent.axis ===1) {
            return;
        }

        var element = e.currentTarget;
        var startingCoords = cornerstone.pageToPixel(element, e.pageX, e.pageY);

        e = window.event || e; // old IE support
        var wheelDelta = e.wheelDelta || -e.detail || -e.originalEvent.detail;
        var direction = Math.max(-1, Math.min(1, (wheelDelta)));

        var mouseWheelData = {
            element: element,
            viewport: cornerstone.getViewport(element),
            image: cornerstone.getEnabledElement(element).image,
            direction : direction,
            pageX : e.pageX,
            pageY: e.pageY,
            imageX : startingCoords.x,
            imageY : startingCoords.y
        };

        var event = new CustomEvent(
            "CornerstoneToolsMouseWheel",
            {
                detail: {
                    event: e,
                    direction: direction,
                    viewport: cornerstone.getViewport(element),
                    image: cornerstone.getEnabledElement(element).image,
                    element: element
                },
                bubbles: false,
                cancelable: false
            }
        );
        element.dispatchEvent(event);
    }


    var mouseWheelEvents = "mousewheel DOMMouseScroll";

    function enable(element)
    {
        $(element).on(mouseWheelEvents, mouseWheel);
    }

    function disable(element) {
        $(element).unbind(mouseWheelEvents, mouseWheel);
    }

    // module exports
    cornerstoneTools.mouseWheelInput = {
        enable : enable,
        disable : disable
    };

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools)); 
// End Source; src/inputSources/mouseWheelInput.js

// Begin Source: src/inputSources/mouseInput.js
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function activateMouseDown(mouseEventDetail)
    {
        var event = new CustomEvent(
            "CornerstoneToolsMouseDownActivate",
            {
                detail: mouseEventDetail,
                bubbles: false,
                cancelable: true
            }
        );
        mouseEventDetail.element.dispatchEvent(event);
    }


    function mouseDown(e) {
        var eventData = e.data;
        var element = e.currentTarget;

        var startPoints = {
            page: cornerstoneTools.point.pageToPoint(e),
            image: cornerstone.pageToPixel(element, e.pageX, e.pageY)
        };
        var lastPoints = cornerstoneTools.copyPoints(startPoints);
        var mouseEventDetail = {
                event: e,
                which: e.which,
                viewport: cornerstone.getViewport(element),
                image: cornerstone.getEnabledElement(element).image,
                element: element,
                startPoints: startPoints,
                lastPoints: lastPoints,
                currentPoints: startPoints,
                deltaPoints: {x: 0, y:0}
            };

        var event = new CustomEvent(
            "CornerstoneToolsMouseDown",
            {
                detail: mouseEventDetail,
                bubbles: false,
                cancelable: true
            }
        );
        if(element.dispatchEvent(event) === true)
        {
            // no tools responded to this event, give the active tool a chance
            if(activateMouseDown(mouseEventDetail) === true)
            {
                return cornerstoneTools.pauseEvent(e);
            }
        }

        var whichMouseButton = e.which;

        function onMouseMove(e) {

            // calculate our current points in page and image coordinates
            var currentPoints = {
                page: cornerstoneTools.point.pageToPoint(e),
                image: cornerstone.pageToPixel(element, e.pageX, e.pageY)
            };

            // Calculate delta values in page and image coordinates
            var deltaPoints = {
                page: cornerstoneTools.point.subtract(currentPoints.page, lastPoints.page),
                image: cornerstoneTools.point.subtract(currentPoints.image, lastPoints.image)
            };

            var event = new CustomEvent(
                "CornerstoneToolsMouseDrag",
                {
                    detail: {
                        event: e,
                        which: whichMouseButton,
                        viewport: cornerstone.getViewport(element),
                        image: cornerstone.getEnabledElement(element).image,
                        element: element,
                        startPoints: startPoints,
                        lastPoints: lastPoints,
                        currentPoints: currentPoints,
                        deltaPoints: deltaPoints
                    },
                    bubbles: false,
                    cancelable: true
                }
            );

            element.dispatchEvent(event);

            // update the last points
            lastPoints = cornerstoneTools.copyPoints(currentPoints);

            // prevent left click selection of DOM elements
            return cornerstoneTools.pauseEvent(e);
        }


        // hook mouseup so we can unbind our event listeners
        // when they stop dragging
        function onMouseUp(e) {

            // calculate our current points in page and image coordinates
            var currentPoints = {
                page: cornerstoneTools.point.pageToPoint(e),
                image: cornerstone.pageToPixel(element, e.pageX, e.pageY)
            };

            // Calculate delta values in page and image coordinates
            var deltaPoints = {
                page: cornerstoneTools.point.subtract(currentPoints.page, lastPoints.page),
                image: cornerstoneTools.point.subtract(currentPoints.image, lastPoints.image)
            };

            var event = new CustomEvent(
                "CornerstoneToolsMouseUp",
                {
                    detail: {
                        event: e,
                        which: whichMouseButton,
                        viewport: cornerstone.getViewport(element),
                        image: cornerstone.getEnabledElement(element).image,
                        element: element,
                        startPoints: startPoints,
                        lastPoints: lastPoints,
                        currentPoints: currentPoints,
                        deltaPoints: deltaPoints
                    },
                    bubbles: false,
                    cancelable: false
                }
            );
            element.dispatchEvent(event);

            $(document).off('mousemove', onMouseMove);
            $(document).off('mouseup', onMouseUp);
        }

        $(document).on("mousemove", onMouseMove);
        $(document).on("mouseup", onMouseUp);


        return cornerstoneTools.pauseEvent(e);
    }

    function mouseMove(e) {
        var eventData = e.data;
        var element = e.currentTarget;

        var startPoints = {
            page: cornerstoneTools.point.pageToPoint(e),
            image: cornerstone.pageToPixel(element, e.pageX, e.pageY)
        };
        var lastPoints = cornerstoneTools.copyPoints(startPoints);

        var whichMouseButton = e.which;


        // calculate our current points in page and image coordinates
        var currentPoints = {
            page: cornerstoneTools.point.pageToPoint(e),
            image: cornerstone.pageToPixel(element, e.pageX, e.pageY)
        };

        // Calculate delta values in page and image coordinates
        var deltaPoints = {
            page: cornerstoneTools.point.subtract(currentPoints.page, lastPoints.page),
            image: cornerstoneTools.point.subtract(currentPoints.image, lastPoints.image)
        };

        var event = new CustomEvent(
            "CornerstoneToolsMouseMove",
            {
                detail: {
                    event: e,
                    which: whichMouseButton,
                    viewport: cornerstone.getViewport(element),
                    image: cornerstone.getEnabledElement(element).image,
                    element: element,
                    startPoints: startPoints,
                    lastPoints: lastPoints,
                    currentPoints: currentPoints,
                    deltaPoints: deltaPoints
                },
                bubbles: false,
                cancelable: false
            }
        );
        element.dispatchEvent(event);

        // update the last points
        lastPoints = cornerstoneTools.copyPoints(currentPoints);

        // prevent left click selection of DOM elements
        //return cornerstoneTools.pauseEvent(e);
    }

    function enable(element)
    {
        $(element).on("mousedown", mouseDown);
        $(element).on("mousemove", mouseMove);
    }

    function disable(element) {
        $(element).off("mousedown", mouseDown);
        $(element).off("mousemove", mouseMove);
    }

    // module exports
    cornerstoneTools.mouseInput = {
        enable : enable,
        disable : disable
    };

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools)); 
// End Source; src/inputSources/mouseInput.js

// Begin Source: src/imageTools/simpleMouseButtonTool.js
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function simpleMouseButtonTool(mouseDownCallback)
    {
        var toolInterface = {
            activate: function(element, mouseButtonMask) {
                $(element).off('CornerstoneToolsMouseDownActivate', mouseDownCallback);
                var eventData = {
                    mouseButtonMask: mouseButtonMask
                };
                $(element).on("CornerstoneToolsMouseDownActivate", eventData, mouseDownCallback);
            },
            disable : function(element) {$(element).off('CornerstoneToolsMouseDownActivate', mouseDownCallback);},
            enable : function(element) {$(element).off('CornerstoneToolsMouseDownActivate', mouseDownCallback);},
            deactivate : function(element) {$(element).off('CornerstoneToolsMouseDownActivate', mouseDownCallback);},
        };
        return toolInterface;
    }

    // module exports
    cornerstoneTools.simpleMouseButtonTool = simpleMouseButtonTool;
    return cornerstoneTools;
}($, cornerstone, cornerstoneTools)); 
// End Source; src/imageTools/simpleMouseButtonTool.js

// Begin Source: src/imageTools/mouseButtonTool.js
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

/*
    mouseToolInterface = {
        createNewMeasurement : function() {},
        onImageRendered: function() {},
        toolType : "probe",
    };

 */

    function mouseButtonTool(mouseToolInterface)
    {
        ///////// BEGIN ACTIVE TOOL ///////
        function addNewMeasurement(mouseEventData)
        {
            var measurementData = mouseToolInterface.createNewMeasurement(mouseEventData);

            // associate this data with this imageId so we can render it and manipulate it
            cornerstoneTools.addToolState(mouseEventData.element, mouseToolInterface.toolType, measurementData);

            // since we are dragging to another place to drop the end point, we can just activate
            // the end point and let the moveHandle move it for us.
            $(mouseEventData.element).off('CornerstoneToolsMouseMove', mouseMoveCallback);
            cornerstoneTools.moveHandle(mouseEventData, measurementData.handles.end, function() {
                if(cornerstoneTools.anyHandlesOutsideImage(mouseEventData, measurementData.handles))
                {
                    // delete the measurement
                    cornerstoneTools.removeToolState(mouseEventData.element, mouseToolInterface.toolType, measurementData);
                }
                $(mouseEventData.element).on('CornerstoneToolsMouseMove', mouseMoveCallback);
            });
        }

        function mouseDownActivateCallback(e) {
            var mouseDownData = e.originalEvent.detail;
            var eventData = e.data;
            if (cornerstoneTools.isMouseButtonEnabled(mouseDownData.which, eventData.mouseButtonMask)) {
                addNewMeasurement(mouseDownData);
                return false; // false = cases jquery to preventDefault() and stopPropagation() this event
            }
        }
        ///////// END ACTIVE TOOL ///////

        ///////// BEGIN DEACTIVE TOOL ///////

        function mouseMoveCallback(e)
        {
            var mouseMoveData = e.originalEvent.detail;

            // if a mouse button is down, do nothing
            if(mouseMoveData.which !== 0) {
                return;
            }

            // if we have no tool data for this element, do nothing
            var toolData = cornerstoneTools.getToolState(mouseMoveData.element, mouseToolInterface.toolType);
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

        function getHandleNearImagePoint(data, coords)
        {
            for(var handle in data.handles) {
                var distanceSquared = cornerstoneTools.point.distanceSquared(data.handles[handle], coords);
                if(distanceSquared < 25)
                {
                    return data.handles[handle];
                }
            }
        }

        function mouseDownCallback(e) {
            var eventData = e.data;
            var mouseDownData = e.originalEvent.detail;
            var data;

            function handleDoneMove()
            {
                if(cornerstoneTools.anyHandlesOutsideImage(mouseDownData, data.handles))
                {
                    // delete the measurement
                    cornerstoneTools.removeToolState(mouseDownData.element, mouseToolInterface.toolType, data);
                }
                $(mouseDownData.element).on('CornerstoneToolsMouseMove', mouseMoveCallback);
            }

            if(cornerstoneTools.isMouseButtonEnabled(mouseDownData.which, eventData.mouseButtonMask)) {
                var coords = mouseDownData.startPoints.image;
                var toolData = cornerstoneTools.getToolState(e.currentTarget, mouseToolInterface.toolType);

                var i;

                // now check to see if there is a handle we can move
                if(toolData !== undefined) {
                    for(i=0; i < toolData.data.length; i++) {
                        data = toolData.data[i];
                        var handle = getHandleNearImagePoint(data, coords);
                        if(handle !== undefined) {
                            $(mouseDownData.element).off('CornerstoneToolsMouseMove', mouseMoveCallback);
                            cornerstoneTools.moveHandle(mouseDownData, handle, handleDoneMove);
                            return false; // false = cases jquery to preventDefault() and stopPropagation() this event
                        }
                    }
                }

                // Now check to see if there is a line we can move
                // now check to see if we have a tool that we can move
                if(toolData !== undefined && mouseToolInterface.pointNearTool !== undefined) {
                    for(i=0; i < toolData.data.length; i++) {
                        data = toolData.data[i];
                        if(mouseToolInterface.pointNearTool(data, coords)) {
                            $(mouseDownData.element).off('CornerstoneToolsMouseMove', mouseMoveCallback);
                            cornerstoneTools.moveAllHandles(e, data, toolData, true);
                            return false; // false = cases jquery to preventDefault() and stopPropagation() this event
                        }
                    }
                }
            }
        }
        ///////// END DEACTIVE TOOL ///////



        // not visible, not interactive
        function disable(element)
        {
            $(element).off("CornerstoneImageRendered", mouseToolInterface.onImageRendered);
            $(element).off('CornerstoneToolsMouseMove', mouseMoveCallback);
            $(element).off('CornerstoneToolsMouseDown', mouseDownCallback);
            $(element).off('CornerstoneToolsMouseDownActivate', mouseDownActivateCallback);

            cornerstone.updateImage(element);
        }

        // visible but not interactive
        function enable(element)
        {
            $(element).off("CornerstoneImageRendered", mouseToolInterface.onImageRendered);
            $(element).off('CornerstoneToolsMouseMove', mouseMoveCallback);
            $(element).off('CornerstoneToolsMouseDown', mouseDownCallback);
            $(element).off('CornerstoneToolsMouseDownActivate', mouseDownActivateCallback);

            $(element).on("CornerstoneImageRendered", mouseToolInterface.onImageRendered);

            cornerstone.updateImage(element);
        }

        // visible, interactive and can create
        function activate(element, mouseButtonMask) {
            var eventData = {
                mouseButtonMask: mouseButtonMask,
            };

            $(element).off("CornerstoneImageRendered", mouseToolInterface.onImageRendered);
            $(element).off("CornerstoneToolsMouseMove", mouseMoveCallback);
            $(element).off("CornerstoneToolsMouseDown", mouseDownCallback);
            $(element).off('CornerstoneToolsMouseDownActivate', mouseDownActivateCallback);

            $(element).on("CornerstoneImageRendered", mouseToolInterface.onImageRendered);
            $(element).on("CornerstoneToolsMouseMove", eventData, mouseMoveCallback);
            $(element).on('CornerstoneToolsMouseDown', eventData, mouseDownCallback);
            $(element).on('CornerstoneToolsMouseDownActivate', eventData, mouseDownActivateCallback);

            cornerstone.updateImage(element);
        }

        // visible, interactive
        function deactivate(element, mouseButtonMask) {
            var eventData = {
                mouseButtonMask: mouseButtonMask,
            };

            $(element).off("CornerstoneImageRendered", mouseToolInterface.onImageRendered);
            $(element).off("CornerstoneToolsMouseMove", mouseMoveCallback);
            $(element).off("CornerstoneToolsMouseDown", mouseDownCallback);
            $(element).off('CornerstoneToolsMouseDownActivate', mouseDownActivateCallback);

            $(element).on("CornerstoneImageRendered", mouseToolInterface.onImageRendered);
            $(element).on("CornerstoneToolsMouseMove", eventData, mouseMoveCallback);
            $(element).on('CornerstoneToolsMouseDown', eventData, mouseDownCallback);

            cornerstone.updateImage(element);
        }

        var toolInterface = {
            enable: enable,
            disable : disable,
            activate: activate,
            deactivate: deactivate
        };

        return toolInterface;
    }

    // module exports
    cornerstoneTools.mouseButtonTool = mouseButtonTool;

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools)); 
// End Source; src/imageTools/mouseButtonTool.js

// Begin Source: src/imageTools/mouseWheelTool.js
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function mouseWheelTool(mouseWheelCallback)
    {
        var toolInterface = {
            activate: function(element) {
                $(element).off('CornerstoneToolsMouseWheel', mouseWheelCallback);
                var eventData = {
                };
                $(element).on("CornerstoneToolsMouseWheel", eventData, mouseWheelCallback);
            },
            disable : function(element) {$(element).off('CornerstoneToolsMouseWheel', mouseWheelCallback);},
            enable : function(element) {$(element).off('CornerstoneToolsMouseWheel', mouseWheelCallback);},
            deactivate : function(element) {$(element).off('CornerstoneToolsMouseWheel', mouseWheelCallback);}
        };
        return toolInterface;
    }

    // module exports
    cornerstoneTools.mouseWheelTool = mouseWheelTool;

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools)); 
// End Source; src/imageTools/mouseWheelTool.js

// Begin Source: src/imageTools/touchDragTool.js
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    /*jshint newcap: false */

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }


    function touchDragTool(touchDragCallback)
    {
        var toolInterface = {
            activate: function(element, mouseButtonMask) {
                $(element).off('CornerstoneToolsTouchDrag', touchDragCallback);
                var eventData = {
                };
                $(element).on("CornerstoneToolsTouchDrag", eventData, touchDragCallback);
            },
            disable : function(element) {$(element).off('CornerstoneToolsTouchDrag', touchDragCallback);},
            enable : function(element) {$(element).off('CornerstoneToolsTouchDrag', touchDragCallback);},
            deactivate : function(element) {$(element).off('CornerstoneToolsTouchDrag', touchDragCallback);}
        };
        return toolInterface;
    }

    // module exports
    cornerstoneTools.touchDragTool = touchDragTool;

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools)); 
// End Source; src/imageTools/touchDragTool.js

// Begin Source: src/imageTools/touchPinchTool.js
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    /*jshint newcap: false */

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }


    function touchPinchTool(touchPinchCallback)
    {
        var toolInterface = {
            activate: function(element) {
                $(element).off('CornerstoneToolsTouchPinch', touchPinchCallback);
                var eventData = {
                };
                $(element).on("CornerstoneToolsTouchPinch", eventData, touchPinchCallback);
            },
            disable : function(element) {$(element).off('CornerstoneToolsTouchPinch', touchPinchCallback);},
            enable : function(element) {$(element).off('CornerstoneToolsTouchPinch', touchPinchCallback);},
            deactivate : function(element) {$(element).off('CornerstoneToolsTouchPinch', touchPinchCallback);}
        };
        return toolInterface;
    }

    // module exports
    cornerstoneTools.touchPinchTool = touchPinchTool;

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools)); 
// End Source; src/imageTools/touchPinchTool.js

// Begin Source: src/imageTools/ellipticalRoi.js
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    var toolType = "ellipticalRoi";

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
        // TODO: Find a formula for shortest distance betwen point and ellipse.  Rectangle is close enough
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
    function pointInEllipse(ellipse, location)
    {
        var xRadius = ellipse.width / 2;
        var yRadius = ellipse.height / 2;

        if (xRadius <= 0.0 || yRadius <= 0.0)
        {
            return false;
        }

        var center = {
            x: ellipse.left + xRadius,
            y: ellipse.top + yRadius
        };

        /* This is a more general form of the circle equation
         *
         * X^2/a^2 + Y^2/b^2 <= 1
         */

        var normalized = {
            x: location.x - center.x,
            y: location.y - center.y
        };

        var inEllipse = ((normalized.x * normalized.y) / (xRadius * xRadius)) + ((normalized.y * normalized.y) / (yRadius * yRadius)) <= 1.0;
        return inEllipse;
    }

    function calculateMeanStdDev(sp, ellipse)
    {
        // TODO: Get a real statistics library here that supports large counts

        var sum = 0;
        var sumSquared =0;
        var count = 0;
        var index =0;

        for(var y=ellipse.top; y < ellipse.top + ellipse.height; y++) {
            for(var x=ellipse.left; x < ellipse.left + ellipse.width; x++) {
                if(pointInEllipse(ellipse, {x: x, y: y}) === true)
                {
                    sum += sp[index];
                    sumSquared += sp[index] * sp[index];
                    count++;
                }
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
        cornerstone.setToPixelCoordinateSystem(renderData.enabledElement, context);

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
            cornerstoneTools.drawEllipse(context, left, top, width, height);
            context.closePath();

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
            var area = Math.PI * (width * renderData.image.columnPixelSpacing / 2) * (height * renderData.image.rowPixelSpacing / 2);
            var areaText = "Area: " + area.toFixed(2) + " mm^2";

            // Draw text
            var fontParameters = cornerstoneTools.setContextToDisplayFontSize(renderData.enabledElement, renderData.canvasContext, 15);
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
    cornerstoneTools.ellipticalRoi = cornerstoneTools.mouseButtonTool({
        createNewMeasurement : createNewMeasurement,
        onImageRendered: onImageRendered,
        pointNearTool : pointNearTool,
        toolType : toolType
    });

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools)); 
// End Source; src/imageTools/ellipticalRoi.js

// Begin Source: src/imageTools/lengthTool.js
var cornerstoneTools = (function ($, cornerstone,  cornerstoneTools) {

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

    function pointNearTool(data, coords)
    {
        var lineSegment = {
            start: data.handles.start,
            end: data.handles.end
        };
        var distanceToPoint = cornerstoneTools.lineSegment.distanceToPoint(lineSegment, coords);
        return (distanceToPoint < 5);
    }

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
        cornerstone.setToPixelCoordinateSystem(renderData.enabledElement, context);

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

            var fontParameters = cornerstoneTools.setContextToDisplayFontSize(renderData.enabledElement, renderData.canvasContext, 15);
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
        pointNearTool : pointNearTool,
        toolType : toolType
    });

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools)); 
// End Source; src/imageTools/lengthTool.js

// Begin Source: src/imageTools/pan.js
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function mouseUpCallback(e)
    {
        var mouseData = e.originalEvent.detail;
        $(mouseData.element).off("CornerstoneToolsMouseDrag", mouseDragCallback);
        $(mouseData.element).off("CornerstoneToolsMouseUp", mouseUpCallback);
    }

    function mouseDownCallback(e)
    {
        var mouseData = e.originalEvent.detail;
        if(cornerstoneTools.isMouseButtonEnabled(mouseData.which, e.data.mouseButtonMask)) {
            $(mouseData.element).on("CornerstoneToolsMouseDrag", mouseDragCallback);
            $(mouseData.element).on("CornerstoneToolsMouseUp", mouseUpCallback);
            return false; // false = cases jquery to preventDefault() and stopPropagation() this event
        }
    }

    function mouseDragCallback(e) {
        var mouseMoveData = e.originalEvent.detail;
        mouseMoveData.viewport.translation.x += (mouseMoveData.deltaPoints.page.x / mouseMoveData.viewport.scale);
        mouseMoveData.viewport.translation.y += (mouseMoveData.deltaPoints.page.y / mouseMoveData.viewport.scale);
        cornerstone.setViewport(mouseMoveData.element, mouseMoveData.viewport);
        return false; // false = cases jquery to preventDefault() and stopPropagation() this event
    }

    function drag(element, dragData)
    {
        dragData.viewport.centerX += (dragData.deltaPageX / dragData.viewport.scale);
        dragData.viewport.centerY += (dragData.deltaPageY / dragData.viewport.scale);
        cornerstone.setViewport(element, dragData.viewport);
    }

    function onDrag(e) {
        cornerstoneTools.onDrag(e, drag);
    }

    cornerstoneTools.pan = cornerstoneTools.simpleMouseButtonTool(mouseDownCallback);
    cornerstoneTools.panTouchDrag = cornerstoneTools.touchDragTool(onDrag);

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools)); 
// End Source; src/imageTools/pan.js

// Begin Source: src/imageTools/probe.js
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    var toolType = "probe";

    ///////// BEGIN ACTIVE TOOL ///////
    function createNewMeasurement(mouseEventData)
    {
        // create the measurement data for this tool with the end handle activated
        var measurementData = {
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
        cornerstone.setToPixelCoordinateSystem(renderData.enabledElement, context);

        for(var i=0; i < toolData.data.length; i++) {
            context.save();
            var data = toolData.data[i];

            // draw the handles
            context.beginPath();
            cornerstoneTools.drawHandles(context, renderData, data.handles);
            context.stroke();

            // Draw text
            var fontParameters = cornerstoneTools.setContextToDisplayFontSize(renderData.enabledElement, renderData.canvasContext, 15);
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
    ///////// END IMAGE RENDERING ///////


    // module exports
    cornerstoneTools.probe = cornerstoneTools.mouseButtonTool({
        createNewMeasurement : createNewMeasurement,
        onImageRendered: onImageRendered,
        toolType : toolType
    });

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools)); 
// End Source; src/imageTools/probe.js

// Begin Source: src/imageTools/rectangleRoi.js
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

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
        cornerstone.setToPixelCoordinateSystem(renderData.enabledElement, context);

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
            var fontParameters = cornerstoneTools.setContextToDisplayFontSize(renderData.enabledElement, renderData.canvasContext, 15);
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
}($, cornerstone, cornerstoneTools)); 
// End Source; src/imageTools/rectangleRoi.js

// Begin Source: src/imageTools/wwwc.js
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function mouseUpCallback(e)
    {
        var mouseData = e.originalEvent.detail;
        $(mouseData.element).off("CornerstoneToolsMouseDrag", mouseDragCallback);
        $(mouseData.element).off("CornerstoneToolsMouseUp", mouseUpCallback);
    }

    function mouseDownCallback(e)
    {
        var mouseData = e.originalEvent.detail;
        if(cornerstoneTools.isMouseButtonEnabled(mouseData.which, e.data.mouseButtonMask)) {
            $(mouseData.element).on("CornerstoneToolsMouseDrag", mouseDragCallback);
            $(mouseData.element).on("CornerstoneToolsMouseUp", mouseUpCallback);
            return false; // false = cases jquery to preventDefault() and stopPropagation() this event
        }
    }

    function mouseDragCallback(e)
    {
        var mouseMoveData = e.originalEvent.detail;
        // here we normalize the ww/wc adjustments so the same number of on screen pixels
        // adjusts the same percentage of the dynamic range of the image.  This is needed to
        // provide consistency for the ww/wc tool regardless of the dynamic range (e.g. an 8 bit
        // image will feel the same as a 16 bit image would)
        var imageDynamicRange = mouseMoveData.image.maxPixelValue - mouseMoveData.image.minPixelValue;
        var multiplier = imageDynamicRange / 1024;

        mouseMoveData.viewport.voi.windowWidth += (mouseMoveData.deltaPoints.page.x * multiplier);
        mouseMoveData.viewport.voi.windowCenter += (mouseMoveData.deltaPoints.page.y * multiplier);
        cornerstone.setViewport(mouseMoveData.element, mouseMoveData.viewport);
        return false; // false = cases jquery to preventDefault() and stopPropagation() this event
    }

    function touchDragCallback(e)
    {
        var dragData = e.originalEvent.detail;

        var imageDynamicRange = dragData.image.maxPixelValue - dragData.image.minPixelValue;
        var multiplier = imageDynamicRange / 1024;

        dragData.viewport.voi.windowWidth += (dragData.deltaPoints.page.x * multiplier);
        dragData.viewport.voi.windowCenter += (dragData.deltaPoints.page.y * multiplier);
        cornerstone.setViewport(dragData.element, dragData.viewport);
    }

    cornerstoneTools.wwwc = cornerstoneTools.simpleMouseButtonTool(mouseDownCallback);
    cornerstoneTools.wwwcTouchDrag = cornerstoneTools.touchDragTool(touchDragCallback);


    return cornerstoneTools;
}($, cornerstone, cornerstoneTools)); 
// End Source; src/imageTools/wwwc.js

// Begin Source: src/imageTools/zoom.js
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function zoom(element, viewport, ticks)
    {
        // Calculate the new scale factor based on how far the mouse has changed
        var pow = 1.7;
        var oldFactor = Math.log(viewport.scale) / Math.log(pow);
        var factor = oldFactor + ticks;
        var scale = Math.pow(pow, factor);
        viewport.scale = scale;
        cornerstone.setViewport(element, viewport);
    }

    function mouseUpCallback(e)
    {
        var mouseData = e.originalEvent.detail;
        $(mouseData.element).off("CornerstoneToolsMouseDrag", mouseDragCallback);
        $(mouseData.element).off("CornerstoneToolsMouseUp", mouseUpCallback);

    }
    function mouseDownCallback(e)
    {
        var mouseData = e.originalEvent.detail;
        if(cornerstoneTools.isMouseButtonEnabled(mouseData.which, e.data.mouseButtonMask)) {
            $(mouseData.element).on("CornerstoneToolsMouseDrag", mouseDragCallback);
            $(mouseData.element).on("CornerstoneToolsMouseUp", mouseUpCallback);
            return false; // false = cases jquery to preventDefault() and stopPropagation() this event
        }
    }

    function mouseDragCallback(e)
    {
        var mouseMoveData = e.originalEvent.detail;

        var ticks = mouseMoveData.deltaPoints.page.y/100;
        zoom(mouseMoveData.element, mouseMoveData.viewport, ticks);

        // Now that the scale has been updated, determine the offset we need to apply to the center so we can
        // keep the original start location in the same position
        var newCoords = cornerstone.pageToPixel(mouseMoveData.element, mouseMoveData.startPoints.page.x, mouseMoveData.startPoints.page.y);
        mouseMoveData.viewport.translation.x -= mouseMoveData.startPoints.image.x - newCoords.x;
        mouseMoveData.viewport.translation.y -= mouseMoveData.startPoints.image.y - newCoords.y;
        cornerstone.setViewport(mouseMoveData.element, mouseMoveData.viewport);
        return false; // false = cases jquery to preventDefault() and stopPropagation() this event
    }

    function mouseWheelCallback(e)
    {
        var mouseWheelData = e.originalEvent.detail;
        var ticks = -mouseWheelData.direction / 4;
        zoom(mouseWheelData.element, mouseWheelData.viewport, ticks);
    }

    function touchPinchCallback(e)
    {
        var pinchData = e.originalEvent.detail;
        zoom(pinchData.element, pinchData.viewport, pinchData.direction / 4);
    }

    cornerstoneTools.zoom = cornerstoneTools.simpleMouseButtonTool(mouseDownCallback);
    cornerstoneTools.zoomWheel = cornerstoneTools.mouseWheelTool(mouseWheelCallback);
    cornerstoneTools.zoomTouchPinch = cornerstoneTools.touchPinchTool(touchPinchCallback);
    return cornerstoneTools;
}($, cornerstone, cornerstoneTools)); 
// End Source; src/imageTools/zoom.js

// Begin Source: src/inputSources/touchInput.js
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    /*jshint newcap: false */

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    var lastScale = 1.0;
    var processingTouch = false;

    var startPoints;
    var lastPoints;

    function onTouch(e)
    {
        e.gesture.preventDefault();
        e.gesture.stopPropagation();


        // we use a global flag to keep track of whether or not we are pinching
        // to avoid queueing up tons of events
        if(processingTouch === true)
        {
            return;
        }

        var element = e.currentTarget;
        var event;

        if(e.type === 'transform')
        {
            var scale = lastScale - e.gesture.scale;
            lastScale = e.gesture.scale;
            event = new CustomEvent(
                "CornerstoneToolsTouchPinch",
                {
                    detail: {
                        event: e,
                        viewport: cornerstone.getViewport(element),
                        image: cornerstone.getEnabledElement(element).image,
                        element: element,
                        direction: scale < 0 ? 1 : -1
                    },
                    bubbles: false,
                    cancelable: false
                }
            );
        }
        else if(e.type === 'dragstart')
        {
            startPoints = {
                page: cornerstoneTools.point.pageToPoint(e.gesture.touches[0]),
                image: cornerstone.pageToPixel(element, e.gesture.touches[0].pageX, e.gesture.touches[0].pageY)
            };
            lastPoints = cornerstoneTools.copyPoints(startPoints);
            return;
        }
        else if(e.type === 'drag')
        {
            // calculate our current points in page and image coordinates
            var currentPoints = {
                page: cornerstoneTools.point.pageToPoint(e.gesture.touches[0]),
                image: cornerstone.pageToPixel(element, e.gesture.touches[0].pageX, e.gesture.touches[0].pageY)
            };

            // Calculate delta values in page and image coordinates
            var deltaPoints = {
                page: cornerstoneTools.point.subtract(currentPoints.page, lastPoints.page),
                image: cornerstoneTools.point.subtract(currentPoints.image, lastPoints.image)
            };

            event = new CustomEvent(
                "CornerstoneToolsTouchDrag",
                {
                    detail: {
                        event: e,
                        viewport: cornerstone.getViewport(element),
                        image: cornerstone.getEnabledElement(element).image,
                        element: element,
                        startPoints: startPoints,
                        lastPoints: lastPoints,
                        currentPoints: currentPoints,
                        deltaPoints: deltaPoints
                    },
                    bubbles: false,
                    cancelable: false
                }
            );
            lastPoints = $.extend({}, currentPoints);

        }
        else
        {
            return;
        }

        processingTouch = true;

        // we dispatch the event using a timer to allow the DOM to redraw
        setTimeout(function() {
            element.dispatchEvent(event);
            processingTouch = false;
        }, 1);
    }

    function enable(element)
    {
        var hammerOptions = {
            transform_always_block: true,
            transform_min_scale   : 0.01,
            drag_block_horizontal : true,
            drag_block_vertical   : true,
            drag_min_distance     : 0

        };
        $(element).hammer(hammerOptions).on("touch drag transform dragstart", onTouch);
    }

    function disable(element) {
        $(element).hammer().off("touch drag transform dragstart", onTouch);
    }

    // module exports
    cornerstoneTools.touchInput = {
        enable : enable,
        disable : disable
    };

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools)); 
// End Source; src/inputSources/touchInput.js

// Begin Source: src/manipulators/anyHandlesOutsideImage.js
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function anyHandlesOutsideImage(renderData, handles)
    {
        var image = renderData.image;
        var imageRect = {
            left: 0,
            top: 0,
            width: image.width,
            height: image.height
        };

        var handleOutsideImage = false;
        for(var property in handles) {
            var handle = handles[property];
            if(cornerstoneTools.point.insideRect(handle, imageRect) === false)
            {
                handleOutsideImage = true;
            }
        }
        return handleOutsideImage;
    }

    // module/private exports
    cornerstoneTools.anyHandlesOutsideImage = anyHandlesOutsideImage;

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools)); 
// End Source; src/manipulators/anyHandlesOutsideImage.js

// Begin Source: src/manipulators/drawHandles.js
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    var handleRadius = 6;

    function drawHandles(context, renderData, handles)
    {
        context.strokeStyle = 'white';
        var radius = handleRadius / renderData.viewport.scale;
        for(var property in handles) {
            var handle = handles[property];
            if(handle.active || handle.highlight) {
                context.beginPath();
                if(handle.active)
                {
                    context.lineWidth = 2 / renderData.viewport.scale;
                }
                else
                {
                    context.lineWidth = 0.5 / renderData.viewport.scale;
                }
                context.arc(handle.x, handle.y, radius, 0, 2 * Math.PI);
                context.stroke();
            }
        }
    }


    // module/private exports
    cornerstoneTools.drawHandles = drawHandles;

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools)); 
// End Source; src/manipulators/drawHandles.js

// Begin Source: src/manipulators/handleActivator.js
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    var handleRadius = 6;

    function findHandleNear(handles, imagePoint, scale)
    {
        var handleRadiusScaled = handleRadius / scale;

        for(var property in handles) {
            var handle = handles[property];
            var distance = cornerstoneTools.point.distance(imagePoint, handle);
            if(distance <= handleRadiusScaled)
            {
                return handle;
            }
        }
        return undefined;
    }

    function getActiveHandle(handles) {
        for(var property in handles) {
            var handle = handles[property];
            if(handle.active === true) {
                return handle;
            }
        }
        return undefined;
    }

    function handleActivator(handles, imagePoint, scale)
    {
        var activeHandle = getActiveHandle(handles);
        var nearbyHandle = findHandleNear(handles, imagePoint, scale);
        if(activeHandle !== nearbyHandle)
        {
            if(nearbyHandle !== undefined) {
                nearbyHandle.active = true;
            }
            if(activeHandle !== undefined) {
                activeHandle.active = false;
            }
            return true;
        }
        return false;
    }


    // module/private exports

    cornerstoneTools.handleActivator = handleActivator;
    return cornerstoneTools;
}($, cornerstone, cornerstoneTools)); 
// End Source; src/manipulators/handleActivator.js

// Begin Source: src/manipulators/handleMover.js
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function moveHandle(mouseEventData, handle, doneMovingCallback)
    {
        var element = mouseEventData.element;

        function mouseDragCallback(e) {
            var mouseMoveData = e.originalEvent.detail;
            handle.x = mouseMoveData.currentPoints.image.x;
            handle.y = mouseMoveData.currentPoints.image.y;
            cornerstone.updateImage(element);
        }
        $(element).on("CornerstoneToolsMouseDrag", mouseDragCallback);

        function mouseUpCallback(mouseMoveData) {
            handle.eactive = false;
            $(element).off("CornerstoneToolsMouseDrag", mouseDragCallback);
            $(element).off("CornerstoneToolsMouseUp", mouseUpCallback);
            cornerstone.updateImage(element);

            doneMovingCallback();
        }
        $(element).on("CornerstoneToolsMouseUp", mouseUpCallback);
    }


    // module/private exports
    cornerstoneTools.moveHandle = moveHandle;

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools)); 
// End Source; src/manipulators/handleMover.js

// Begin Source: src/manipulators/moveAllHandles.js
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }



    function moveAllHandles(e, data, toolData, deleteIfHandleOutsideImage)
    {
        var mouseEventData = e.originalEvent.detail;
        var element = mouseEventData.element;

        function mouseDragCallback(e)
        {
            var mouseMoveData = e.originalEvent.detail;
            for(var property in data.handles) {
                var handle = data.handles[property];
                handle.x += mouseMoveData.deltaPoints.image.x;
                handle.y += mouseMoveData.deltaPoints.image.y;
            }
            cornerstone.updateImage(element);
            return false; // false = cases jquery to preventDefault() and stopPropagation() this event
        }

        $(element).on("CornerstoneToolsMouseDrag", mouseDragCallback);

        function mouseUpCallback(e) {
            data.moving = false;
            var mouseUpData = e.originalEvent.detail;

            $(element).off('CornerstoneToolsMouseDrag', mouseDragCallback);
            $(element).off('CornerstoneToolsMouseUp', mouseUpCallback);

            // If any handle is outside the image, delete the tool data

            if(deleteIfHandleOutsideImage === true) {
                var image = mouseUpData.image;//.getEnabledElement(element).image;
                var handleOutsideImage = false;
                var rect = {
                    top: 0,
                    left: 0,
                    width: image.width,
                    height: image.height
                };
                for(var property in data.handles) {
                    var handle = data.handles[property];
                    if(cornerstoneTools.point.insideRect(handle, rect) === false)
                    {
                        handleOutsideImage = true;
                    }
                }

                if(handleOutsideImage)
                {
                    // find this tool data
                    var indexOfData = -1;
                    for(var i = 0; i < toolData.data.length; i++) {
                        if(toolData.data[i] === data)
                        {
                            indexOfData = i;
                        }
                    }
                    if(indexOfData !== -1) {
                        toolData.data.splice(indexOfData, 1);
                    }
                }
            }
            cornerstone.updateImage(element);
         }
        $(element).on("CornerstoneToolsMouseUp",mouseUpCallback);
        return true;
    }


    // module/private exports
    cornerstoneTools.moveAllHandles = moveAllHandles;

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools)); 
// End Source; src/manipulators/moveAllHandles.js

// Begin Source: src/math/lineSegment.js
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    // based on  http://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
    function sqr(x)
    {
        return x * x;
    }

    function dist2(v, w) {
        return sqr(v.x - w.x) + sqr(v.y - w.y);
    }

    function distanceToPointSquared(lineSegment, point)
    {
        var l2 = dist2(lineSegment.start, lineSegment.end);
        if(l2 === 0) {
            return dist2(point, lineSegment.start);
        }
        var t = ((point.x - lineSegment.start.x) * (lineSegment.end.x - lineSegment.start.x) +
                 (point.y - lineSegment.start.y) * (lineSegment.end.y - lineSegment.start.y)) / l2;
        if(t < 0) {
            return dist2(point, lineSegment.start);
        }
        if(t > 1) {
            return dist2(point, lineSegment.end);
        }

        var pt = {
            x : lineSegment.start.x + t * (lineSegment.end.x - lineSegment.start.x),
            y : lineSegment.start.y + t * (lineSegment.end.y - lineSegment.start.y)
        };
        return dist2(point, pt);
    }

    function distanceToPoint(lineSegment, point)
    {
        return Math.sqrt(distanceToPointSquared(lineSegment, point));
    }

    // module exports
    cornerstoneTools.lineSegment =
    {
        distanceToPoint : distanceToPoint
    };


    return cornerstoneTools;
}($, cornerstone, cornerstoneTools)); 
// End Source; src/math/lineSegment.js

// Begin Source: src/math/point.js
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function pageToPoint(e)
    {
        return {
            x : e.pageX,
            y : e.pageY
        };
    }

    function subtract(lhs, rhs)
    {
        return {
            x : lhs.x - rhs.x,
            y : lhs.y - rhs.y
        };
    }

    function copy(point)
    {
        return {
            x : point.x,
            y : point.y
        };
    }

    function distance(from, to)
    {
        return Math.sqrt(distanceSquared(from, to));
    }

    function distanceSquared(from, to)
    {
        var delta = subtract(from, to);
        return delta.x * delta.x + delta.y * delta.y;
    }

    function insideRect(point, rect)
    {
        if( point.x < rect.left ||
            point.x > rect.left + rect.width ||
            point.y < rect.top ||
            point.y > rect.top + rect.height)
        {
            return false;
        }
        return true;
    }


    // module exports
    cornerstoneTools.point =
    {
        subtract : subtract,
        copy: copy,
        pageToPoint: pageToPoint,
        distance: distance,
        distanceSquared: distanceSquared,
        insideRect: insideRect
    };


    return cornerstoneTools;
}($, cornerstone, cornerstoneTools)); 
// End Source; src/math/point.js

// Begin Source: src/math/rect.js
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function rectToLineSegments(rect)
    {
        var top = {
            start : {
                x :rect.left,
                y :rect.top
            },
            end : {
                x :rect.left + rect.width,
                y :rect.top

            }
        };
        var right = {
            start : {
                x :rect.left + rect.width,
                y :rect.top
            },
            end : {
                x :rect.left + rect.width,
                y :rect.top + rect.height

            }
        };
        var bottom = {
            start : {
                x :rect.left + rect.width,
                y :rect.top + rect.height
            },
            end : {
                x :rect.left,
                y :rect.top + rect.height

            }
        };
        var left = {
            start : {
                x :rect.left,
                y :rect.top + rect.height
            },
            end : {
                x :rect.left,
                y :rect.top

            }
        };
        var lineSegments = [top, right, bottom, left];
        return lineSegments;
    }

    function pointNearLineSegment(point, lineSegment, maxDistance)
    {
        if(maxDistance === undefined) {
            maxDistance = 5;
        }
        var distance = cornerstoneTools.lineSegment.distanceToPoint(lineSegment, point);

        return (distance < maxDistance);
    }
    function distanceToPoint(rect, point)
    {
        var minDistance = 655535;
        var lineSegments = rectToLineSegments(rect);
        lineSegments.forEach(function(lineSegment) {
            var distance = cornerstoneTools.lineSegment.distanceToPoint(lineSegment, point);
            if(distance < minDistance) {
                minDistance = distance;
            }
        });
        return minDistance;
    }

    // module exports
    cornerstoneTools.rect =
    {
        distanceToPoint : distanceToPoint
    };


    return cornerstoneTools;
}($, cornerstone, cornerstoneTools)); 
// End Source; src/math/rect.js

// Begin Source: src/stackTools/stackPrefetch.js
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    var toolType = "stackPrefetch";

    function prefetch(element)
    {
        var stackData = cornerstoneTools.getToolState(element, 'stack');
        if(stackData === undefined || stackData.data === undefined || stackData.data.length === 0) {
            return;
        }

        var stackPrefetchData = cornerstoneTools.getToolState(element, toolType);
        if(stackPrefetchData === undefined) {
            // should not happen
            return;
        }

        var stackPrefetch = stackPrefetchData.data[0];

        var stack = stackData.data[0];
        var stackPrefetchImageIdIndex = stackPrefetch.prefetchImageIdIndex + 1;
        stackPrefetchImageIdIndex = Math.min(stack.imageIds.length - 1, stackPrefetchImageIdIndex);
        stackPrefetchImageIdIndex = Math.max(0, stackPrefetchImageIdIndex);

        // if no change turn off prefetching for this stack
        if(stackPrefetchImageIdIndex === stackPrefetch.prefetchImageIdIndex)
        {
            stackPrefetch.enabled = false;
            return;
        }

        stackPrefetch.prefetchImageIdIndex = stackPrefetchImageIdIndex;

        var imageId = stack.imageIds[stackPrefetchImageIdIndex];

        var loadImageDeferred = cornerstone.loadImage(imageId);

        loadImageDeferred.done(function(image)
        {
            // image has been loaded, call prefetch on the next image
            setTimeout(function() {
                prefetch(element);
            }, 1);
        });
    }

    function enable(element)
    {
        var stackPrefetchData = cornerstoneTools.getToolState(element, toolType);
        if(stackPrefetchData === undefined) {
            stackPrefetchData = {
                prefetchImageIdIndex : 0,
                enabled: true
            };
            cornerstoneTools.addToolState(element, toolType, stackPrefetchData);
        }

        prefetch(element);
    }

    function disable(element)
    {
        var stackPrefetchData = cornerstoneTools.getToolState(element, toolType);
        if(stackPrefetchData === undefined) {
            stackPrefetchData = {
                prefetchImageIdIndex : 0,
                enabled: false
            };
            cornerstoneTools.addToolState(element, toolType, stackPrefetchData);
        }
        else
        {
            stackPrefetchData.enabled = false;
        }
    }

    // module/private exports
    cornerstoneTools.stackPrefetch = {
        enable: enable,
        disable: disable
        };

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));
 
// End Source; src/stackTools/stackPrefetch.js

// Begin Source: src/stackTools/stackScroll.js
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    var toolType = "stackScroll";

    function scroll(element, images)
    {
        var toolData = cornerstoneTools.getToolState(element, 'stack');
        if(toolData === undefined || toolData.data === undefined || toolData.data.length === 0) {
            return;
        }

        var stackData = toolData.data[0];

        var newImageIdIndex = stackData.currentImageIdIndex + images;
        newImageIdIndex = Math.min(stackData.imageIds.length - 1, newImageIdIndex);
        newImageIdIndex = Math.max(0, newImageIdIndex);

        if(newImageIdIndex !== stackData.currentImageIdIndex)
        {
            var viewport = cornerstone.getViewport(element);
            cornerstone.loadImage(stackData.imageIds[newImageIdIndex]).then(function(image) {
                stackData.currentImageIdIndex = newImageIdIndex;
                cornerstone.displayImage(element, image, viewport);
            });
        }
    }

    function mouseUpCallback(e)
    {
        var mouseData = e.originalEvent.detail;
        $(mouseData.element).off("CornerstoneToolsMouseDrag", mouseDragCallback);
        $(mouseData.element).off("CornerstoneToolsMouseUp", mouseUpCallback);
    }

    function mouseDownCallback(e)
    {
        var mouseData = e.originalEvent.detail;
        if(cornerstoneTools.isMouseButtonEnabled(mouseData.which, e.data.mouseButtonMask)) {

            var eventData = {
                deltaY : 0
            };
            $(mouseData.element).on("CornerstoneToolsMouseDrag", eventData, mouseDragCallback);
            $(mouseData.element).on("CornerstoneToolsMouseUp", mouseUpCallback);
            return false; // false = cases jquery to preventDefault() and stopPropagation() this event
        }
    }

    function mouseDragCallback(e)
    {
        var mouseMoveData = e.originalEvent.detail;
        var eventData = e.data;
        eventData.deltaY += mouseMoveData.deltaPoints.page.y;

        var toolData = cornerstoneTools.getToolState(mouseMoveData.element, 'stack');
        if(toolData === undefined || toolData.data === undefined || toolData.data.length === 0) {
            return;
        }

        var stackData = toolData.data[0];
        if(eventData.deltaY >=3 || eventData.deltaY <= -3)
        {
            var imageDelta = eventData.deltaY / 3;
            var imageDeltaMod = eventData.deltaY % 3;
            var imageIdIndexOffset = Math.round(imageDelta);
            eventData.deltaY = imageDeltaMod;

            var imageIdIndex = stackData.currentImageIdIndex + imageIdIndexOffset;
            imageIdIndex = Math.min(stackData.imageIds.length - 1, imageIdIndex);
            imageIdIndex = Math.max(0, imageIdIndex);
            if(imageIdIndex !== stackData.currentImageIdIndex)
            {
                stackData.currentImageIdIndex = imageIdIndex;
                var viewport = cornerstone.getViewport(mouseMoveData.element);
                cornerstone.loadImage(stackData.imageIds[imageIdIndex]).then(function(image) {
                    cornerstone.displayImage(mouseMoveData.element, image, viewport);
                });
            }

        }

        return false; // false = cases jquery to preventDefault() and stopPropagation() this event
    }

    function mouseWheelCallback(e)
    {
        var mouseWheelData = e.originalEvent.detail;
        var images = -mouseWheelData.direction;
        scroll(mouseWheelData.element, images);
    }

    // module/private exports
    cornerstoneTools.stackScroll = cornerstoneTools.simpleMouseButtonTool(mouseDownCallback);
    cornerstoneTools.stackScrollWheel = cornerstoneTools.mouseWheelTool(mouseWheelCallback);

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools)); 
// End Source; src/stackTools/stackScroll.js

// Begin Source: src/stateManagement/imageIdSpecificStateManager.js
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    // This implements an imageId specific tool state management strategy.  This means that
    // measurements data is tied to a specific imageId and only visible for enabled elements
    // that are displaying that imageId.

    function newImageIdSpecificToolStateManager() {
        var toolState = {};

        // here we add tool state, this is done by tools as well
        // as modules that restore saved state
        function addImageIdSpecificToolState(element, toolType, data)
        {
            var enabledImage = cornerstone.getEnabledElement(element);
            // if we don't have any tool state for this imageId, add an empty object
            if(toolState.hasOwnProperty(enabledImage.imageId) === false)
            {
                toolState[enabledImage.imageId] = {};
            }
            var imageIdToolState = toolState[enabledImage.imageId];

            // if we don't have tool state for this type of tool, add an empty object
            if(imageIdToolState.hasOwnProperty(toolType) === false)
            {
                imageIdToolState[toolType] = {
                    data: []
                };
            }
            var toolData = imageIdToolState[toolType];

            // finally, add this new tool to the state
            toolData.data.push(data);
        }

        // here you can get state - used by tools as well as modules
        // that save state persistently
        function getImageIdSpecificToolState(element, toolType)
        {
            var enabledImage = cornerstone.getEnabledElement(element);
            // if we don't have any tool state for this imageId, return undefined
            if(toolState.hasOwnProperty(enabledImage.imageId) === false)
            {
                return undefined;
            }
            var imageIdToolState = toolState[enabledImage.imageId];

            // if we don't have tool state for this type of tool, return undefined
            if(imageIdToolState.hasOwnProperty(toolType) === false)
            {
                return undefined;
            }
            var toolData = imageIdToolState[toolType];
            return toolData;
        }

        var imageIdToolStateManager = {
            get: getImageIdSpecificToolState,
            add: addImageIdSpecificToolState
        };
        return imageIdToolStateManager;
    }

    // a global imageIdSpecificToolStateManager - the most common case is to share state between all
    // visible enabled images
    var globalImageIdSpecificToolStateManager = newImageIdSpecificToolStateManager();

    // module/private exports
    cornerstoneTools.newImageIdSpecificToolStateManager = newImageIdSpecificToolStateManager;
    cornerstoneTools.globalImageIdSpecificToolStateManager = globalImageIdSpecificToolStateManager;

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools)); 
// End Source; src/stateManagement/imageIdSpecificStateManager.js

// Begin Source: src/stateManagement/stackSpecificStateManager.js
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    // This implements an Stack specific tool state management strategy.  This means
    // that tool data is shared between all imageIds in a given stack
    function newStackSpecificToolStateManager(toolTypes, oldStateManager) {
        var toolState = {};

        // here we add tool state, this is done by tools as well
        // as modules that restore saved state
        function addStackSpecificToolState(element, toolType, data)
        {
            // if this is a tool type to apply to the stack, do so
            if(toolTypes.indexOf(toolType) >= 0) {
                var enabledImage = cornerstone.getEnabledElement(element);

                // if we don't have tool state for this type of tool, add an empty object
                if(toolState.hasOwnProperty(toolType) === false)
                {
                    toolState[toolType] = {
                        data: []
                    };
                }
                var toolData = toolState[toolType];

                // finally, add this new tool to the state
                toolData.data.push(data);
            }
            else {
                // call the imageId specific tool state manager
                return oldStateManager.add(element, toolType, data);
            }
        }

        // here you can get state - used by tools as well as modules
        // that save state persistently
        function getStackSpecificToolState(element, toolType)
        {
            // if this is a tool type to apply to the stack, do so
            if(toolTypes.indexOf(toolType) >= 0) {
                // if we don't have tool state for this type of tool, add an empty object
                if(toolState.hasOwnProperty(toolType) === false)
                {
                    toolState[toolType] = {
                        data: []
                    };
                }
                var toolData = toolState[toolType];
                return toolData;
            }
            else
            {
                // call the imageId specific tool state manager
                return oldStateManager.get(element, toolType);
            }
        }

        var imageIdToolStateManager = {
            get: getStackSpecificToolState,
            add: addStackSpecificToolState
        };
        return imageIdToolStateManager;
    }

    var stackStateManagers = [];

    function addStackStateManager(element)
    {
        var oldStateManager = cornerstoneTools.getElementToolStateManager(element);
        if(oldStateManager === undefined) {
            oldStateManager = cornerstoneTools.globalImageIdSpecificToolStateManager;
        }

        var stackTools = ['stack', 'stackScroll'];
        var stackSpecificStateManager = cornerstoneTools.newStackSpecificToolStateManager(stackTools, oldStateManager);
        stackStateManagers.push(stackSpecificStateManager);
        cornerstoneTools.setElementToolStateManager(element, stackSpecificStateManager);
    }

    // module/private exports
    cornerstoneTools.newStackSpecificToolStateManager = newStackSpecificToolStateManager;
    cornerstoneTools.addStackStateManager = addStackStateManager;


    return cornerstoneTools;
}($, cornerstone, cornerstoneTools)); 
// End Source; src/stateManagement/stackSpecificStateManager.js

// Begin Source: src/stateManagement/toolStateManager.js
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function getElementToolStateManager(element)
    {
        var enabledImage = cornerstone.getEnabledElement(element);
        // if the enabledImage has no toolStateManager, create a default one for it
        // NOTE: This makes state management element specific
        if(enabledImage.toolStateManager === undefined) {
            enabledImage.toolStateManager = cornerstoneTools.globalImageIdSpecificToolStateManager;
        }
        return enabledImage.toolStateManager;
    }

    // here we add tool state, this is done by tools as well
    // as modules that restore saved state
    function addToolState(element, toolType, data)
    {
        var toolStateManager = getElementToolStateManager(element);
        toolStateManager.add(element, toolType, data);
        // TODO: figure out how to broadcast this change to all enabled elements so they can update the image
        // if this change effects them
    }

    // here you can get state - used by tools as well as modules
    // that save state persistently
    function getToolState(element, toolType)
    {
        var toolStateManager = getElementToolStateManager(element);
        return toolStateManager.get(element, toolType);
    }

    function removeToolState(element, toolType, data)
    {
        var toolStateManager = getElementToolStateManager(element);
        var toolData = toolStateManager.get(element, toolType);
        // find this tool data
        var indexOfData = -1;
        for(var i = 0; i < toolData.data.length; i++) {
            if(toolData.data[i] === data)
            {
                indexOfData = i;
            }
        }
        if(indexOfData !== -1) {
            toolData.data.splice(indexOfData, 1);
        }
    }

    // sets the tool state manager for an element
    function setElementToolStateManager(element, toolStateManager)
    {
        var enabledImage = cornerstone.getEnabledElement(element);
        enabledImage.toolStateManager = toolStateManager;
    }

    /*
     function getElementToolStateManager(element)
     {
     var enabledImage = cornerstone.getEnabledElement(element);
     return enabledImage.toolStateManager;
     }
     */

    // module/private exports
    cornerstoneTools.addToolState = addToolState;
    cornerstoneTools.getToolState = getToolState;
    cornerstoneTools.removeToolState = removeToolState;
    cornerstoneTools.setElementToolStateManager = setElementToolStateManager;
    cornerstoneTools.getElementToolStateManager = getElementToolStateManager;

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools)); 
// End Source; src/stateManagement/toolStateManager.js

// Begin Source: src/util/copyPoints.js
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function copyPoints(points)
    {
        var page = cornerstoneTools.point.copy(points.page);
        var image = cornerstoneTools.point.copy(points.image);
        return {
            page : page,
            image: image
        };
    }


    // module exports
    cornerstoneTools.copyPoints = copyPoints;


    return cornerstoneTools;
}($, cornerstone, cornerstoneTools)); 
// End Source; src/util/copyPoints.js

// Begin Source: src/util/drawEllipse.js

var cornerstoneTools = (function (cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    // http://stackoverflow.com/questions/2172798/how-to-draw-an-oval-in-html5-canvas
    function drawEllipse(ctx, x, y, w, h) {
        var kappa = 0.5522848,
            ox = (w / 2) * kappa, // control point offset horizontal
            oy = (h / 2) * kappa, // control point offset vertical
            xe = x + w,           // x-end
            ye = y + h,           // y-end
            xm = x + w / 2,       // x-middle
            ym = y + h / 2;       // y-middle

        ctx.beginPath();
        ctx.moveTo(x, ym);
        ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
        ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
        ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
        ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
        ctx.closePath();
        ctx.stroke();
    }

    // Module exports
    cornerstoneTools.drawEllipse = drawEllipse;

    return cornerstoneTools;
}(cornerstoneTools)); 
// End Source; src/util/drawEllipse.js

// Begin Source: src/util/isMouseButtonEnabled.js
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function isMouseButtonEnabled(which, mouseButtonMask)
    {
        /*jshint bitwise: false*/
        var mouseButton = (1 << (which - 1));
        return ((mouseButtonMask & mouseButton) !== 0);
    }

    // module exports
    cornerstoneTools.isMouseButtonEnabled = isMouseButtonEnabled;

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools)); 
// End Source; src/util/isMouseButtonEnabled.js

// Begin Source: src/util/pauseEvent.js
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    /**
     * This function is used to prevent selection from occuring when left click dragging on the image
     * @param e the event that is provided to your event handler
     * Based on: http://stackoverflow.com/questions/5429827/how-can-i-prevent-text-element-selection-with-cursor-drag
     * @returns {boolean}
     */
    function pauseEvent(e)
    {
        if(e.stopPropagation) {
            e.stopPropagation();
        }
        if(e.preventDefault) {
            e.preventDefault();
        }
        e.cancelBubble=true;
        e.returnValue=false;
        return false;
    }

    // module exports
    cornerstoneTools.pauseEvent = pauseEvent;


    return cornerstoneTools;
}($, cornerstone, cornerstoneTools)); 
// End Source; src/util/pauseEvent.js

// Begin Source: src/util/setContextToDisplayFontSize.js
/**
 * This module sets the transformation matrix for a canvas context so it displays fonts
 * smoothly even when the image is highly scaled up
 */

var cornerstone = (function (cornerstone) {

    "use strict";

    if(cornerstone === undefined) {
        cornerstone = {};
    }

    /**
     * Sets the canvas context transformation matrix so it is scaled to show text
     * more cleanly even if the image is scaled up.  See
     * https://github.com/chafey/cornerstoneTools/wiki/DrawingText
     * for more information
     *
     * @param ee
     * @param context
     * @param fontSize
     * @returns {{fontSize: number, lineHeight: number, fontScale: number}}
     */
    function setContextToDisplayFontSize(ee, context, fontSize)
    {
        var fontScale = 0.1;
        cornerstone.setToPixelCoordinateSystem(ee, context, fontScale);
        // return the font size to use
        var scaledFontSize = fontSize / ee.viewport.scale / fontScale;
        // TODO: actually calculate this?
        var lineHeight  = fontSize / ee.viewport.scale / fontScale;
        return {
            fontSize :scaledFontSize,
            lineHeight:lineHeight,
            fontScale: fontScale
        };
    }

    // Module exports
    cornerstoneTools.setContextToDisplayFontSize = setContextToDisplayFontSize;

    return cornerstone;
}(cornerstone)); 
// End Source; src/util/setContextToDisplayFontSize.js
