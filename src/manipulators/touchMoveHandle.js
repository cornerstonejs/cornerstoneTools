(function($, cornerstone, cornerstoneTools) {

    'use strict';

    function touchMoveHandle(touchEventData, handle, doneMovingCallback) {
        var element = touchEventData.element;
        var distanceFromTouch = {
            x: handle.x - touchEventData.currentPoints.image.x,
            y: handle.y - touchEventData.currentPoints.image.y
        };

        function touchDragCallback(e, eventData) {
            handle.active = true;
            var touchMoveData = eventData;
            handle.x = touchMoveData.currentPoints.image.x + distanceFromTouch.x;
            handle.y = touchMoveData.currentPoints.image.y + distanceFromTouch.y;
            cornerstone.updateImage(element);
        }

        $(element).on('CornerstoneToolsTouchDrag', touchDragCallback);

        function touchEndCallback() {
            handle.active = false;
            $(element).off('CornerstoneToolsTouchDrag', touchDragCallback);
            $(element).off('CornerstoneToolsTouchEnd', touchEndCallback);
            $(element).off('CornerstoneToolsDragEnd', touchEndCallback);
            $(element).off('CornerstoneToolsTap', touchEndCallback);
            cornerstone.updateImage(element);

            if (typeof doneMovingCallback === 'function') {
                doneMovingCallback();
            }
        }

        $(element).on('CornerstoneToolsTouchEnd', touchEndCallback);
        $(element).on('CornerstoneToolsDragEnd', touchEndCallback);
        $(element).on('CornerstoneToolsTap', touchEndCallback);
    }

    // module/private exports
    cornerstoneTools.touchMoveHandle = touchMoveHandle;

})($, cornerstone, cornerstoneTools);
