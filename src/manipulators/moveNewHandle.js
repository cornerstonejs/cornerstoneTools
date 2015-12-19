(function($, cornerstone, cornerstoneTools) {

    'use strict';

    function moveNewHandle(mouseEventData, toolType, data, handle, doneMovingCallback, preventHandleOutsideImage) {
        var element = mouseEventData.element;

        function moveCallback(e, eventData) {
            handle.active = true;
            handle.x = eventData.currentPoints.image.x;
            handle.y = eventData.currentPoints.image.y;
            
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

        function whichMovement(e) {
            $(element).off('CornerstoneToolsMouseMove');
            $(element).off('CornerstoneToolsMouseDrag');

            $(element).on('CornerstoneToolsMouseMove', moveCallback);
            $(element).on('CornerstoneToolsMouseDrag', moveCallback);
            
            $(element).on('CornerstoneToolsMouseClick', moveEndCallback);
            if (e.type === 'CornerstoneToolsMouseDrag') {
                $(element).on('CornerstoneToolsMouseUp', moveEndCallback);
            }
        }

        $(element).on('CornerstoneToolsMouseDrag', whichMovement);
        $(element).on('CornerstoneToolsMouseMove', whichMovement);
        
        function moveEndCallback() {
            $(element).off('CornerstoneToolsMouseMove', moveCallback);
            $(element).off('CornerstoneToolsMouseDrag', moveCallback);
            $(element).off('CornerstoneToolsMouseClick', moveEndCallback);
            $(element).off('CornerstoneToolsMouseUp', moveEndCallback);

            handle.active = false;
            cornerstone.updateImage(element);

            if (typeof doneMovingCallback === 'function') {
                doneMovingCallback();
            }
        }
    }

    // module/private exports
    cornerstoneTools.moveNewHandle = moveNewHandle;

})($, cornerstone, cornerstoneTools);
