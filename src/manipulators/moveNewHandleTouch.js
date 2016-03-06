(function($, cornerstone, cornerstoneTools) {

    'use strict';

    function moveNewHandleTouch(eventData, toolType, data, handle, doneMovingCallback, preventHandleOutsideImage) {
        //console.log('moveNewHandleTouch');
        var element = eventData.element;
        var imageCoords = cornerstone.pageToPixel(element, eventData.currentPoints.page.x, eventData.currentPoints.page.y + 50);
        var distanceFromTouch = {
            x: handle.x - imageCoords.x,
            y: handle.y - imageCoords.y
        };

        handle.active = true;
        data.active = true;

        function moveCallback(e, eventData) {
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
            $(element).off('CornerstoneToolsTouchEnd', moveEndCallback);
            $(element).off('CornerstoneToolsTap', moveEndCallback);
            $(element).off('CornerstoneToolsTouchStart', stopImmediatePropagation);
            $(element).off('CornerstoneToolsToolDeactivated', toolDeactivatedCallback);

            if (e.type === 'CornerstoneToolsTouchPinch' || e.type === 'CornerstoneToolsTouchPress') {
                handle.active = false;
                cornerstone.updateImage(element);
                doneMovingCallback();
                return;
            }

            handle.active = false;
            data.active = false;
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

        function stopImmediatePropagation(e) {
            // Stop the CornerstoneToolsTouchStart event from 
            // become a CornerstoneToolsTouchStartActive event when
            // moveNewHandleTouch ends
            e.stopImmediatePropagation();
            return false;
        }

        $(element).on('CornerstoneToolsTouchDrag', moveCallback);
        $(element).on('CornerstoneToolsTouchPinch', moveEndCallback);
        $(element).on('CornerstoneToolsTouchEnd', moveEndCallback);
        $(element).on('CornerstoneToolsTap', moveEndCallback);
        $(element).on('CornerstoneToolsTouchStart', stopImmediatePropagation);

        function toolDeactivatedCallback() {
            $(element).off('CornerstoneToolsTouchDrag', moveCallback);
            $(element).off('CornerstoneToolsTouchPinch', moveEndCallback);
            $(element).off('CornerstoneToolsTouchEnd', moveEndCallback);
            $(element).off('CornerstoneToolsTap', moveEndCallback);
            $(element).off('CornerstoneToolsTouchStart', stopImmediatePropagation);
            $(element).off('CornerstoneToolsToolDeactivated', toolDeactivatedCallback);

            handle.active = false;
            data.active = false;
            handle.x = eventData.currentPoints.image.x + distanceFromTouch.x;
            handle.y = eventData.currentPoints.image.y + distanceFromTouch.y;
            
            if (preventHandleOutsideImage) {
                handle.x = Math.max(handle.x, 0);
                handle.x = Math.min(handle.x, eventData.image.width);

                handle.y = Math.max(handle.y, 0);
                handle.y = Math.min(handle.y, eventData.image.height);
            }

            cornerstone.updateImage(element);
        }

        $(element).on('CornerstoneToolsToolDeactivated', toolDeactivatedCallback);
    }

    // module/private exports
    cornerstoneTools.moveNewHandleTouch = moveNewHandleTouch;

})($, cornerstone, cornerstoneTools);
