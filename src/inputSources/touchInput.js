(function($, cornerstone, cornerstoneMath, cornerstoneTools) {

    'use strict';

    /*jshint newcap: false */

    var initScale = 1.0,
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
        console.log(e.type);
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
                    type: eventType,
                    isTouchEvent: true
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
                    type: eventType,
                    isTouchEvent: true
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
                    type: eventType,
                    isTouchEvent: true
                };

                event = $.Event(eventType, eventData);
                $(element).trigger(event, eventData);
                break;

            case 'pinchstart':
                console.log('pinchstart');
                var viewport = cornerstone.getViewport(element);
                initScale = viewport.scale || 1;
                break;

            case 'pinchmove':
                var scaleChange = initScale * e.scale;
                
                startPoints = {
                    page: e.center,
                    image: cornerstone.pageToPixel(element, e.center.x, e.center.y),
                };
                startPoints.canvas = cornerstone.pixelToCanvas(element, startPoints.image);

                eventType = 'CornerstoneToolsTouchPinch';
                eventData = {
                    event: e,
                    startPoints: startPoints,
                    viewport: cornerstone.getViewport(element),
                    image: cornerstone.getEnabledElement(element).image,
                    element: element,
                    direction: e.scale < 1 ? 1 : -1,
                    scaleChange: scaleChange,
                    type: eventType,
                    isTouchEvent: true
                };

                event = $.Event(eventType, eventData);
                $(element).trigger(event, eventData);
                break;

            case 'touchstart':
                startPoints = {
                    page: cornerstoneMath.point.pageToPoint(e.originalEvent.touches[0]),
                    image: cornerstone.pageToPixel(element, e.originalEvent.touches[0].pageX, e.originalEvent.touches[0].pageY),
                    client: {
                        x: e.originalEvent.touches[0].clientX,
                        y: e.originalEvent.touches[0].clientY
                    }
                };
                startPoints.canvas = cornerstone.pixelToCanvas(element, startPoints.image);

                eventType = 'CornerstoneToolsTouchStart';

                eventData = {
                    event: e.srcEvent,
                    viewport: cornerstone.getViewport(element),
                    image: cornerstone.getEnabledElement(element).image,
                    element: element,
                    startPoints: startPoints,
                    currentPoints: startPoints,
                    type: eventType,
                    isTouchEvent: true
                };

                event = $.Event(eventType, eventData);
                $(eventData.element).trigger(event, eventData);
                break;

            case 'touchend':
                startPoints = {
                    page: cornerstoneMath.point.pageToPoint(e.originalEvent.changedTouches[0]),
                    image: cornerstone.pageToPixel(element, e.originalEvent.changedTouches[0].pageX, e.originalEvent.changedTouches[0].pageY),
                    client: {
                        x: e.originalEvent.changedTouches[0].clientX,
                        y: e.originalEvent.changedTouches[0].clientY
                    }
                };
                startPoints.canvas = cornerstone.pixelToCanvas(element, startPoints.image);

                eventType = 'CornerstoneToolsTouchEnd';

                eventData = {
                    event: e.srcEvent,
                    viewport: cornerstone.getViewport(element),
                    image: cornerstone.getEnabledElement(element).image,
                    element: element,
                    startPoints: startPoints,
                    currentPoints: startPoints,
                    type: eventType,
                    isTouchEvent: true
                };

                event = $.Event(eventType, eventData);
                $(eventData.element).trigger(event, eventData);
                break;

            case 'panstart':
                startPoints = {
                    page: cornerstoneMath.point.pageToPoint(e.pointers[0]),
                    image: cornerstone.pageToPixel(element, e.pointers[0].pageX, e.pointers[0].pageY),
                    client: {
                        x: e.pointers[0].clientX,
                        y: e.pointers[0].clientY
                    }
                };
                startPoints.canvas = cornerstone.pixelToCanvas(element, startPoints.image);

                eventType = 'CornerstoneToolsDragStart';
                if (e.pointers.length > 1) {
                    eventType = 'CornerstoneToolsMultiTouchDragStart';
                }

                eventData = {
                    event: e.srcEvent,
                    viewport: cornerstone.getViewport(element),
                    image: cornerstone.getEnabledElement(element).image,
                    element: element,
                    startPoints: startPoints,
                    lastPoints: lastPoints,
                    currentPoints: startPoints,
                    deltaPoints: {
                        x: 0, y: 0
                    },
                    type: eventType,
                    isTouchEvent: true
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
                    page: cornerstoneMath.point.subtract(currentPoints.page, lastPoints.page),
                    image: cornerstoneMath.point.subtract(currentPoints.image, lastPoints.image),
                    client: cornerstoneMath.point.subtract(currentPoints.client, lastPoints.client),
                    canvas: cornerstoneMath.point.subtract(currentPoints.canvas, lastPoints.canvas)
                };
              
                eventType = 'CornerstoneToolsTouchDrag';
                if (e.pointers.length > 1) {
                    eventType = 'CornerstoneToolsMultiTouchDrag';
                }

                eventData = {
                    viewport: cornerstone.getViewport(element),
                    image: cornerstone.getEnabledElement(element).image,
                    element: element,
                    startPoints: startPoints,
                    lastPoints: lastPoints,
                    currentPoints: currentPoints,
                    deltaPoints: deltaPoints,
                    numPointers: e.pointers.length,
                    type: eventType,
                    isTouchEvent: true
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
                    page: cornerstoneMath.point.subtract(currentPoints.page, lastPoints.page),
                    image: cornerstoneMath.point.subtract(currentPoints.image, lastPoints.image),
                    client: cornerstoneMath.point.subtract(currentPoints.client, lastPoints.client),
                    canvas: cornerstoneMath.point.subtract(currentPoints.canvas, lastPoints.canvas)
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
                    type: eventType,
                    isTouchEvent: true
                };

                event = $.Event(eventType, eventData);
                $(element).trigger(event, eventData);
                return cornerstoneTools.pauseEvent(e);

            case 'rotatemove':
                var rotation = e.rotation - lastRotation;
                console.log(rotation);
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
        disable(element);
        var hammerOptions = {
            inputClass: Hammer.SUPPORT_POINTER_EVENTS ? Hammer.PointerEventInput : Hammer.TouchInput
        };

        var mc = new Hammer.Manager(element, hammerOptions);

        var panOptions = {
            pointers: 0,
            direction: Hammer.DIRECTION_ALL,
            threshold: 0
        };

        var pan = new Hammer.Pan(panOptions);
        var pinch = new Hammer.Pinch({
            threshold: 0
        });
        var rotate = new Hammer.Rotate({
            threshold: 0
        });
        var press = new Hammer.Press({
            threshold: 10
        });
        
        // we want to detect both the same time
        pinch.recognizeWith(pan);
        pinch.recognizeWith(rotate);

        // add to the Manager
        mc.add([ pan, press, rotate, pinch ]);
        mc.on('press tap doubletap panstart panmove panend pinchstart pinchmove rotatemove', onTouch);

        $(element).data('hammer', mc);
        $(element).on('touchstart touchend', onTouch);
        cornerstoneTools.preventGhostClick(element);
    }

    function disable(element) {
        $(element).off('touchstart touchend', onTouch);
        var mc = $(element).data('hammer');
        if (mc) {
            mc.off('press tap doubletap panstart panmove panend pinchmove rotatemove', onTouch);
        }
    }

    // module exports
    cornerstoneTools.touchInput = {
        enable: enable,
        disable: disable
    };

})($, cornerstone, cornerstoneMath, cornerstoneTools);
