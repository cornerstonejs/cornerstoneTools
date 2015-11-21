(function($, cornerstone, cornerstoneTools) {

    'use strict';

    function moveHandle(mouseEventData, toolType, data, handle, doneMovingCallback, preventHandleOutsideImage) {
        var element = mouseEventData.element;
        var distanceFromTool = {
            x: handle.x - mouseEventData.currentPoints.image.x,
            y: handle.y - mouseEventData.currentPoints.image.y
        };

        function mouseDragCallback(e, eventData) {
            handle.active = true;
            handle.x = eventData.currentPoints.image.x + distanceFromTool.x;
            handle.y = eventData.currentPoints.image.y + distanceFromTool.y;

            if (preventHandleOutsideImage) {
                handle.x = Math.max(handle.x, 0);
                handle.x = Math.min(handle.x, eventData.image.width);

                handle.y = Math.max(handle.y, 0);
                handle.y = Math.min(handle.y, eventData.image.height);
            }

            cornerstone.updateImage(element);

            var eventType = 'CornerstoneToolsMeasurementModified';
            var modifiedEventData = {
                toolType: toolType,
                element: element,
                measurementData: data
            };
            $(element).trigger(eventType, modifiedEventData);
        }

        $(element).on('CornerstoneToolsMouseDrag', mouseDragCallback);

        function mouseUpCallback() {
            handle.active = false;
            $(element).off('CornerstoneToolsMouseDrag', mouseDragCallback);
            $(element).off('CornerstoneToolsMouseUp', mouseUpCallback);
            $(element).off('CornerstoneToolsMouseClick', mouseUpCallback);
            cornerstone.updateImage(element);

            if (typeof doneMovingCallback === 'function') {
                doneMovingCallback();
            }
        }

        $(element).on('CornerstoneToolsMouseUp', mouseUpCallback);
        $(element).on('CornerstoneToolsMouseClick', mouseUpCallback);
    }

    // module/private exports
    cornerstoneTools.moveHandle = moveHandle;

})($, cornerstone, cornerstoneTools);
