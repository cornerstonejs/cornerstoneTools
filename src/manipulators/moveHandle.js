(function($, cornerstone, cornerstoneTools) {

    'use strict';

    function moveHandle(mouseEventData, handle, doneMovingCallback, preventHandleOutsideImage) {
        var element = mouseEventData.element;

        function mouseDragCallback(e, eventData) {
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

        $(element).on('CornerstoneToolsMouseDrag', mouseDragCallback);

        function mouseUpCallback() {
            handle.active = false;
            $(element).off('CornerstoneToolsMouseDrag', mouseDragCallback);
            $(element).off('CornerstoneToolsMouseUp', mouseUpCallback);
            $(element).off('CornerstoneToolsMouseClick', mouseUpCallback);
            cornerstone.updateImage(element);

            doneMovingCallback();
        }

        $(element).on('CornerstoneToolsMouseUp', mouseUpCallback);
        $(element).on('CornerstoneToolsMouseClick', mouseUpCallback);
    }

    // module/private exports
    cornerstoneTools.moveHandle = moveHandle;

})($, cornerstone, cornerstoneTools);
