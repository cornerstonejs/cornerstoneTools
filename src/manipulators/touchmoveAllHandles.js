(function($, cornerstone, cornerstoneMath, cornerstoneTools) {

    'use strict';

    function touchMoveAllHandles(touchEventData, data, toolData, deleteIfHandleOutsideImage) {
        var element = touchEventData.element;

        function touchDragCallback(e, eventData) {
            data.active = true;
            
            Object.keys(data.handles).forEach(function(name) {
                var handle = data.handles[name];
                handle.x += eventData.deltaPoints.image.x;
                handle.y += eventData.deltaPoints.image.y;
            });
            cornerstone.updateImage(element);
            return false; // false = causes jquery to preventDefault() and stopPropagation() this event
        }

        $(element).on('CornerstoneToolsTouchDrag', touchDragCallback);

        function touchEndCallback(e, eventData) {
            data.active = false;
            data.invalidated = false;

            $(element).off('CornerstoneToolsTouchDrag', touchDragCallback);
            $(element).off('CornerstoneToolsDragEnd', touchEndCallback);

            // If any handle is outside the image, delete the tool data
            if (deleteIfHandleOutsideImage === true) {
                var image = eventData.image;
                var handleOutsideImage = false;
                var rect = {
                    top: 0, left: 0, width: image.width, height: image.height
                };
                
                Object.keys(data.handles).forEach(function(name) {
                    var handle = data.handles[name];
                    if (cornerstoneMath.point.insideRect(handle, rect) === false) {
                        handleOutsideImage = true;
                        return;
                    }
                });

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

        $(element).on('CornerstoneToolsDragEnd', touchEndCallback);
        return true;
    }

    // module/private exports
    cornerstoneTools.touchMoveAllHandles = touchMoveAllHandles;

})($, cornerstone, cornerstoneMath, cornerstoneTools);
