(function($, cornerstone, cornerstoneTools) {

    'use strict';

    function mouseUpCallback(e, eventData) {
        $(eventData.element).off('CornerstoneToolsMouseDrag', dragCallback);
        $(eventData.element).off('CornerstoneToolsMouseUp', mouseUpCallback);
    }

    function mouseDownCallback(e, eventData) {
        if (cornerstoneTools.isMouseButtonEnabled(eventData.which, e.data.mouseButtonMask)) {
            var mouseDragEventData = {
                deltaY: 0
            };
            $(eventData.element).on('CornerstoneToolsMouseDrag', mouseDragEventData, dragCallback);
            $(eventData.element).on('CornerstoneToolsMouseUp', mouseUpCallback);
            e.stopImmediatePropagation();
            return false;
        }
    }

    function mouseWheelCallback(e, eventData) {
        var images = -eventData.direction;
        cornerstoneTools.scroll(eventData.element, images);
    }

    function dragCallback(e, eventData) {
        var element = eventData.element;

        var toolData = cornerstoneTools.getToolState(element, 'stack');
        if (!toolData || !toolData.data || !toolData.data.length) {
            return;
        }
        
        var stackData = toolData.data[0];

        var config = cornerstoneTools.stackScroll.getConfiguration();

        // The Math.max here makes it easier to mouseDrag-scroll small image stacks
        var pixelsPerImage = $(element).height() / Math.max(stackData.imageIds.length, 8);
        if (config && config.stackScrollSpeed) {
            pixelsPerImage = config.stackScrollSpeed;
        }

        e.data.deltaY = e.data.deltaY || 0;
        e.data.deltaY += eventData.deltaPoints.page.y;
        if (Math.abs(e.data.deltaY) >= pixelsPerImage) {
            var imageDelta = e.data.deltaY / pixelsPerImage;
            var imageIdIndexOffset = Math.round(imageDelta);
            var imageDeltaMod = e.data.deltaY % pixelsPerImage;
            e.data.deltaY = imageDeltaMod;
            cornerstoneTools.scroll(element, imageIdIndexOffset);
        }

        return false; // false = causes jquery to preventDefault() and stopPropagation() this event
    }

    // module/private exports
    cornerstoneTools.stackScroll = cornerstoneTools.simpleMouseButtonTool(mouseDownCallback);
    cornerstoneTools.stackScrollWheel = cornerstoneTools.mouseWheelTool(mouseWheelCallback);

    var options = {
        eventData: {
            deltaY: 0
        }
    };
    cornerstoneTools.stackScrollTouchDrag = cornerstoneTools.touchDragTool(dragCallback, options);

})($, cornerstone, cornerstoneTools);
