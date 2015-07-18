(function ($, cornerstone, cornerstoneTools) {

    "use strict";

    var toolType = "stackScroll";

    function mouseUpCallback(e, eventData) {
        $(eventData.element).off("CornerstoneToolsMouseDrag", mouseDragCallback);
        $(eventData.element).off("CornerstoneToolsMouseUp", mouseUpCallback);
    }

    function mouseDownCallback(e, eventData) {
        if (cornerstoneTools.isMouseButtonEnabled(eventData.which, e.data.mouseButtonMask)) {

            var mouseDragEventData = {
                deltaY : 0,
                options: e.data.options
            };
            $(eventData.element).on("CornerstoneToolsMouseDrag", mouseDragEventData, mouseDragCallback);
            $(eventData.element).on("CornerstoneToolsMouseUp", mouseUpCallback);
            e.stopImmediatePropagation();
            return false;
        }
    }

    function mouseDragCallback(e, eventData) {
        e.data.deltaY += eventData.deltaPoints.page.y;

        var element = eventData.element;

        var toolData = cornerstoneTools.getToolState(eventData.element, 'stack');
        if (toolData === undefined || toolData.data === undefined || toolData.data.length === 0) {
            return;
        }
        var stackData = toolData.data[0];

        // The Math.max here makes it easier to mouseDrag-scroll small image stacks
        var pixelsPerImage = $(eventData.element).height() / Math.max(stackData.imageIds.length, 8);
        if (e.data.options !== undefined && e.data.options.stackScrollSpeed !== undefined) {
            pixelsPerImage = e.data.options.stackScrollSpeed;
        }

        if (e.data.deltaY >= pixelsPerImage || e.data.deltaY <= -pixelsPerImage) {
            var imageDelta = e.data.deltaY / pixelsPerImage;
            var imageDeltaMod = e.data.deltaY % pixelsPerImage;
            var imageIdIndexOffset = Math.round(imageDelta);
            e.data.deltaY = imageDeltaMod;

            cornerstoneTools.scroll(element, imageIdIndexOffset);
        }

        return false; // false = cases jquery to preventDefault() and stopPropagation() this event
    }

    function mouseWheelCallback(e, eventData) {
        var images = -eventData.direction;
        cornerstoneTools.scroll(eventData.element, images);
    }

    function onDrag(e, eventData) {
        var element = eventData.element;
        eventData.deltaY = eventData.deltaY || 0;
        eventData.deltaY += eventData.deltaPoints.page.y;

        var toolData = cornerstoneTools.getToolState(eventData.element, 'stack');
        if (toolData === undefined || toolData.data === undefined || toolData.data.length === 0) {
            return;
        }

        var stackData = toolData.data[0];
        if (eventData.deltaY >= 3 || eventData.deltaY <= -3) {
            var imageDelta = eventData.deltaY / 3;
            var imageDeltaMod = eventData.deltaY % 3;
            var imageIdIndexOffset = Math.round(imageDelta);
            eventData.deltaY = imageDeltaMod;

            cornerstoneTools.scroll(element, imageIdIndexOffset);
        }

        return false; // false = cases jquery to preventDefault() and stopPropagation() this event
    }

    // module/private exports
    cornerstoneTools.stackScroll = cornerstoneTools.simpleMouseButtonTool(mouseDownCallback);
    cornerstoneTools.stackScrollWheel = cornerstoneTools.mouseWheelTool(mouseWheelCallback);
    cornerstoneTools.stackScrollTouchDrag = cornerstoneTools.touchDragTool(onDrag);

})($, cornerstone, cornerstoneTools);