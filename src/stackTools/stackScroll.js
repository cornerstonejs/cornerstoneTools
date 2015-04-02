var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    var toolType = "stackScroll";

    function scroll(element, images)
    {
        var toolData = cornerstoneTools.getToolState(element, 'stack');
        if(toolData === undefined || toolData.data === undefined || toolData.data.length === 0) {
            return;
        }

        var stackData = toolData.data[0];

        var newImageIdIndex = stackData.currentImageIdIndex + images;
        newImageIdIndex = Math.min(stackData.imageIds.length - 1, newImageIdIndex);
        newImageIdIndex = Math.max(0, newImageIdIndex);

        if(newImageIdIndex !== stackData.currentImageIdIndex)
        {
            var viewport = cornerstone.getViewport(element);

            cornerstone.loadAndCacheImage(stackData.imageIds[newImageIdIndex], element).then(function(image) {
                stackData = toolData.data[0];
                if(stackData.newImageIdIndex !== newImageIdIndex) {
                    stackData.currentImageIdIndex = newImageIdIndex;
                    cornerstone.displayImage(element, image, viewport);
                }
            });
        }
    }

    function mouseUpCallback(e, eventData)
    {
        $(eventData.element).off("CornerstoneToolsMouseDrag", mouseDragCallback);
        $(eventData.element).off("CornerstoneToolsMouseUp", mouseUpCallback);
    }

    function mouseDownCallback(e, eventData)
    {
        if(cornerstoneTools.isMouseButtonEnabled(eventData.which, e.data.mouseButtonMask)) {

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

    function mouseDragCallback(e, eventData)
    {
        e.data.deltaY += eventData.deltaPoints.page.y;

        var toolData = cornerstoneTools.getToolState(eventData.element, 'stack');
        if(toolData === undefined || toolData.data === undefined || toolData.data.length === 0) {
            return;
        }
        var stackData = toolData.data[0];

        var pixelsPerImage = $(eventData.element).height() / stackData.imageIds.length ;
        if(e.data.options !== undefined && e.data.options.stackScrollSpeed !== undefined) {
            pixelsPerImage = e.data.options.stackScrollSpeed;
        }

        if(e.data.deltaY >=pixelsPerImage || e.data.deltaY <= -pixelsPerImage)
        {
            var imageDelta = e.data.deltaY / pixelsPerImage;
            var imageDeltaMod = e.data.deltaY % pixelsPerImage;
            var imageIdIndexOffset = Math.round(imageDelta);
            e.data.deltaY = imageDeltaMod;

            var imageIdIndex = stackData.currentImageIdIndex + imageIdIndexOffset;
            imageIdIndex = Math.min(stackData.imageIds.length - 1, imageIdIndex);
            imageIdIndex = Math.max(0, imageIdIndex);
            if(imageIdIndex !== stackData.currentImageIdIndex)
            {
                stackData.currentImageIdIndex = imageIdIndex;
                var viewport = cornerstone.getViewport(eventData.element);
                cornerstone.loadAndCacheImage(stackData.imageIds[imageIdIndex], eventData.element).then(function(image) {
                    // only display this image if it is the current one to be displayed - it may not
                    // be if the user scrolls quickly
                    var stackData = toolData.data[0];
                    if(stackData.currentImageIdIndex === imageIdIndex) {
                        cornerstone.displayImage(eventData.element, image, viewport);
                    }
                });
            }

        }

        return false; // false = cases jquery to preventDefault() and stopPropagation() this event
    }

    function mouseWheelCallback(e, eventData)
    {
        var images = -eventData.direction;
        scroll(eventData.element, images);
    }

    function onDrag(e, mouseMoveData, data) {
        /*var eventData = {
            deltaY : 0
        };*/
        var eventData = e.data;

        eventData.deltaY += mouseMoveData.deltaPoints.page.y;

        var toolData = cornerstoneTools.getToolState(mouseMoveData.element, 'stack');
        if(toolData === undefined || toolData.data === undefined || toolData.data.length === 0) {
            return;
        }

        var stackData = toolData.data[0];
        if(eventData.deltaY >=3 || eventData.deltaY <= -3)
        {
            var imageDelta = eventData.deltaY / 3;
            var imageDeltaMod = eventData.deltaY % 3;
            var imageIdIndexOffset = Math.round(imageDelta);
            eventData.deltaY = imageDeltaMod;

            var imageIdIndex = stackData.currentImageIdIndex + imageIdIndexOffset;
            imageIdIndex = Math.min(stackData.imageIds.length - 1, imageIdIndex);
            imageIdIndex = Math.max(0, imageIdIndex);
            if(imageIdIndex !== stackData.currentImageIdIndex)
            {
                stackData.currentImageIdIndex = imageIdIndex;
                var viewport = cornerstone.getViewport(mouseMoveData.element);
                cornerstone.loadAndCacheImage(stackData.imageIds[imageIdIndex], mouseMoveData.element).then(function(image) {
                    // only display this image if it is the current one to be displayed - it may not
                    // be if the user scrolls quickly
                    if(stackData.currentImageIdIndex === imageIdIndex) {
                        cornerstone.displayImage(mouseMoveData.element, image, viewport);
                    }
                });
            }
        }

        return false; // false = cases jquery to preventDefault() and stopPropagation() this event
    }

    // module/private exports
    cornerstoneTools.stackScroll = cornerstoneTools.simpleMouseButtonTool(mouseDownCallback);
    cornerstoneTools.stackScrollWheel = cornerstoneTools.mouseWheelTool(mouseWheelCallback);
    cornerstoneTools.stackScrollTouchDrag = cornerstoneTools.touchDragTool(onDrag);

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));