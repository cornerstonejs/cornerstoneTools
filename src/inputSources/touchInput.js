var cornerstoneTools = (function($, cornerstone, cornerstoneMath, cornerstoneTools) {

    "use strict";

    /*jshint newcap: false */

    if (cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    var lastScale = 1.0,
        lastRotation = 0.0,
        startPoints,
        lastPoints,
        touchEventDetail,
        eventData;
    

    function activateMouseDown(touchEventDetail) {
        $(touchEventDetail.element).trigger("CornerstoneToolsDragStartActive", touchEventDetail);
    }

    function onTouch(e) {
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

                // Check HERE?
                startPoints = {
                    page: cornerstoneMath.point.pageToPoint(e.pointers[0]),
                    image: cornerstone.pageToPixel(element, e.pointers[0].pageX, e.pointers[0].pageY),
                    client: {x: e.pointers[0].clientX, y: e.pointers[0].clientY}
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
                    client: {x: e.pointers[0].clientX, y: e.pointers[0].clientY}
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
                    client: {x: e.pointers[0].clientX, y: e.pointers[0].clientY}
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
                $(eventData.element).trigger(event, eventData);
                return cornerstoneTools.pauseEvent(e);

            case 'rotate':
                var rotation = e.rotation - lastRotation;
                lastRotation = e.rotation;

                eventData = {
                    event: e.srcEvent,
                    viewport: cornerstone.getViewport(element),
                    image: cornerstone.getEnabledElement(element).image,
                    element: element,
                    rotation: rotation
                };
                event = jQuery.Event("CornerstoneToolsTouchRotate", eventData);
                $(element).trigger(event, eventData);
                break;
        }
    }

    function enable(element) {
        var hammerOptions = {
            transform_always_block: true,
            transform_min_scale: 0.01,
            drag_block_horizontal: true,
            drag_block_vertical: true,
            drag_min_distance: 0
        };

        var panOptions = {
            threshold: 0,
            pointers: 0,
            direction: Hammer.DIRECTION_ALL
        };

        var mc = new Hammer(element);
        mc.set(hammerOptions);

        var pan = new Hammer.Pan(panOptions);
        var pinch = new Hammer.Pinch();
        var rotate = new Hammer.Rotate();

        // we want to detect both the same time
        pinch.recognizeWith(rotate);

        // add to the Manager
        mc.add([pan, pinch, rotate]);

        mc.on('panstart panmove panend pinch rotatestart rotate', onTouch);

        $(element).data("hammer", mc);
    }

    function disable(element) {
        var mc = $(element).data("hammer");
        mc.off('panstart panmove panend pinch rotate', onTouch);
    }

    // module exports
    cornerstoneTools.touchInput = {
        enable: enable,
        disable: disable
    };

    return cornerstoneTools;
}($, cornerstone, cornerstoneMath, cornerstoneTools));
