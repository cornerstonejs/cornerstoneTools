var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function moveHandle(mouseEventData, handle, doneMovingCallback)
    {
        var element = mouseEventData.element;

        function mouseDragCallback(e, eventData) {
            handle.x = eventData.currentPoints.image.x;
            handle.y = eventData.currentPoints.image.y;
            cornerstone.updateImage(element);
        }
        $(element).on("CornerstoneToolsMouseDrag", mouseDragCallback);

        function mouseUpCallback(e, eventData) {
            handle.eactive = false;
            $(element).off("CornerstoneToolsMouseDrag", mouseDragCallback);
            $(element).off("CornerstoneToolsMouseUp", mouseUpCallback);
            cornerstone.updateImage(element);

            doneMovingCallback();
        }
        $(element).on("CornerstoneToolsMouseUp", mouseUpCallback);
    }


    // module/private exports
    cornerstoneTools.moveHandle = moveHandle;

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));