(function($, cornerstone, cornerstoneMath, cornerstoneTools) {

    'use strict';

    /*jshint newcap: false */

    var lastScale = 1.0,
        lastRotation = 0.0,
        startPoints,
        currentPoints,
        lastPoints,
        deltaPoints,
        eventData;
    
    function activateMouseDown(eventData) {
        $(eventData.element).trigger('CornerstoneToolsDragStartActive', eventData);
    }

    function onTouch(e) {
        var element = e.target.parentNode,
            event,
            eventType;

        // Prevent mouse events from occurring alongside touch events
        e.preventDefault();

        switch (e.type) {
            case 'tap':
                // calculate our current points in page and image coordinates
                currentPoints = {
                    page: cornerstoneMath.point.pageToPoint(e.pointers[0]),
                    image: cornerstone.pageToPixel(element, e.pointers[0].pageX, e.pointers[0].pageY),
                    client: {
                        x: e.pointers[0].clientX,
                        y: e.pointers[0].clientY
                    }
                };
                currentPoints.canvas = cornerstone.pixelToCanvas(element, currentPoints.image);

                eventType = 'CornerstoneToolsTap';
                eventData = {
                    event: e,
                    viewport: cornerstone.getViewport(element),
                    image: cornerstone.getEnabledElement(element).image,
                    element: element,
                    currentPoints: currentPoints,
                    type: eventType
                };

                event = $.Event(eventType, eventData);
                $(element).trigger(event, eventData);
                break;

            case 'doubletap':
                // calculate our current points in page and image coordinates
                currentPoints = {
                    page: cornerstoneMath.point.pageToPoint(e.pointers[0]),
                    image: cornerstone.pageToPixel(element, e.pointers[0].pageX, e.pointers[0].pageY),
                    client: {
                        x: e.pointers[0].clientX,
                        y: e.pointers[0].clientY
                    }
                };
                currentPoints.canvas = cornerstone.pixelToCanvas(element, currentPoints.image);

                eventType = 'CornerstoneToolsDoubleTap';
                eventData = {
                    event: e,
                    viewport: cornerstone.getViewport(element),
                    image: cornerstone.getEnabledElement(element).image,
                    element: element,
                    currentPoints: currentPoints,
                    type: eventType
                };

                event = $.Event(eventType, eventData);
                $(element).trigger(event, eventData);
                break;

            case 'press':
                // calculate our current points in page and image coordinates
                currentPoints = {
                    page: cornerstoneMath.point.pageToPoint(e.pointers[0]),
                    image: cornerstone.pageToPixel(element, e.pointers[0].pageX, e.pointers[0].pageY),
                    client: {
                        x: e.pointers[0].clientX,
                        y: e.pointers[0].clientY
                    }
                };
                currentPoints.canvas = cornerstone.pixelToCanvas(element, currentPoints.image);

                eventType = 'CornerstoneToolsTouchPress';
                eventData = {
                    event: e,
                    viewport: cornerstone.getViewport(element),
                    image: cornerstone.getEnabledElement(element).image,
                    element: element,
                    currentPoints: currentPoints,
                    type: eventType
                };

                event = $.Event(eventType, eventData);
                $(element).trigger(event, eventData);
                break;

            case 'pinch':
                var scale = lastScale - e.scale;
                lastScale = e.scale;
                
                eventType = 'CornerstoneToolsTouchPinch';
                eventData = {
                    event: e,
                    viewport: cornerstone.getViewport(element),
                    image: cornerstone.getEnabledElement(element).image,
                    element: element,
                    direction: scale < 0 ? 1 : -1,
                    type: eventType
                };

                event = $.Event(eventType, eventData);
                $(element).trigger(event, eventData);
                break;

            case 'panstart':
                startPoints = {
                    page: cornerstoneMath.point.pageToPoint(e.pointers[0]), image: cornerstone.pageToPixel(element, e.pointers[0].pageX, e.pointers[0].pageY), client: {
                        x: e.pointers[0].clientX,
                        y: e.pointers[0].clientY
                    }
                };
                startPoints.canvas = cornerstone.pixelToCanvas(element, startPoints.image);

                if (e.pointers.length === 1) {
                    eventType = 'CornerstoneToolsDragStart';
                } else {
                    eventType = 'CornerstoneToolsMultiTouchDragStart';
                }

                eventData = {
                    event: e.srcEvent, viewport: cornerstone.getViewport(element), image: cornerstone.getEnabledElement(element).image, element: element, startPoints: startPoints, lastPoints: lastPoints, currentPoints: startPoints, deltaPoints: {
                        x: 0, y: 0
                    },
                    type: eventType
                };

                event = $.Event(eventType, eventData);
                $(eventData.element).trigger(event, eventData);
                lastPoints = cornerstoneTools.copyPoints(startPoints);

                if (event.isImmediatePropagationStopped() === false) {
                    // No current tools responded to the drag action.
                    // Create new tool measurement
                    activateMouseDown(eventData);
                }

                break;

            case 'panmove':
                // calculate our current points in page and image coordinates
                currentPoints = {
                    page: cornerstoneMath.point.pageToPoint(e.pointers[0]),
                    image: cornerstone.pageToPixel(element, e.pointers[0].pageX, e.pointers[0].pageY),
                    client: {
                        x: e.pointers[0].clientX,
                        y: e.pointers[0].clientY
                    }
                };
                currentPoints.canvas = cornerstone.pixelToCanvas(element, currentPoints.image);

                // Calculate delta values in page and image coordinates
                deltaPoints = {
                    page: cornerstoneMath.point.subtract(currentPoints.page, lastPoints.page), image: cornerstoneMath.point.subtract(currentPoints.image, lastPoints.image), client: cornerstoneMath.point.subtract(currentPoints.client, lastPoints.client), canvas: cornerstoneMath.point.subtract(currentPoints.canvas, lastPoints.canvas)
                };
              
                eventType = 'CornerstoneToolsTouchDrag';
                if (e.pointers.length > 1) {
                    eventType = 'CornerstoneToolsMultiTouchDrag';
                }

                eventData = {
                    viewport: cornerstone.getViewport(element), image: cornerstone.getEnabledElement(element).image, element: element, startPoints: startPoints, lastPoints: lastPoints, currentPoints: currentPoints, deltaPoints: deltaPoints,
                    type: eventType
                };

                event = $.Event(eventType, eventData);
                $(element).trigger(event, eventData);

                lastPoints = cornerstoneTools.copyPoints(currentPoints);
                break;

            case 'panend':
                // If lastPoints is not yet set, it means panend fired without panstart or pan,
                // so we can ignore this event
                if (!lastPoints) {
                    return false;
                }

                currentPoints = {
                    page: cornerstoneMath.point.pageToPoint(e.pointers[0]),
                    image: cornerstone.pageToPixel(element, e.pointers[0].pageX, e.pointers[0].pageY),
                    client: {
                        x: e.pointers[0].clientX,
                        y: e.pointers[0].clientY
                    }
                };
                currentPoints.canvas = cornerstone.pixelToCanvas(element, currentPoints.image);

                // Calculate delta values in page and image coordinates
                deltaPoints = {
                    page: cornerstoneMath.point.subtract(currentPoints.page, lastPoints.page), image: cornerstoneMath.point.subtract(currentPoints.image, lastPoints.image), client: cornerstoneMath.point.subtract(currentPoints.client, lastPoints.client), canvas: cornerstoneMath.point.subtract(currentPoints.canvas, lastPoints.canvas)
                };

                eventType = 'CornerstoneToolsDragEnd';
                if (e.pointers.length > 1) {
                    eventType = 'CornerstoneToolsMultiTouchDragEnd';
                }

                eventData = {
                    event: e.srcEvent,
                    viewport: cornerstone.getViewport(element),
                    image: cornerstone.getEnabledElement(element).image,
                    element: element,
                    startPoints: startPoints,
                    lastPoints: lastPoints,
                    currentPoints: currentPoints,
                    deltaPoints: deltaPoints,
                    type: eventType
                };

                event = $.Event(eventType, eventData);
                $(element).trigger(event, eventData);
                return cornerstoneTools.pauseEvent(e);

            case 'rotate':
                var rotation = e.rotation - lastRotation;
                lastRotation = e.rotation;

                eventType = 'CornerstoneToolsTouchRotate';
                eventData = {
                    event: e.srcEvent,
                    viewport: cornerstone.getViewport(element),
                    image: cornerstone.getEnabledElement(element).image,
                    element: element,
                    rotation: rotation,
                    type: eventType
                };
                event = $.Event(eventType, eventData);
                $(element).trigger(event, eventData);
                break;
        }
        return false;
    }

    function enable(element) {
        var hammerOptions = {
            transform_always_block: true,
            transform_min_scale: 0.01,
            drag_block_horizontal: true,
            drag_block_vertical: true,
            drag_min_distance: 0
        };

        var mc = new Hammer(element, {
            inputClass: Hammer.SUPPORT_POINTER_EVENTS ? Hammer.PointerEventInput : Hammer.TouchInput
        });
        mc.set(hammerOptions);

        var panOptions = {
            pointers: 0,
            direction: Hammer.DIRECTION_ALL
        };

        var pan = new Hammer.Pan(panOptions);
        var pinch = new Hammer.Pinch({
            threshold: 0.25
        });
        var rotate = new Hammer.Rotate({
            threshold: 0.05
        });
        var press = new Hammer.Press({
            threshold: 10
        });
        
        /*var doubletap = new Hammer.Tap({
            event: 'doubletap',
            taps: 2
        });*/
        // we want to detect both the same time
        pinch.recognizeWith(pan);
        pinch.recognizeWith(rotate);

        // add to the Manager
        mc.add([ press, pan, pinch, rotate ]);

        mc.on('press tap doubletap panstart panmove panend pinch rotate', onTouch);

        $(element).data('hammer', mc);
        cornerstoneTools.preventGhostClick(element);
    }

    function disable(element) {
        var mc = $(element).data('hammer');
        mc.off('press tap doubletap panstart panmove panend pinch rotate', onTouch);
    }

    // module exports
    cornerstoneTools.touchInput = {
        enable: enable, disable: disable
    };

})($, cornerstone, cornerstoneMath, cornerstoneTools);
