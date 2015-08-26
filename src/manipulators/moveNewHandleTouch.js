(function($, cornerstone, cornerstoneTools) {

    'use strict';

    function moveNewHandleTouch(eventData, handle, doneMoveCallback, preventHandleOutsideImage) {
        var element = eventData.element;

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
        }
        
        function moveEndCallback(e, eventData) {
            $(element).off('CornerstoneToolsTouchDrag', moveCallback);
            $(element).off('CornerstoneToolsTap', moveEndCallback);
            $(element).off('CornerstoneToolsDragEnd', moveEndCallback);

            handle.active = false;
            handle.x = eventData.currentPoints.image.x;
            handle.y = eventData.currentPoints.image.y;
            
            if (preventHandleOutsideImage) {
                handle.x = Math.max(handle.x, 0);
                handle.x = Math.min(handle.x, eventData.image.width);

                handle.y = Math.max(handle.y, 0);
                handle.y = Math.min(handle.y, eventData.image.height);
            }

            cornerstone.updateImage(element);

            doneMoveCallback();
        }

        $(element).on('CornerstoneToolsTouchDrag', moveCallback);
        $(element).on('CornerstoneToolsDragEnd', moveEndCallback);
        $(element).on('CornerstoneToolsTap', moveEndCallback);
    }

    // module/private exports
    cornerstoneTools.moveNewHandleTouch = moveNewHandleTouch;

})($, cornerstone, cornerstoneTools);
