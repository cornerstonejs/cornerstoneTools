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
            return false; // false = causes jquery to preventDefault() and stopPropagation() this event
        }
    }

    function mouseDragCallback(e, eventData) {
        eventData.viewport.translation.x += (eventData.deltaPoints.page.x / eventData.viewport.scale);
        eventData.viewport.translation.y += (eventData.deltaPoints.page.y / eventData.viewport.scale);
        cornerstone.setViewport(eventData.element, eventData.viewport);
        return false; // false = causes jquery to preventDefault() and stopPropagation() this event
    }

    function onDrag(e, eventData) {
        var dragData = eventData;
        dragData.viewport.translation.x += (dragData.deltaPoints.page.x / dragData.viewport.scale);
        dragData.viewport.translation.y += (dragData.deltaPoints.page.y / dragData.viewport.scale);
        cornerstone.setViewport(dragData.element, dragData.viewport);
        return false; // false = causes jquery to preventDefault() and stopPropagation() this event
    }

    cornerstoneTools.pan = cornerstoneTools.simpleMouseButtonTool(mouseDownCallback);
    cornerstoneTools.panTouchDrag = cornerstoneTools.touchDragTool(onDrag);

})($, cornerstone, cornerstoneTools);
