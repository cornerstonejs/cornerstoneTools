// Begin Source: src/manipulators/handletouchMover.js
var cornerstoneTools = (function($, cornerstone, cornerstoneTools) {

    "use strict";

    if (cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function touchmoveHandle(touchEventData, handle, doneMovingCallback)
    {
        var element = touchEventData.element;

        function touchDragCallback(e,eventData) {
            handle.active = true;
            var toucheMoveData = eventData;
            handle.x = toucheMoveData.currentPoints.image.x;
            handle.y = toucheMoveData.currentPoints.image.y;
            cornerstone.updateImage(element);
        }
        $(element).on("CornerstoneToolsTouchDrag", touchDragCallback);

        function touchendCallback(mouseMoveData) {
            handle.active = false;
            $(element).off("CornerstoneToolsTouchDrag", touchDragCallback);
            $(element).off("CornerstoneToolsDragEnd", touchendCallback);
            cornerstone.updateImage(element);

            doneMovingCallback();
        }
        $(element).on("CornerstoneToolsDragEnd", touchendCallback);
    }


    // module/private exports
    cornerstoneTools.touchmoveHandle = touchmoveHandle;

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));
