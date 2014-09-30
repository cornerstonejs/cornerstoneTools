// Begin Source: src/manipulators/touchmoveAllHandles.js
var cornerstoneTools = (function($, cornerstone, cornerstoneMath, cornerstoneTools) {

    "use strict";

    if (cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }
    function touchmoveAllHandles(e, data, toolData, deleteIfHandleOutsideImage)
    {
        var touchEventData = e;
        var element = touchEventData.element;

        function touchDragCallback(e,eventData)
        {
            var touchMoveData = eventData;
            for (var property in data.handles) {
                var handle = data.handles[property];
                handle.x += touchMoveData.deltaPoints.image.x;
                handle.y += touchMoveData.deltaPoints.image.y;
            }
            cornerstone.updateImage(element);
            return false; // false = cases jquery to preventDefault() and stopPropagation() this event
        }

        $(element).on("CornerstoneToolsTouchDrag", touchDragCallback);

        function touchendCallback(e,eventData) {
            data.moving = false;
            var touchendData = eventData;

            $(element).off('CornerstoneToolsTouchDrag', touchDragCallback);
            $(element).off('CornerstoneToolsDragEnd', touchendCallback);

            // If any handle is outside the image, delete the tool data

            if (deleteIfHandleOutsideImage === true) {
                var image = touchendData.image;//.getEnabledElement(element).image;
                var handleOutsideImage = false;
                var rect = {
                    top: 0,
                    left: 0,
                    width: image.width,
                    height: image.height
                };
                for (var property in data.handles) {
                    var handle = data.handles[property];
                    if (cornerstoneMath.point.insideRect(handle, rect) === false)
                    {
                        handleOutsideImage = true;
                    }
                }

                if (handleOutsideImage)
                {
                    // find this tool data
                    var indexOfData = -1;
                    for (var i = 0; i < toolData.data.length; i++) {
                        if (toolData.data[i] === data)
                        {
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
        $(element).on("CornerstoneToolsDragEnd", touchendCallback);
        return true;
    }
    // module/private exports
    cornerstoneTools.touchmoveAllHandles = touchmoveAllHandles;
    return cornerstoneTools;
}($, cornerstone, cornerstoneMath, cornerstoneTools));
