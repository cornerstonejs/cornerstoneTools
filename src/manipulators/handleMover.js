var cornerstoneTools = (function ($, cornerstone, csc, cornerstoneTools) {

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function moveHandle(mouseEventData, handle, doneMovingCallback)
    {
        var element = mouseEventData.element;

        function mouseDragCallback(e) {
            var mouseMoveData = e.originalEvent.detail;
            handle.x = mouseMoveData.currentPoints.image.x;
            handle.y = mouseMoveData.currentPoints.image.y;
            cornerstone.updateImage(element);
        }
        $(element).on("CornerstoneToolsMouseDrag", mouseDragCallback);

        function mouseUpCallback(mouseMoveData) {
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
}($, cornerstone, cornerstoneCore, cornerstoneTools));