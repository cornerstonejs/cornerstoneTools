// Begin Source: src/imageTools/touchTool.js

//var coordsData, colourChanger = "greenyellow";
var cornerstoneTools = (function($, cornerstone, cornerstoneMath, cornerstoneTools) {

    "use strict";

    if (cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function touchTool(touchToolInterface)
    {
        ///////// BEGIN ACTIVE TOOL ///////
        function addNewMeasurement(touchEventData)
        {
            var measurementData = touchToolInterface.createNewMeasurement(touchEventData);
            cornerstoneTools.addToolState(touchEventData.element, touchToolInterface.toolType, measurementData);
        }

        function touchDownActivateCallback(e) {
            var touchstart = e.originalEvent.detail;
            addNewMeasurement(touchstart);
            return false; // false = cases jquery to preventDefault() and stopPropagation() this event
        }
        ///////// END ACTIVE TOOL ///////

        ///////// BEGIN DEACTIVE TOOL ///////

        function touchMoveCallback(e)
        {
            var touchMoveData = e.originalEvent.detail;
            // if we have no tool data for this element, do nothing
            var toolData = cornerstoneTools.getToolState(touchMoveData.element, touchToolInterface.toolType);
            if (toolData === undefined) {
                return;
            }

            // We have tool data, search through all data
            // and see if we can activate a handle
            var imageNeedsUpdate = false;
            for (var i = 0; i < toolData.data.length; i++) {
                // get the touch position in image coordinates
                var data = toolData.data[i];
                if (cornerstoneTools.handleActivator(data.handles, touchMoveData.currentPoints.image, touchMoveData.viewport.scale) === true)
                {
                    imageNeedsUpdate = true;
                }
            }

            // Handle activation status changed, redraw the image
            if (imageNeedsUpdate === true) {
                cornerstone.updateImage(touchMoveData.element);
            }
        }

        function getHandleNearImagePoint(data, coords)
        {
            for (var handle in data.handles) {
                var distanceSquared = cornerstoneMath.point.distanceSquared(data.handles[handle], coords);
                if (distanceSquared < 30)
                {
                    return data.handles[handle];
                }
            }
        }

        function touchstartCallback(e) {
            var touchstart = e.originalEvent.detail;
            var data;

            function handleDoneMove()
            {
                if (cornerstoneTools.anyHandlesOutsideImage(touchstart, data.handles))
                {
                    // delete the measurement
                    cornerstoneTools.removeToolState(touchstart.element, touchToolInterface.toolType, data);
                }
                $(touchstart.element).on('CornerstoneToolsTouchDrag', touchMoveCallback);
            }

            var coords = touchstart.startPoints.image;
            var toolData = cornerstoneTools.getToolState(e.currentTarget, touchToolInterface.toolType);
            var i;

            // now check to see if there is a handle we can move
            if (toolData !== undefined) {
                for (i = 0; i < toolData.data.length; i++) {
                    data = toolData.data[i];
                    var handle = getHandleNearImagePoint(data, coords);
                    if (handle !== undefined) {
                        cornerstoneTools.touchmoveHandle(touchstart, handle, handleDoneMove);
                        return false; // false = cases jquery to preventDefault() and stopPropagation() this event
                    }
                }
            }

            // Now check to see if there is a line we can move
            // now check to see if we have a tool that we can move
            if (toolData !== undefined && touchToolInterface.pointNearTool !== undefined) {
                for (i = 0; i < toolData.data.length; i++) {
                    data = toolData.data[i];
                    if (touchToolInterface.pointNearTool(data, coords)) {
                        $(touchstart.element).off('CornerstoneToolsTouchDrag', touchMoveCallback);
                        cornerstoneTools.touchmoveAllHandles(e, data, toolData, true);
                        return false; // false = cases jquery to preventDefault() and stopPropagation() this event
                    }
                }
            }
//            }
        }
        ///////// END DEACTIVE TOOL ///////



        // not visible, not interactive
        function disable(element)
        {
            $(element).off("CornerstoneImageRendered", touchToolInterface.onImageRendered);
            $(element).off('CornerstoneToolsTouchDrag', touchMoveCallback);
            $(element).off('CornerstoneToolsDragStart', touchstartCallback);
            $(element).off('CornerstoneToolsDragStartActive', touchDownActivateCallback);

            cornerstone.updateImage(element);
        }

        // visible but not interactive
        function enable(element)
        {
            $(element).off("CornerstoneImageRendered", touchToolInterface.onImageRendered);
            $(element).off('CornerstoneToolsTouchDrag', touchMoveCallback);
            $(element).off('CornerstoneToolsDragStart', touchstartCallback);
            $(element).off('CornerstoneToolsDragStartActive', touchDownActivateCallback);

            $(element).on("CornerstoneImageRendered", touchToolInterface.onImageRendered);

            cornerstone.updateImage(element);
        }

        // visible, interactive and can create
        function activate(element) {

            $(element).off("CornerstoneImageRendered", touchToolInterface.onImageRendered);
            $(element).off("CornerstoneToolsTouchDrag", touchMoveCallback);
            $(element).off("CornerstoneToolsDragStart", touchstartCallback);
            $(element).off('CornerstoneToolsDragStartActive', touchDownActivateCallback);

            $(element).on("CornerstoneImageRendered", touchToolInterface.onImageRendered);
            $(element).on("CornerstoneToolsTouchDrag", touchMoveCallback);
            $(element).on('CornerstoneToolsDragStart', touchstartCallback);
            $(element).on('CornerstoneToolsDragStartActive', touchDownActivateCallback);

            cornerstone.updateImage(element);
        }

        // visible, interactive
        function deactivate(element) {
           

            $(element).off("CornerstoneImageRendered", touchToolInterface.onImageRendered);
            $(element).off('CornerstoneToolsTouchDrag', touchMoveCallback);
            $(element).off('CornerstoneToolsDragStart', touchstartCallback);
            $(element).off('CornerstoneToolsDragStartActive', touchDownActivateCallback);

            $(element).on("CornerstoneImageRendered", touchToolInterface.onImageRendered);
            $(element).on("CornerstoneToolsTouchDrag",  touchMoveCallback);
            $(element).on('CornerstoneToolsDragStart',  touchstartCallback);

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





