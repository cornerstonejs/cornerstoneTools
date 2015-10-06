(function($, cornerstone, cornerstoneTools) {

    'use strict';

    function moveNewHandleTouch(eventData, handle, doneMovingCallback, preventHandleOutsideImage) {
        var element = eventData.element;
        var distanceFromTouch = {
            x: handle.x - eventData.currentPoints.image.x,
            y: handle.y - eventData.currentPoints.image.y
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
        }
        
        function moveEndCallback(e, eventData) {
            $(element).off('CornerstoneToolsTouchDrag', moveCallback);
            $(element).off('CornerstoneToolsTouchEnd', moveEndCallback);
            $(element).off('CornerstoneToolsDragEnd', moveEndCallback);
            $(element).off('CornerstoneToolsTap', moveEndCallback);

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
        $(element).on('CornerstoneToolsTouchEnd', moveEndCallback);
        $(element).on('CornerstoneToolsDragEnd', moveEndCallback);
        $(element).on('CornerstoneToolsTap', moveEndCallback);
    }

    // module/private exports
    cornerstoneTools.moveNewHandleTouch = moveNewHandleTouch;

})($, cornerstone, cornerstoneTools);
