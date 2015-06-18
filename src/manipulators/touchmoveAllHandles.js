var cornerstoneTools = (function($, cornerstone, cornerstoneMath, cornerstoneTools) {

    "use strict";

    if (cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }
    function touchMoveAllHandles(touchEventData, data, toolData, deleteIfHandleOutsideImage)
    {
        var element = touchEventData.element;

        function touchDragCallback(e, eventData) {
            data.active = true;
            
            var touchMoveData = eventData;
            for (var property in data.handles) {
                var handle = data.handles[property];
                handle.x += eventData.deltaPoints.image.x;
                handle.y += eventData.deltaPoints.image.y;
            }
            cornerstone.updateImage(element);
            return false; // false = causes jquery to preventDefault() and stopPropagation() this event
        }

        $(element).on("CornerstoneToolsTouchDrag", touchDragCallback);

        function touchEndCallback(e, eventData) {
            data.active = false;

            var touchendData = eventData;

            $(element).off('CornerstoneToolsTouchDrag', touchDragCallback);
            $(element).off('CornerstoneToolsDragEnd', touchEndCallback);

            // If any handle is outside the image, delete the tool data
            if (deleteIfHandleOutsideImage === true) {
                var image = eventData.image;//.getEnabledElement(element).image;
                var handleOutsideImage = false;
                var rect = {
                    top: 0,
                    left: 0,
                    width: image.width,
                    height: image.height
                };
                for (var property in data.handles) {
                    var handle = data.handles[property];
                    if (cornerstoneMath.point.insideRect(handle, rect) === false) {
                        handleOutsideImage = true;
                    }
                }

                if (handleOutsideImage) {
                    // find this tool data
                    var indexOfData = -1;
                    for (var i = 0; i < toolData.data.length; i++) {
                        if (toolData.data[i] === data) {
                            indexOfData = i;
                        }
                    }
                    if (indexOfData !== -1) {
                        toolData.data.splice(indexOfData, 1);
                    }
                }
            }
            cornerstone.updateImage(element);
        }

        $(element).on("CornerstoneToolsDragEnd", touchEndCallback);
        return true;
    }

    // module/private exports
    cornerstoneTools.touchMoveAllHandles = touchMoveAllHandles;

    return cornerstoneTools;
}($, cornerstone, cornerstoneMath, cornerstoneTools));