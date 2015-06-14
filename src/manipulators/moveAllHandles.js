var cornerstoneTools = (function ($, cornerstone, cornerstoneMath, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }



    function moveAllHandles(e, data, toolData, deleteIfHandleOutsideImage, preventHandleOutsideImage) {
        var mouseEventData = e;
        var element = mouseEventData.element;

        function mouseDragCallback(e, eventData) {
            data.active = true;

            for(var property in data.handles) {
                var handle = data.handles[property];
                handle.x += eventData.deltaPoints.image.x;
                handle.y += eventData.deltaPoints.image.y;
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
            }
            cornerstone.updateImage(element);
            return false; // false = cases jquery to preventDefault() and stopPropagation() this event
        }

        $(element).on("CornerstoneToolsMouseDrag", mouseDragCallback);

        function mouseUpCallback(e, eventData) {
            data.active = false;

            $(element).off('CornerstoneToolsMouseDrag', mouseDragCallback);
            $(element).off('CornerstoneToolsMouseUp', mouseUpCallback);

            // If any handle is outside the image, delete the tool data

            if(deleteIfHandleOutsideImage === true) {
                var image = eventData.image;//.getEnabledElement(element).image;
                var handleOutsideImage = false;
                var rect = {
                    top: 0,
                    left: 0,
                    width: image.width,
                    height: image.height
                };
                for(var property in data.handles) {
                    var handle = data.handles[property];
                    handle.active = false;
                    if(cornerstoneMath.point.insideRect(handle, rect) === false) {
                        handleOutsideImage = true;
                    }
                }

                if(handleOutsideImage) {
                    // find this tool data
                    var indexOfData = -1;
                    for(var i = 0; i < toolData.data.length; i++) {
                        if (toolData.data[i] === data) {
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
        
        $(element).on("CornerstoneToolsMouseUp", mouseUpCallback);
        return true;
    }


    // module/private exports
    cornerstoneTools.moveAllHandles = moveAllHandles;

    return cornerstoneTools;
}($, cornerstone, cornerstoneMath, cornerstoneTools));
