var cornerstoneTools = (function($, cornerstone, cornerstoneMath, cornerstoneTools) {

    "use strict";

    /*jshint newcap: false */

    if (cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    var lastScale = 1.0,
        startPoints,
        lastPoints,
        touchEventDetail,
        eventData;
    

    function activateMouseDown(touchEventDetail)
    {
        $(touchEventDetail.element).trigger("CornerstoneToolsDragStartActive", touchEventDetail);
    }

    function onTouch(e)
    {
        //e.srcEvent.preventDefault();
        //e.srcEvent.stopPropagation();

        var element = e.srcEvent.currentTarget;
        var event;

        switch (e.type)
        {
            case 'pinch':
                var scale = lastScale - e.scale;
                lastScale = e.scale;
                var tranformEvent = {
                    event: e,
                    viewport: cornerstone.getViewport(element),
                    image: cornerstone.getEnabledElement(element).image,
                    element: element,
                    direction: scale < 0 ? 1 : -1
                };

                event = jQuery.Event("CornerstoneToolsTouchPinch", tranformEvent);
                $(tranformEvent.element).trigger(event, tranformEvent);
                break;

            case 'panstart':
                startPoints = {
                    page: cornerstoneMath.point.pageToPoint(e.pointers[0]),
                    image: cornerstone.pageToPixel(element, e.pointers[0].pageX, e.pointers[0].pageY),
                    client: {x: e.gesture.center.clientX, y: e.gesture.center.clientY}
                };

                touchEventDetail = {
                    event: e.srcEvent,
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
                    // No current tools responded to the drag action.
                    // Create new tool measurement
                    activateMouseDown(touchEventDetail);
                }
                break;

            case 'panmove':
                // calculate our current points in page and image coordinates
                currentPoints = {
                    page: cornerstoneMath.point.pageToPoint(e.pointers[0]),
                    image: cornerstone.pageToPixel(element, e.pointers[0].pageX, e.pointers[0].pageY),
                    client: {x: e.gesture.center.clientX, y: e.gesture.center.clientY}
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

            case 'panend':
                var currentPoints = {
                    page: cornerstoneMath.point.pageToPoint(e.pointers[0]),
                    image: cornerstone.pageToPixel(element, e.pointers[0].pageX, e.pointers[0].pageY),
                    client: {x: e.gesture.center.clientX, y: e.gesture.center.clientY}
                };

                // Calculate delta values in page and image coordinates
                var deltaPoints = {
                    page: cornerstoneMath.point.subtract(currentPoints.page, lastPoints.page),
                    image: cornerstoneMath.point.subtract(currentPoints.image, lastPoints.image)
                };

                eventData = {
                    event: e.srcEvent,
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

        var mc = new Hammer.Manager(element);
        mc.set(hammerOptions);
        mc.add(new Hammer.Pan());
        
        // This weird line here is necessary to get panstart and panend to fire
        // See https://github.com/hammerjs/hammer.js/issues/723
        mc.add(new Hammer.Swipe()).recognizeWith(mc.get('pan'));

        mc.add(new Hammer.Pinch());
        
        mc.on('panstart panmove panend pinch', onTouch);
        $(element).data("hammer", mc);
    }

    function disable(element) {
        var mc = $(element).data("hammer");
        mc.off('panstart panmove panend pinch', onTouch);
    }

    // module exports
    cornerstoneTools.touchInput = {
        enable: enable,
        disable: disable
    };

    return cornerstoneTools;
}($, cornerstone, cornerstoneMath, cornerstoneTools));
