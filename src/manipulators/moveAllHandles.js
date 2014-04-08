var cornerstoneTools = (function ($, cornerstone, csc, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }



    function moveAllHandles(e, data, toolData, deleteIfHandleOutsideImage)
    {
        var mouseEventData = e.originalEvent.detail;
        var element = mouseEventData.element;

        function mouseDragCallback(e)
        {
            var mouseMoveData = e.originalEvent.detail;
            for(var property in data.handles) {
                var handle = data.handles[property];
                handle.x += mouseMoveData.deltaPoints.image.x;
                handle.y += mouseMoveData.deltaPoints.image.y;
            }
            cornerstone.updateImage(element);
            return false; // false = cases jquery to preventDefault() and stopPropagation() this event
        }

        $(element).on("CornerstoneToolsMouseDrag", mouseDragCallback);

        function mouseUpCallback(e) {
            data.moving = false;
            var mouseUpData = e.originalEvent.detail;

            $(element).off('CornerstoneToolsMouseDrag', mouseDragCallback);
            $(element).off('CornerstoneToolsMouseUp', mouseUpCallback);

            // If any handle is outside the image, delete the tool data

            if(deleteIfHandleOutsideImage === true) {
                var image = mouseUpData.image;//.getEnabledElement(element).image;
                var handleOutsideImage = false;
                var rect = {
                    top: 0,
                    left: 0,
                    width: image.width,
                    height: image.height
                };
                for(var property in data.handles) {
                    var handle = data.handles[property];
                    if(cornerstoneTools.point.insideRect(handle, rect) === false)
                    {
                        handleOutsideImage = true;
                    }
                }

                if(handleOutsideImage)
                {
                    // find this tool data
                    var indexOfData = -1;
                    for(var i = 0; i < toolData.data.length; i++) {
                        if(toolData.data[i] === data)
                        {
                            indexOfData = i;
                        }
                    }
                    if(indexOfData !== -1) {
                        toolData.data.splice(indexOfData, 1);
                    }
                }
            }
            cornerstone.updateImage(element);
         }
        $(element).on("CornerstoneToolsMouseUp",mouseUpCallback);
        return true;
    }


    // module/private exports
    cornerstoneTools.moveAllHandles = moveAllHandles;

    return cornerstoneTools;
}($, cornerstone, cornerstoneCore, cornerstoneTools));