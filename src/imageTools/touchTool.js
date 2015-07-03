var cornerstoneTools = (function($, cornerstone, cornerstoneMath, cornerstoneTools) {

    "use strict";

    if (cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function touchTool(touchToolInterface) {
        ///////// BEGIN ACTIVE TOOL ///////
        function addNewMeasurement(touchEventData) {
            var measurementData = touchToolInterface.createNewMeasurement(touchEventData);
            cornerstoneTools.addToolState(touchEventData.element, touchToolInterface.toolType, measurementData);
            $(touchEventData.element).off('CornerstoneToolsTouchDrag', touchMoveCallback);

            cornerstoneTools.touchMoveHandle(touchEventData, measurementData.handles.end, function() {
                measurementData.active = false;
                measurementData.invalidated = true;
                if (cornerstoneTools.anyHandlesOutsideImage(touchEventData, measurementData.handles)) {
                    // delete the measurement
                    cornerstoneTools.removeToolState(touchEventData.element, touchToolInterface.toolType, measurementData);
                }
                $(touchEventData.element).on('CornerstoneToolsTouchDrag', touchMoveCallback);
                cornerstone.updateImage(mouseEventData.element);
            });
        }

        function touchDownActivateCallback(e, eventData) {
            addNewMeasurement(eventData);
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
                // get the touch position in image coordinates
                var data = toolData.data[i];
                if (cornerstoneTools.handleActivator(data.handles, eventData.currentPoints.image, eventData.viewport.scale) === true) {
                    imageNeedsUpdate = true;
                }
            }

            // Handle activation status changed, redraw the image
            if (imageNeedsUpdate === true) {
                cornerstone.updateImage(eventData.element);
            }
        }

        function getHandleNearImagePoint(data, coords) {
            for (var handle in data.handles) {
                var distanceSquared = cornerstoneMath.point.distanceSquared(data.handles[handle], coords);
                if (distanceSquared < 30) {
                    return data.handles[handle];
                }
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
                $(eventData.element).on('CornerstoneToolsTouchDrag', touchMoveCallback);
            }

            var coords = eventData.startPoints.image;
            var toolData = cornerstoneTools.getToolState(e.currentTarget, touchToolInterface.toolType);
            var i;

            // now check to see if there is a handle we can move
            if (toolData !== undefined) {
                for (i = 0; i < toolData.data.length; i++) {
                    data = toolData.data[i];

                    var handle = getHandleNearImagePoint(data, coords);
                    if (handle !== undefined) {
                        $(eventData.element).off('CornerstoneToolsTouchDrag', touchMoveCallback);
                        data.active = true;
                        cornerstoneTools.touchMoveHandle(e, handle, handleDoneMove);
                        e.stopImmediatePropagation();
                        return false; // false = causes jquery to preventDefault() and stopPropagation() this event
                    }
                }
            }

            // Now check to see if we have a tool that we can move
            if (toolData !== undefined && touchToolInterface.pointNearTool !== undefined) {
                for (i = 0; i < toolData.data.length; i++) {
                    data = toolData.data[i];
                    if (touchToolInterface.pointNearTool(data, coords)) {
                        $(eventData.element).off('CornerstoneToolsTouchDrag', touchMoveCallback);
                        cornerstoneTools.touchMoveAllHandles(e, data, toolData, true);
                        $(eventData.element).on('CornerstoneToolsTouchDrag', touchMoveCallback);
                        e.stopImmediatePropagation();
                        return false; // false = causes jquery to preventDefault() and stopPropagation() this event
                    }
                }
            }
        }
        ///////// END INACTIVE TOOL ///////

        // not visible, not interactive
        function disable(element) {
            $(element).off("CornerstoneImageRendered", touchToolInterface.onImageRendered);
            $(element).off('CornerstoneToolsTouchDrag', touchMoveCallback);
            $(element).off('CornerstoneToolsDragStart', touchStartCallback);
            $(element).off('CornerstoneToolsDragStartActive', touchDownActivateCallback);

            cornerstone.updateImage(element);
        }

        // visible but not interactive
        function enable(element) {
            $(element).off("CornerstoneImageRendered", touchToolInterface.onImageRendered);
            $(element).off('CornerstoneToolsTouchDrag', touchMoveCallback);
            $(element).off('CornerstoneToolsDragStart', touchStartCallback);
            $(element).off('CornerstoneToolsDragStartActive', touchDownActivateCallback);

            $(element).on("CornerstoneImageRendered", touchToolInterface.onImageRendered);

            cornerstone.updateImage(element);
        }

        // visible, interactive and can create
        function activate(element) {
            $(element).off("CornerstoneImageRendered", touchToolInterface.onImageRendered);
            $(element).off("CornerstoneToolsTouchDrag", touchMoveCallback);
            $(element).off("CornerstoneToolsDragStart", touchStartCallback);
            $(element).off('CornerstoneToolsDragStartActive', touchDownActivateCallback);

            $(element).on("CornerstoneImageRendered", touchToolInterface.onImageRendered);
            $(element).on("CornerstoneToolsTouchDrag", touchMoveCallback);
            $(element).on('CornerstoneToolsDragStart', touchStartCallback);
            $(element).on('CornerstoneToolsDragStartActive', touchDownActivateCallback);

            cornerstone.updateImage(element);
        }

        // visible, interactive
        function deactivate(element) {
            $(element).off("CornerstoneImageRendered", touchToolInterface.onImageRendered);
            $(element).off('CornerstoneToolsTouchDrag', touchMoveCallback);
            $(element).off('CornerstoneToolsDragStart', touchStartCallback);
            $(element).off('CornerstoneToolsDragStartActive', touchDownActivateCallback);

            $(element).on("CornerstoneImageRendered", touchToolInterface.onImageRendered);
            $(element).on("CornerstoneToolsTouchDrag", touchMoveCallback);
            $(element).on('CornerstoneToolsDragStart', touchStartCallback);

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
    cornerstoneTools.touchTool = touchTool;

    return cornerstoneTools;
}($, cornerstone, cornerstoneMath, cornerstoneTools));