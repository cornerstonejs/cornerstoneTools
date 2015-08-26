(function($, cornerstone, cornerstoneMath, cornerstoneTools) {

    'use strict';

    function touchTool(touchToolInterface) {
        ///////// BEGIN ACTIVE TOOL ///////

        function addNewMeasurement(touchEventData) {
            var element = touchEventData.element;

            var measurementData = touchToolInterface.createNewMeasurement(touchEventData);
            if (!measurementData) {
                return;
            }

            cornerstoneTools.addToolState(element, touchToolInterface.toolType, measurementData);

            if (Object.keys(measurementData.handles).length === 1 && touchEventData.type === 'CornerstoneToolsTap') {
                measurementData.active = false;
                measurementData.handles.end.active = false;
                measurementData.handles.end.highlight = false;
                measurementData.invalidated = true;
                if (cornerstoneTools.anyHandlesOutsideImage(touchEventData, measurementData.handles)) {
                    // delete the measurement
                    cornerstoneTools.removeToolState(element, touchToolInterface.toolType, measurementData);
                }

                cornerstone.updateImage(element);
                return;
            }

            $(element).off('CornerstoneToolsDragStart', touchToolInterface.touchStartCallback || touchStartCallback);
            $(element).off('CornerstoneToolsDragStartActive', touchToolInterface.touchDownActivateCallback || touchDownActivateCallback);
            $(element).off('CornerstoneToolsTouchDrag', touchToolInterface.touchMoveCallback || touchMoveCallback);
            $(element).off('CornerstoneToolsTap', touchToolInterface.touchDownActivateCallback || touchDownActivateCallback);

            cornerstone.updateImage(element);
            cornerstoneTools.moveNewHandleTouch(touchEventData, measurementData.handles.end, function() {
                measurementData.active = false;
                measurementData.invalidated = true;
                if (cornerstoneTools.anyHandlesOutsideImage(touchEventData, measurementData.handles)) {
                    // delete the measurement
                    cornerstoneTools.removeToolState(element, touchToolInterface.toolType, measurementData);
                }

                $(element).on('CornerstoneToolsDragStart', touchToolInterface.touchStartCallback || touchStartCallback);
                $(element).on('CornerstoneToolsDragStartActive', touchToolInterface.touchDownActivateCallback || touchDownActivateCallback);
                $(element).on('CornerstoneToolsTouchDrag', touchToolInterface.touchMoveCallback || touchMoveCallback);
                $(element).on('CornerstoneToolsTap', touchToolInterface.touchDownActivateCallback || touchDownActivateCallback);
                cornerstone.updateImage(element);
            });
        }

        function touchDownActivateCallback(e, eventData) {
            if (touchToolInterface.addNewMeasurement) {
                touchToolInterface.addNewMeasurement(eventData);
            } else {
                addNewMeasurement(eventData);
            }

            return false; // false = causes jquery to preventDefault() and stopPropagation() this event
        }
        ///////// END ACTIVE TOOL ///////

        ///////// BEGIN INACTIVE TOOL ///////
        function touchMoveCallback(e, eventData) {
            cornerstoneTools.toolCoordinates.setCoords(eventData);
      
            // if we have no tool data for this element, do nothing
            var toolData = cornerstoneTools.getToolState(eventData.element, touchToolInterface.toolType);
            if (toolData === undefined) {
                return;
            }

            // We have tool data, search through all data
            // and see if we can activate a handle
            var imageNeedsUpdate = false;
            for (var i = 0; i < toolData.data.length; i++) {
                // get the touch position in canvas coordinates
                var coords = eventData.currentPoints.canvas;

                var data = toolData.data[i];
                if (cornerstoneTools.handleActivator(eventData.element, data.handles, coords) === true) {
                    imageNeedsUpdate = true;
                }
            }

            // Handle activation status changed, redraw the image
            if (imageNeedsUpdate === true) {
                cornerstone.updateImage(eventData.element);
            }
        }

        function touchStartCallback(e, eventData) {
            var data;

            function handleDoneMove() {
                data.active = false;
                data.invalidated = true;
                if (cornerstoneTools.anyHandlesOutsideImage(eventData, data.handles)) {
                    // delete the measurement
                    cornerstoneTools.removeToolState(eventData.element, touchToolInterface.toolType, data);
                }

                cornerstone.updateImage(eventData.element);
                $(eventData.element).on('CornerstoneToolsTouchDrag', touchToolInterface.touchMoveCallback || touchMoveCallback);
            }

            var coords = eventData.startPoints.canvas;
            var toolData = cornerstoneTools.getToolState(e.currentTarget, touchToolInterface.toolType);
            var i;

            // now check to see if there is a handle we can move
            if (toolData) {
                for (i = 0; i < toolData.data.length; i++) {
                    data = toolData.data[i];

                    var handle = cornerstoneTools.getHandleNearImagePoint(eventData.element, data, coords);
                    if (handle) {
                        $(eventData.element).off('CornerstoneToolsTouchDrag', touchToolInterface.touchMoveCallback || touchMoveCallback);
                        data.active = true;
                        cornerstoneTools.moveNewHandleTouch(e, handle, handleDoneMove);
                        e.stopImmediatePropagation();
                        return false; // false = causes jquery to preventDefault() and stopPropagation() this event
                    }
                }
            }

            // Now check to see if we have a tool that we can move
            if (toolData !== undefined && touchToolInterface.pointNearTool !== undefined) {
                for (i = 0; i < toolData.data.length; i++) {
                    data = toolData.data[i];
                    if (touchToolInterface.pointNearTool(eventData.element, data, coords)) {
                        $(eventData.element).off('CornerstoneToolsTouchDrag', touchToolInterface.touchMoveCallback || touchMoveCallback);
                        cornerstoneTools.touchMoveAllHandles(e, data, toolData, true);
                        $(eventData.element).on('CornerstoneToolsTouchDrag', touchToolInterface.touchMoveCallback || touchMoveCallback);
                        e.stopImmediatePropagation();
                        return false; // false = causes jquery to preventDefault() and stopPropagation() this event
                    }
                }
            }
        }
        ///////// END INACTIVE TOOL ///////

        // not visible, not interactive
        function disable(element) {
            $(element).off('CornerstoneImageRendered', touchToolInterface.onImageRendered);
            $(element).off('CornerstoneToolsTouchDrag', touchToolInterface.touchMoveCallback || touchMoveCallback);
            $(element).off('CornerstoneToolsDragStart', touchToolInterface.touchStartCallback || touchStartCallback);
            $(element).off('CornerstoneToolsDragStartActive', touchToolInterface.touchDownActivateCallback || touchDownActivateCallback);
            $(element).off('CornerstoneToolsTap', touchToolInterface.touchDownActivateCallback || touchDownActivateCallback);

            if (touchToolInterface.doubleTapCallback) {
                $(element).off('CornerstoneToolsDoubleTap', touchToolInterface.doubleTapCallback);
            }
            
            if (touchToolInterface.pressCallback) {
                $(element).off('CornerstoneToolsTouchPress', touchToolInterface.pressCallback);
            }

            cornerstone.updateImage(element);
        }

        // visible but not interactive
        function enable(element) {
            $(element).off('CornerstoneImageRendered', touchToolInterface.onImageRendered);
            $(element).off('CornerstoneToolsTouchDrag', touchToolInterface.touchMoveCallback || touchMoveCallback);
            $(element).off('CornerstoneToolsDragStart', touchToolInterface.touchStartCallback || touchStartCallback);
            $(element).off('CornerstoneToolsDragStartActive', touchToolInterface.touchDownActivateCallback || touchDownActivateCallback);
            $(element).off('CornerstoneToolsTap', touchToolInterface.touchDownActivateCallback || touchDownActivateCallback);

            $(element).on('CornerstoneImageRendered', touchToolInterface.onImageRendered);

            if (touchToolInterface.doubleTapCallback) {
                $(element).off('CornerstoneToolsDoubleTap', touchToolInterface.doubleTapCallback);
            }

            if (touchToolInterface.pressCallback) {
                $(element).off('CornerstoneToolsTouchPress', touchToolInterface.pressCallback);
            }

            cornerstone.updateImage(element);
        }

        // visible, interactive and can create
        function activate(element) {
            $(element).off('CornerstoneImageRendered', touchToolInterface.onImageRendered);
            $(element).off('CornerstoneToolsTouchDrag', touchToolInterface.touchMoveCallback || touchMoveCallback);
            $(element).off('CornerstoneToolsDragStart', touchToolInterface.touchStartCallback || touchStartCallback);
            $(element).off('CornerstoneToolsDragStartActive', touchToolInterface.touchDownActivateCallback || touchDownActivateCallback);
            $(element).off('CornerstoneToolsTap', touchToolInterface.touchDownActivateCallback || touchDownActivateCallback);

            $(element).on('CornerstoneImageRendered', touchToolInterface.onImageRendered);
            $(element).on('CornerstoneToolsTouchDrag', touchToolInterface.touchMoveCallback || touchMoveCallback);
            $(element).on('CornerstoneToolsDragStart', touchToolInterface.touchStartCallback || touchStartCallback);
            $(element).on('CornerstoneToolsDragStartActive', touchToolInterface.touchDownActivateCallback || touchDownActivateCallback);
            $(element).on('CornerstoneToolsTap', touchToolInterface.touchDownActivateCallback || touchDownActivateCallback);

            if (touchToolInterface.doubleTapCallback) {
                $(element).off('CornerstoneToolsDoubleTap', touchToolInterface.doubleTapCallback);
                $(element).on('CornerstoneToolsDoubleTap', touchToolInterface.doubleTapCallback);
            }

            if (touchToolInterface.pressCallback) {
                $(element).off('CornerstoneToolsTouchPress', touchToolInterface.pressCallback);
                $(element).on('CornerstoneToolsTouchPress', touchToolInterface.pressCallback);
            }

            cornerstone.updateImage(element);
        }

        // visible, interactive
        function deactivate(element) {
            $(element).off('CornerstoneImageRendered', touchToolInterface.onImageRendered);
            $(element).off('CornerstoneToolsTouchDrag', touchToolInterface.touchMoveCallback || touchMoveCallback);
            $(element).off('CornerstoneToolsDragStart', touchToolInterface.touchStartCallback || touchStartCallback);
            $(element).off('CornerstoneToolsDragStartActive', touchToolInterface.touchDownActivateCallback || touchDownActivateCallback);
            $(element).off('CornerstoneToolsTap', touchToolInterface.touchDownActivateCallback || touchDownActivateCallback);

            $(element).on('CornerstoneImageRendered', touchToolInterface.onImageRendered);
            $(element).on('CornerstoneToolsTouchDrag', touchToolInterface.touchMoveCallback || touchMoveCallback);
            $(element).on('CornerstoneToolsDragStart', touchToolInterface.touchStartCallback || touchStartCallback);

            if (touchToolInterface.doubleTapCallback) {
                $(element).off('CornerstoneToolsDoubleTap', touchToolInterface.doubleTapCallback);
                $(element).on('CornerstoneToolsDoubleTap', touchToolInterface.doubleTapCallback);
            }

            if (touchToolInterface.pressCallback) {
                $(element).off('CornerstoneToolsTouchPress', touchToolInterface.pressCallback);
                $(element).on('CornerstoneToolsTouchPress', touchToolInterface.pressCallback);
            }

            cornerstone.updateImage(element);
        }

        var toolInterface = {
            enable: enable,
            disable: disable,
            activate: activate,
            deactivate: deactivate,
            touchStartCallback: touchStartCallback,
            touchMoveCallback: touchMoveCallback,
            touchDownActivateCallback: touchDownActivateCallback
        };

        if (touchToolInterface.doubleTapCallback) {
            toolInterface.doubleTapCallback = touchToolInterface.doubleTapCallback;
        }

        if (touchToolInterface.pressCallback) {
            toolInterface.pressCallback = touchToolInterface.pressCallback;
        }

        if (touchToolInterface.addNewMeasurement) {
            toolInterface.addNewMeasurement = touchToolInterface.addNewMeasurement;
        }

        return toolInterface;
    }

    // module exports
    cornerstoneTools.touchTool = touchTool;

})($, cornerstone, cornerstoneMath, cornerstoneTools);
