(function($, cornerstone, cornerstoneMath, cornerstoneTools) {

    'use strict';
    
    function mouseButtonRectangleTool(mouseToolInterface, preventHandleOutsideImage) {
        ///////// BEGIN ACTIVE TOOL ///////
        function addNewMeasurement(mouseEventData) {
            var measurementData = mouseToolInterface.createNewMeasurement(mouseEventData);
            
            //prevent adding new measurement if tool returns nill
            if (!measurementData) {
                return;
            }

            // associate this data with this imageId so we can render it and manipulate it
            cornerstoneTools.addToolState(mouseEventData.element, mouseToolInterface.toolType, measurementData);
           
            // since we are dragging to another place to drop the end point, we can just activate
            // the end point and let the moveHandle move it for us.
            $(mouseEventData.element).off('CornerstoneToolsMouseMove', mouseMoveCallback);
            cornerstoneTools.moveHandle(mouseEventData, mouseToolInterface.toolType, measurementData, measurementData.handles.end, function() {
                measurementData.active = false;
                if (cornerstoneTools.anyHandlesOutsideImage(mouseEventData, measurementData.handles)) {
                    // delete the measurement
                    cornerstoneTools.removeToolState(mouseEventData.element, mouseToolInterface.toolType, measurementData);
                }

                $(mouseEventData.element).on('CornerstoneToolsMouseMove', mouseMoveCallback);
            }, preventHandleOutsideImage);
        }

        function mouseDownActivateCallback(e, eventData) {
            if (cornerstoneTools.isMouseButtonEnabled(eventData.which, e.data.mouseButtonMask)) {
                addNewMeasurement(eventData);
                return false; // false = cases jquery to preventDefault() and stopPropagation() this event
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
            if (toolData === undefined) {
                return;
            }
            
            // We have tool data, search through all data
            // and see if we can activate a handle
            var imageNeedsUpdate = false;
            var coords = eventData.currentPoints.canvas;

            for (var i = 0; i < toolData.data.length; i++) {
                // get the cursor position in image coordinates
                var data = toolData.data[i];
                if (cornerstoneTools.handleActivator(eventData.element, data.handles, coords) === true) {
                    imageNeedsUpdate = true;
                }

                if ((mouseToolInterface.pointInsideRect(eventData.element, data, coords) && !data.active) || (!mouseToolInterface.pointInsideRect(eventData.element, data, coords) && data.active)) {
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
                    cornerstoneTools.removeToolState(eventData.element, mouseToolInterface.toolType, data);
                }

                cornerstone.updateImage(eventData.element);
                $(eventData.element).on('CornerstoneToolsMouseMove', mouseMoveCallback);
            }

            if (cornerstoneTools.isMouseButtonEnabled(eventData.which, e.data.mouseButtonMask)) {
                var coords = eventData.startPoints.canvas;
                var toolData = cornerstoneTools.getToolState(e.currentTarget, mouseToolInterface.toolType);

                var i;

                // now check to see if there is a handle we can move
                var distanceSq = 25;

                if (toolData !== undefined) {
                    for (i = 0; i < toolData.data.length; i++) {
                        data = toolData.data[i];
                        var handle = cornerstoneTools.getHandleNearImagePoint(eventData.element, data.handles, coords, distanceSq);
                        if (handle !== undefined) {
                            $(eventData.element).off('CornerstoneToolsMouseMove', mouseMoveCallback);
                            data.active = true;
                            cornerstoneTools.moveHandle(eventData, mouseToolInterface.toolType, data, handle, handleDoneMove, preventHandleOutsideImage);
                            e.stopImmediatePropagation();
                            return false;
                        }
                    }
                }

                // Now check to see if there is a line we can move
                // now check to see if we have a tool that we can move
                var options = {
                    deleteIfHandleOutsideImage: true,
                    preventHandleOutsideImage: preventHandleOutsideImage
                };
                
                if (toolData !== undefined && mouseToolInterface.pointInsideRect !== undefined) {
                    for (i = 0; i < toolData.data.length; i++) {
                        data = toolData.data[i];
                        if (mouseToolInterface.pointInsideRect(eventData.element, data, coords)) {
                            $(eventData.element).off('CornerstoneToolsMouseMove', mouseMoveCallback);
                            cornerstoneTools.moveAllHandles(e, data, toolData, mouseToolInterface.toolType, options, handleDoneMove);
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
            $(element).off('CornerstoneImageRendered', mouseToolInterface.onImageRendered);
            $(element).off('CornerstoneToolsMouseMove', mouseMoveCallback);
            $(element).off('CornerstoneToolsMouseDown', mouseDownCallback);
            $(element).off('CornerstoneToolsMouseDownActivate', mouseDownActivateCallback);

            cornerstone.updateImage(element);
        }

        // visible but not interactive
        function enable(element) {
            $(element).off('CornerstoneImageRendered', mouseToolInterface.onImageRendered);
            $(element).off('CornerstoneToolsMouseMove', mouseMoveCallback);
            $(element).off('CornerstoneToolsMouseDown', mouseDownCallback);
            $(element).off('CornerstoneToolsMouseDownActivate', mouseDownActivateCallback);

            $(element).on('CornerstoneImageRendered', mouseToolInterface.onImageRendered);

            cornerstone.updateImage(element);
        }

        // visible, interactive and can create
        function activate(element, mouseButtonMask) {
            var eventData = {
                mouseButtonMask: mouseButtonMask
            };

            $(element).off('CornerstoneImageRendered', mouseToolInterface.onImageRendered);
            $(element).off('CornerstoneToolsMouseMove', mouseMoveCallback);
            $(element).off('CornerstoneToolsMouseDown', mouseDownCallback);
            $(element).off('CornerstoneToolsMouseDownActivate', mouseDownActivateCallback);

            $(element).on('CornerstoneImageRendered', mouseToolInterface.onImageRendered);
            $(element).on('CornerstoneToolsMouseMove', eventData, mouseMoveCallback);
            $(element).on('CornerstoneToolsMouseDown', eventData, mouseDownCallback);
            $(element).on('CornerstoneToolsMouseDownActivate', eventData, mouseDownActivateCallback);

            cornerstone.updateImage(element);
        }

        // visible, interactive
        function deactivate(element, mouseButtonMask) {
            var eventData = {
                mouseButtonMask: mouseButtonMask
            };

            $(element).off('CornerstoneImageRendered', mouseToolInterface.onImageRendered);
            $(element).off('CornerstoneToolsMouseMove', mouseMoveCallback);
            $(element).off('CornerstoneToolsMouseDown', mouseDownCallback);
            $(element).off('CornerstoneToolsMouseDownActivate', mouseDownActivateCallback);

            $(element).on('CornerstoneImageRendered', mouseToolInterface.onImageRendered);
            $(element).on('CornerstoneToolsMouseMove', eventData, mouseMoveCallback);
            $(element).on('CornerstoneToolsMouseDown', eventData, mouseDownCallback);

            cornerstone.updateImage(element);
        }

        var toolInterface = {
            enable: enable,
            disable: disable,
            activate: activate,
            deactivate: deactivate
        };

        return toolInterface;
    }

    // module exports
    cornerstoneTools.mouseButtonRectangleTool = mouseButtonRectangleTool;

})($, cornerstone, cornerstoneMath, cornerstoneTools);
