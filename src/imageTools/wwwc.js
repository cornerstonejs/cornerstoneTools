(function($, cornerstone, cornerstoneTools) {

    'use strict';

    function mouseUpCallback(e, eventData) {
        $(eventData.element).off('CornerstoneToolsMouseDrag', mouseDragCallback);
        $(eventData.element).off('CornerstoneToolsMouseUp', mouseUpCallback);
    }

    function mouseDownCallback(e, eventData) {
        if (cornerstoneTools.isMouseButtonEnabled(eventData.which, e.data.mouseButtonMask)) {
            $(eventData.element).on('CornerstoneToolsMouseDrag', mouseDragCallback);
            $(eventData.element).on('CornerstoneToolsMouseUp', mouseUpCallback);
            return false; // false = cases jquery to preventDefault() and stopPropagation() this event
        }
    }

    function defaultStrategy(eventData) {
        // here we normalize the ww/wc adjustments so the same number of on screen pixels
        // adjusts the same percentage of the dynamic range of the image.  This is needed to
        // provide consistency for the ww/wc tool regardless of the dynamic range (e.g. an 8 bit
        // image will feel the same as a 16 bit image would)
        var maxVOI = eventData.image.maxPixelValue * eventData.image.slope + eventData.image.intercept;
        var minVOI = eventData.image.minPixelValue * eventData.image.slope + eventData.image.intercept;
        var imageDynamicRange = maxVOI - minVOI;
        var multiplier = imageDynamicRange / 1024;

        var deltaX = eventData.deltaPoints.page.x * multiplier;
        var deltaY = eventData.deltaPoints.page.y * multiplier;

        eventData.viewport.voi.windowWidth += (deltaX);
        eventData.viewport.voi.windowCenter += (deltaY);
    }

    function mouseDragCallback(e, eventData) {
        cornerstoneTools.wwwc.strategy(eventData);
        cornerstone.setViewport(eventData.element, eventData.viewport);
        return false; // false = cases jquery to preventDefault() and stopPropagation() this event
    }

    function touchDragCallback(e, eventData) {
        e.stopImmediatePropagation(); // Prevent CornerstoneToolsTouchStartActive from killing any press events
        var dragData = eventData;

        var maxVOI = dragData.image.maxPixelValue * dragData.image.slope + dragData.image.intercept;
        var minVOI = dragData.image.minPixelValue * dragData.image.slope + dragData.image.intercept;
        var imageDynamicRange = maxVOI - minVOI;
        var multiplier = imageDynamicRange / 1024;
        var deltaX = dragData.deltaPoints.page.x * multiplier;
        var deltaY = dragData.deltaPoints.page.y * multiplier;

        var config = cornerstoneTools.wwwc.getConfiguration();
        if (config.orientation) {
            if (config.orientation === 0) {
                dragData.viewport.voi.windowWidth += (deltaX);
                dragData.viewport.voi.windowCenter += (deltaY);
            } else {
                dragData.viewport.voi.windowWidth += (deltaY);
                dragData.viewport.voi.windowCenter += (deltaX);
            }
        } else {
            dragData.viewport.voi.windowWidth += (deltaX);
            dragData.viewport.voi.windowCenter += (deltaY);
        }

        cornerstone.setViewport(dragData.element, dragData.viewport);
    }

    cornerstoneTools.wwwc = cornerstoneTools.simpleMouseButtonTool(mouseDownCallback);
    cornerstoneTools.wwwc.strategies = {
        default: defaultStrategy
    };
    cornerstoneTools.wwwc.strategy = defaultStrategy;
    cornerstoneTools.wwwcTouchDrag = cornerstoneTools.touchDragTool(touchDragCallback);

})($, cornerstone, cornerstoneTools);
