(function($, cornerstone, cornerstoneTools) {

    'use strict';

    function moveNewHandleTouch(eventData, toolType, data, handle, doneMovingCallback, preventHandleOutsideImage) {
        var element = eventData.element;
        var imageCoords = cornerstone.pageToPixel(element, eventData.currentPoints.page.x, eventData.currentPoints.page.y + 50);
        var distanceFromTouch = {
            x: handle.x - imageCoords.x,
            y: handle.y - imageCoords.y
        };

        function moveCallback(e, eventData) {
            handle.active = true;
            handle.x = eventData.currentPoints.image.x + distanceFromTouch.x;
            handle.y = eventData.currentPoints.image.y + distanceFromTouch.y;
            
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
        
        function moveEndCallback(e, eventData) {
            $(element).off('CornerstoneToolsTouchDrag', moveCallback);
            $(element).off('CornerstoneToolsTouchPinch', moveEndCallback);
            $(element).off('CornerstoneToolsTouchPress', moveEndCallback);
            $(element).off('CornerstoneToolsTouchEnd', moveEndCallback);
            $(element).off('CornerstoneToolsDragEnd', moveEndCallback);
            $(element).off('CornerstoneToolsTap', moveEndCallback);

            if (e.type === 'CornerstoneToolsTouchPinch' || e.type === 'CornerstoneToolsTouchPress') {
                handle.active = false;
                cornerstone.updateImage(element);
                doneMovingCallback();
                return;
            }

            handle.active = false;
            handle.x = eventData.currentPoints.image.x + distanceFromTouch.x;
            handle.y = eventData.currentPoints.image.y + distanceFromTouch.y;
            
            if (preventHandleOutsideImage) {
                handle.x = Math.max(handle.x, 0);
                handle.x = Math.min(handle.x, eventData.image.width);

                handle.y = Math.max(handle.y, 0);
                handle.y = Math.min(handle.y, eventData.image.height);
            }

            cornerstone.updateImage(element);

            if (typeof doneMovingCallback === 'function') {
                doneMovingCallback();
            }
        }

        $(element).on('CornerstoneToolsTouchDrag', moveCallback);
        $(element).on('CornerstoneToolsTouchPinch', moveEndCallback);
        $(element).on('CornerstoneToolsTouchPress', moveEndCallback);
        $(element).on('CornerstoneToolsTouchEnd', moveEndCallback);
        $(element).on('CornerstoneToolsDragEnd', moveEndCallback);
        $(element).on('CornerstoneToolsTap', moveEndCallback);
    }

    // module/private exports
    cornerstoneTools.moveNewHandleTouch = moveNewHandleTouch;

})($, cornerstone, cornerstoneTools);
