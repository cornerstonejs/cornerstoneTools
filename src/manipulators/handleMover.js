var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function moveHandle(mouseEventData, handle, doneMovingCallback, preventHandleOutsideImage)
    {
        var element = mouseEventData.element;

        function mouseDragCallback(e, eventData) {
            handle.x = eventData.currentPoints.image.x;
            handle.y = eventData.currentPoints.image.y;
            if (preventHandleOutsideImage)
            {
                if (handle.x < 0)
                {
                    handle.x = 0;
                }
                if (handle.x > eventData.image.width)
                {
                    handle.x = eventData.image.width;
                }
                if (handle.y < 0)
                {
                    handle.y = 0;
                }
                if (handle.y > eventData.image.height)
                {
                    handle.y = eventData.image.height;
                }
            }
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