var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function correctShift(shift, viewport) {
        //Apply rotations
        if(viewport.rotation!==0) {
            var angle = viewport.rotation * Math.PI/180;
    
            var cosA = Math.cos(angle);
            var sinA = Math.sin(angle);
    
            var newX = shift.x * cosA - shift.y * sinA;
            var newY = shift.x * sinA + shift.y * cosA;

            shift.x = newX;
            shift.y = newY;
        }

        //Apply Flips        
        if(viewport.hflip) {
            shift.x *=-1;
        }
        
        if(viewport.vflip) {
            shift.y *=-1;
        }
        return shift;
    }

    function zoom(element, viewport, ticks)
    {
        // Calculate the new scale factor based on how far the mouse has changed
        var pow = 1.7;
        var oldFactor = Math.log(viewport.scale) / Math.log(pow);
        var factor = oldFactor + ticks;
        var scale = Math.pow(pow, factor);
        viewport.scale = scale;
        cornerstone.setViewport(element, viewport);
    }

    function mouseUpCallback(e, eventData)
    {
        $(eventData.element).off("CornerstoneToolsMouseDrag", mouseDragCallback);
        $(eventData.element).off("CornerstoneToolsMouseUp", mouseUpCallback);

    }
    function mouseDownCallback(e, eventData)
    {
        if(cornerstoneTools.isMouseButtonEnabled(eventData.which, e.data.mouseButtonMask)) {
            $(eventData.element).on("CornerstoneToolsMouseDrag", mouseDragCallback);
            $(eventData.element).on("CornerstoneToolsMouseUp", mouseUpCallback);
            return false; // false = cases jquery to preventDefault() and stopPropagation() this event
        }
    }

    function mouseDragCallback(e, eventData)
    {

        var ticks = eventData.deltaPoints.page.y/100;
        zoom(eventData.element, eventData.viewport, ticks);

        // Now that the scale has been updated, determine the offset we need to apply to the center so we can
        // keep the original start location in the same position
        var newCoords = cornerstone.pageToPixel(eventData.element, eventData.startPoints.page.x, eventData.startPoints.page.y);
        var shift = {x: eventData.startPoints.image.x - newCoords.x,
                     y: eventData.startPoints.image.y - newCoords.y};

        shift = correctShift(shift, eventData.viewport);
        eventData.viewport.translation.x -= shift.x;
        eventData.viewport.translation.y -= shift.y;
        cornerstone.setViewport(eventData.element, eventData.viewport);
        return false; // false = causes jquery to preventDefault() and stopPropagation() this event
    }

    function mouseWheelCallback(e, eventData)
    {
        var ticks = -eventData.direction / 4;
        zoom(eventData.element, eventData.viewport, ticks);
    }

    function touchPinchCallback(e, eventData)
    {
        var pinchData = eventData;
        zoom(pinchData.element, pinchData.viewport, pinchData.direction / 4);
    }

    function zoomTouchDrag(e, eventData)
    {
        var dragData = eventData;
        var ticks = dragData.deltaPoints.page.y/100;
        zoom(dragData.element, dragData.viewport, ticks);

        // Now that the scale has been updated, determine the offset we need to apply to the center so we can
        // keep the original start location in the same position
        var newCoords = cornerstone.pageToPixel(dragData.element, dragData.startPoints.page.x, dragData.startPoints.page.y);
        var shift = {x: dragData.startPoints.image.x - newCoords.x,
                     y: dragData.startPoints.image.y - newCoords.y};

        shift = correctShift(shift, dragData.viewport);
        dragData.viewport.translation.x -= shift.x;
        dragData.viewport.translation.y -= shift.y;
        cornerstone.setViewport(dragData.element, dragData.viewport);
        return false; // false = causes jquery to preventDefault() and stopPropagation() this event
    }


    cornerstoneTools.zoom = cornerstoneTools.simpleMouseButtonTool(mouseDownCallback);
    cornerstoneTools.zoomWheel = cornerstoneTools.mouseWheelTool(mouseWheelCallback);
    cornerstoneTools.zoomTouchPinch = cornerstoneTools.touchPinchTool(touchPinchCallback);
    cornerstoneTools.zoomTouchDrag = cornerstoneTools.touchDragTool(zoomTouchDrag);
    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));
