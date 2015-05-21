var cornerstoneTools = (function($, cornerstone, cornerstoneMath, cornerstoneTools) {

    "use strict";

    /*jshint newcap: false */

    if (cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    var lastScale = 1.0;

    var startPoints;
    var lastPoints,touchEventDetail,eventData;
    

    function activateMouseDown(mouseEventDetail)
    {
        $(mouseEventDetail.element).trigger("CornerstoneToolsDragStartActive", mouseEventDetail);
    }

    function onTouch(e)
    {
        e.gesture.preventDefault();
        e.gesture.stopPropagation();

        var element = e.currentTarget;
        var event;

        switch (e.type)
        {
            case 'transform':
                var scale = lastScale - e.gesture.scale;
                lastScale = e.gesture.scale;
                var tranformEvent = {
                    event:e,
                    viewport: cornerstone.getViewport(element),
                    image: cornerstone.getEnabledElement(element).image,
                    element: element,
                    direction: scale < 0 ? 1 : -1
                };

                event = jQuery.Event("CornerstoneToolsTouchPinch", tranformEvent);
                $(tranformEvent.element).trigger(event, tranformEvent);
                break;

            case 'touch':
                startPoints = {
                    page: cornerstoneMath.point.pageToPoint(e.gesture.touches[0]),
                    image: cornerstone.pageToPixel(element, e.gesture.touches[0].pageX, e.gesture.touches[0].pageY)
                };

                touchEventDetail = {
                    event: e,
                    viewport: cornerstone.getViewport(element),
                    image: cornerstone.getEnabledElement(element).image,
                    element: element,
                    startPoints: startPoints,
                    lastPoints: lastPoints,
                    currentPoints: startPoints,
                    deltaPoints: {x: 0, y: 0}
                };
                    
                event = jQuery.Event("CornerstoneToolsDragStart", touchEventDetail);
                $(touchEventDetail.element).trigger(event, touchEventDetail);
                lastPoints = cornerstoneTools.copyPoints(startPoints);

                if (event.isImmediatePropagationStopped() === false) {
                    // no tools responded to this event, give the active tool a chance
                    if (activateMouseDown(touchEventDetail) === true) {
                        return cornerstoneTools.pauseEvent(e);
                    }
                }
                break;

            case 'drag':
                // calculate our current points in page and image coordinates
                currentPoints = {
                    page: cornerstoneMath.point.pageToPoint(e.gesture.touches[0]),
                    image: cornerstone.pageToPixel(element, e.gesture.touches[0].pageX, e.gesture.touches[0].pageY)
                };

                // Calculate delta values in page and image coordinates
                deltaPoints = {
                    page: cornerstoneMath.point.subtract(currentPoints.page, lastPoints.page),
                    image: cornerstoneMath.point.subtract(currentPoints.image, lastPoints.image)
                };
              
                eventData = {
                    viewport: cornerstone.getViewport(element),
                    image: cornerstone.getEnabledElement(element).image,
                    element: element,
                    startPoints: startPoints,
                    lastPoints: lastPoints,
                    currentPoints: currentPoints,
                    deltaPoints: deltaPoints
                };

                $(touchEventDetail.element).trigger("CornerstoneToolsTouchDrag", eventData);

               lastPoints = cornerstoneTools.copyPoints(currentPoints);
               break;

            case 'dragend':
                var currentPoints = {
                    page: cornerstoneMath.point.pageToPoint(e.gesture.touches[0]),
                    image: cornerstone.pageToPixel(element, e.gesture.touches[0].pageX, e.gesture.touches[0].pageY)
                };

                // Calculate delta values in page and image coordinates
                var deltaPoints = {
                    page: cornerstoneMath.point.subtract(currentPoints.page, lastPoints.page),
                    image: cornerstoneMath.point.subtract(currentPoints.image, lastPoints.image)
                };

                eventData = {
                    event: e,
                    viewport: cornerstone.getViewport(element),
                    image: cornerstone.getEnabledElement(element).image,
                    element: element,
                    startPoints: startPoints,
                    lastPoints: lastPoints,
                    currentPoints: currentPoints,
                    deltaPoints: deltaPoints
                };
                event = jQuery.Event("CornerstoneToolsDragEnd", eventData);
                $(touchEventDetail.element).trigger(event, eventData);
                return cornerstoneTools.pauseEvent(e);
        }
    }

    function enable(element)
    {
        var hammerOptions = {
            transform_always_block: true,
            transform_min_scale: 0.01,
            drag_block_horizontal: true,
            drag_block_vertical: true,
            drag_min_distance: 0

        };
        $(element).hammer(hammerOptions).on("touch drag transform dragstart dragend", onTouch);
    }

    function disable(element) {
        $(element).hammer().off("touch drag transform dragstart dragend", onTouch);
    }

    // module exports
    cornerstoneTools.touchInput = {
        enable: enable,
        disable: disable
    };

    return cornerstoneTools;
}($, cornerstone, cornerstoneMath, cornerstoneTools));
