(function($, cornerstone, cornerstoneMath, cornerstoneTools) {

    'use strict';

    function mouseButtonTool(mouseToolInterface) {
        var configuration = {};

        ///////// BEGIN ACTIVE TOOL ///////
        function addNewMeasurement(mouseEventData) {
            var element = mouseEventData.element;

            var measurementData = mouseToolInterface.createNewMeasurement(mouseEventData);
            if (!measurementData) {
                return;
            }

            var eventData = {
                mouseButtonMask: mouseEventData.which
            };

            // associate this data with this imageId so we can render it and manipulate it
            cornerstoneTools.addToolState(mouseEventData.element, mouseToolInterface.toolType, measurementData);

            // since we are dragging to another place to drop the end point, we can just activate
            // the end point and let the moveHandle move it for us.
            $(element).off('CornerstoneToolsMouseMove', mouseToolInterface.mouseMoveCallback || mouseMoveCallback);
            $(element).off('CornerstoneToolsMouseDown', mouseToolInterface.mouseDownCallback || mouseDownCallback);
            $(element).off('CornerstoneToolsMouseDownActivate', mouseToolInterface.mouseDownActivateCallback || mouseDownActivateCallback);

            if (mouseToolInterface.mouseDoubleClickCallback) {
                $(element).off('CornerstoneToolsMouseDoubleClick', mouseToolInterface.mouseDoubleClickCallback);
            }

            cornerstone.updateImage(element);

            var handleMover;
            if (Object.keys(measurementData.handles).length === 1) {
                handleMover = cornerstoneTools.moveHandle;
            } else {
                handleMover = cornerstoneTools.moveNewHandle;
            }

            var preventHandleOutsideImage;
            if (mouseToolInterface.options && mouseToolInterface.options.preventHandleOutsideImage !== undefined) {
                preventHandleOutsideImage = mouseToolInterface.options.preventHandleOutsideImage;
            } else {
                preventHandleOutsideImage = false;
            }

            handleMover(mouseEventData, mouseToolInterface.toolType, measurementData, measurementData.handles.end, function() {
                measurementData.active = false;
                measurementData.invalidated = true;
                if (cornerstoneTools.anyHandlesOutsideImage(mouseEventData, measurementData.handles)) {
                    // delete the measurement
                    cornerstoneTools.removeToolState(element, mouseToolInterface.toolType, measurementData);
                }

                $(element).on('CornerstoneToolsMouseMove', eventData, mouseToolInterface.mouseMoveCallback || mouseMoveCallback);
                $(element).on('CornerstoneToolsMouseDown', eventData, mouseToolInterface.mouseDownCallback || mouseDownCallback);
                $(element).on('CornerstoneToolsMouseDownActivate', eventData, mouseToolInterface.mouseDownActivateCallback || mouseDownActivateCallback);

                if (mouseToolInterface.mouseDoubleClickCallback) {
                    $(element).on('CornerstoneToolsMouseDoubleClick', eventData, mouseToolInterface.mouseDoubleClickCallback);
                }

                cornerstone.updateImage(element);
            }, preventHandleOutsideImage);
        }

        function mouseDownActivateCallback(e, eventData) {
            if (cornerstoneTools.isMouseButtonEnabled(eventData.which, e.data.mouseButtonMask)) {
                if (mouseToolInterface.addNewMeasurement) {
                    mouseToolInterface.addNewMeasurement(eventData);
                } else {
                    addNewMeasurement(eventData);
                }

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
            var toolData = cornerstoneTools.getToolState(eventData.element, mouseToolInterface.toolType);
            if (!toolData) {
                return;
            }
            
            // We have tool data, search through all data
            // and see if we can activate a handle
            var imageNeedsUpdate = false;
            for (var i = 0; i < toolData.data.length; i++) {
                // get the cursor position in canvas coordinates
                var coords = eventData.currentPoints.canvas;

                var data = toolData.data[i];
                if (cornerstoneTools.handleActivator(eventData.element, data.handles, coords) === true) {
                    imageNeedsUpdate = true;
                }

                if ((mouseToolInterface.pointNearTool(eventData.element, data, coords) && !data.active) || (!mouseToolInterface.pointNearTool(eventData.element, data, coords) && data.active)) {
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
            var element = eventData.element;

            function handleDoneMove() {
                data.active = false;
                data.invalidated = true;
                if (cornerstoneTools.anyHandlesOutsideImage(eventData, data.handles)) {
                    // delete the measurement
                    cornerstoneTools.removeToolState(element, mouseToolInterface.toolType, data);
                }

                cornerstone.updateImage(element);
                $(element).on('CornerstoneToolsMouseMove', eventData, mouseToolInterface.mouseMoveCallback || mouseMoveCallback);
            }

            if (cornerstoneTools.isMouseButtonEnabled(eventData.which, e.data.mouseButtonMask)) {
                var coords = eventData.startPoints.canvas;
                var toolData = cornerstoneTools.getToolState(e.currentTarget, mouseToolInterface.toolType);

                var i;

                // now check to see if there is a handle we can move
                if (toolData) {

                    var preventHandleOutsideImage;
                    if (mouseToolInterface.options && mouseToolInterface.options.preventHandleOutsideImage !== undefined) {
                        preventHandleOutsideImage = mouseToolInterface.options.preventHandleOutsideImage;
                    } else {
                        preventHandleOutsideImage = false;
                    }

                    for (i = 0; i < toolData.data.length; i++) {
                        data = toolData.data[i];
                        var distanceSq = 25;
                        var handle = cornerstoneTools.getHandleNearImagePoint(element, data.handles, coords, distanceSq);
                        if (handle) {
                            $(element).off('CornerstoneToolsMouseMove', mouseToolInterface.mouseMoveCallback || mouseMoveCallback);
                            data.active = true;
                            cornerstoneTools.moveHandle(eventData, mouseToolInterface.toolType, data, handle, handleDoneMove, preventHandleOutsideImage);
                            e.stopImmediatePropagation();
                            return false;
                        }
                    }
                }

                // Now check to see if there is a line we can move
                // now check to see if we have a tool that we can move
                if (toolData && mouseToolInterface.pointNearTool) {
                    var options = mouseToolInterface.options || {
                        deleteIfHandleOutsideImage: true,
                        preventHandleOutsideImage: false
                    };

                    for (i = 0; i < toolData.data.length; i++) {
                        data = toolData.data[i];
                        if (mouseToolInterface.pointNearTool(element, data, coords)) {
                            $(element).off('CornerstoneToolsMouseMove', mouseToolInterface.mouseMoveCallback || mouseMoveCallback);
                            cornerstoneTools.moveAllHandles(e, data, toolData, mouseToolInterface.toolType, options, handleDoneMove);
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
            $(element).off('CornerstoneImageRendered', mouseToolInterface.onImageRendered);
            $(element).off('CornerstoneToolsMouseMove', mouseToolInterface.mouseMoveCallback || mouseMoveCallback);
            $(element).off('CornerstoneToolsMouseDown', mouseToolInterface.mouseDownCallback || mouseDownCallback);
            $(element).off('CornerstoneToolsMouseDownActivate', mouseToolInterface.mouseDownActivateCallback || mouseDownActivateCallback);

            if (mouseToolInterface.mouseDoubleClickCallback) {
                $(element).off('CornerstoneToolsMouseDoubleClick', mouseToolInterface.mouseDoubleClickCallback);
            }

            cornerstone.updateImage(element);
        }

        // visible but not interactive
        function enable(element) {
            $(element).off('CornerstoneImageRendered', mouseToolInterface.onImageRendered);
            $(element).off('CornerstoneToolsMouseMove', mouseToolInterface.mouseMoveCallback || mouseMoveCallback);
            $(element).off('CornerstoneToolsMouseDown', mouseToolInterface.mouseDownCallback || mouseDownCallback);
            $(element).off('CornerstoneToolsMouseDownActivate', mouseToolInterface.mouseDownActivateCallback || mouseDownActivateCallback);

            if (mouseToolInterface.mouseDoubleClickCallback) {
                $(element).off('CornerstoneToolsMouseDoubleClick', mouseToolInterface.mouseDoubleClickCallback);
            }

            $(element).on('CornerstoneImageRendered', mouseToolInterface.onImageRendered);

            cornerstone.updateImage(element);
        }

        // visible, interactive and can create
        function activate(element, mouseButtonMask) {
            var eventData = {
                mouseButtonMask: mouseButtonMask
            };

            $(element).off('CornerstoneImageRendered', mouseToolInterface.onImageRendered);
            $(element).off('CornerstoneToolsMouseMove', mouseToolInterface.mouseMoveCallback || mouseMoveCallback);
            $(element).off('CornerstoneToolsMouseDown', mouseToolInterface.mouseDownCallback || mouseDownCallback);
            $(element).off('CornerstoneToolsMouseDownActivate', mouseToolInterface.mouseDownActivateCallback || mouseDownActivateCallback);

            $(element).on('CornerstoneImageRendered', mouseToolInterface.onImageRendered);
            $(element).on('CornerstoneToolsMouseMove', eventData, mouseToolInterface.mouseMoveCallback || mouseMoveCallback);
            $(element).on('CornerstoneToolsMouseDown', eventData, mouseToolInterface.mouseDownCallback || mouseDownCallback);
            $(element).on('CornerstoneToolsMouseDownActivate', eventData, mouseToolInterface.mouseDownActivateCallback || mouseDownActivateCallback);

            if (mouseToolInterface.mouseDoubleClickCallback) {
                $(element).off('CornerstoneToolsMouseDoubleClick', mouseToolInterface.mouseDoubleClickCallback);
                $(element).on('CornerstoneToolsMouseDoubleClick', eventData, mouseToolInterface.mouseDoubleClickCallback);
            }

            cornerstone.updateImage(element);
        }

        // visible, interactive
        function deactivate(element, mouseButtonMask) {
            var eventData = {
                mouseButtonMask: mouseButtonMask
            };

            $(element).off('CornerstoneImageRendered', mouseToolInterface.onImageRendered);
            $(element).off('CornerstoneToolsMouseMove', mouseToolInterface.mouseMoveCallback || mouseMoveCallback);
            $(element).off('CornerstoneToolsMouseDown', mouseToolInterface.mouseDownCallback || mouseDownCallback);
            $(element).off('CornerstoneToolsMouseDownActivate', mouseToolInterface.mouseDownActivateCallback || mouseDownActivateCallback);

            $(element).on('CornerstoneImageRendered', mouseToolInterface.onImageRendered);
            $(element).on('CornerstoneToolsMouseMove', eventData, mouseToolInterface.mouseMoveCallback || mouseMoveCallback);
            $(element).on('CornerstoneToolsMouseDown', eventData, mouseToolInterface.mouseDownCallback || mouseDownCallback);

            if (mouseToolInterface.mouseDoubleClickCallback) {
                $(element).off('CornerstoneToolsMouseDoubleClick', mouseToolInterface.mouseDoubleClickCallback);
                $(element).on('CornerstoneToolsMouseDoubleClick', eventData, mouseToolInterface.mouseDoubleClickCallback);
            }

            cornerstone.updateImage(element);
        }

        function getConfiguration() {
            return configuration;
        }

        function setConfiguration(config) {
            configuration = config;
        }

        var toolInterface = {
            enable: enable,
            disable: disable,
            activate: activate,
            deactivate: deactivate,
            getConfiguration: getConfiguration,
            setConfiguration: setConfiguration,
            mouseDownCallback: mouseDownCallback,
            mouseMoveCallback: mouseMoveCallback,
            mouseDownActivateCallback: mouseDownActivateCallback
        };

        // Expose pointNearTool if available
        if (mouseToolInterface.pointNearTool) {
            toolInterface.pointNearTool = mouseToolInterface.pointNearTool;
        }

        if (mouseToolInterface.mouseDoubleClickCallback) {
            toolInterface.mouseDoubleClickCallback = mouseToolInterface.mouseDoubleClickCallback;
        }

        if (mouseToolInterface.addNewMeasurement) {
            toolInterface.addNewMeasurement = mouseToolInterface.addNewMeasurement;
        }

        return toolInterface;
    }

    // module exports
    cornerstoneTools.mouseButtonTool = mouseButtonTool;

})($, cornerstone, cornerstoneMath, cornerstoneTools);
