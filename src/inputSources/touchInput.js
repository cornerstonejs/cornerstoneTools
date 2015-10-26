(function($, cornerstone, cornerstoneMath, cornerstoneTools) {

    'use strict';

    /*jshint newcap: false */

    var initScale = 1.0,
        lastRotation = 0.0,
        startPoints,
        currentPoints,
        lastPoints,
        deltaPoints,
        eventData,
        touchStartDelay,
        pressDelay = 500,
        pressTimeout,
        isPress = false,
        pressMaxDistance = 10;
    
    function onTouch(e) {
        //console.log(e.type);
        var element = e.target.parentNode,
            event,
            eventType;

        // Prevent mouse events from occurring alongside touch events
        e.preventDefault();

        switch (e.type) {
            case 'tap':
                isPress = false;
                clearTimeout(pressTimeout);

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
                isPress = false;
                clearTimeout(pressTimeout);

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

            case 'pinchstart':
                isPress = false;
                clearTimeout(pressTimeout);

                var viewport = cornerstone.getViewport(element);
                initScale = viewport.scale || 1;
                break;

            case 'pinchmove':
                isPress = false;
                clearTimeout(pressTimeout);

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
                clearTimeout(touchStartDelay);
                touchStartDelay = setTimeout(function() {
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
                    if (e.originalEvent.touches.length > 1) {
                        eventType = 'CornerstoneToolsMultiTouchStart';
                    }

                    eventData = {
                        event: e,
                        viewport: cornerstone.getViewport(element),
                        image: cornerstone.getEnabledElement(element).image,
                        element: element,
                        startPoints: startPoints,
                        currentPoints: startPoints,
                        type: eventType,
                        isTouchEvent: true
                    };

                    event = $.Event(eventType, eventData);
                    $(element).trigger(event, eventData);

                    if (event.isImmediatePropagationStopped() === false) {
                        //isPress = false;
                        //clearTimeout(pressTimeout);

                        // No current tools responded to the drag action.
                        // Create new tool measurement
                        eventType = 'CornerstoneToolsTouchStartActive';
                        if (e.originalEvent.touches.length > 1) {
                            eventType = 'CornerstoneToolsMultiTouchStartActive';
                        }

                        eventData.type = eventType;
                        $(element).trigger(eventType, eventData);
                    }

                    // console.log(eventType);
                    lastPoints = cornerstoneTools.copyPoints(startPoints);
                }, 20);

                isPress = true;
                clearTimeout(pressTimeout);
                pressTimeout = setTimeout(function() {
                    if (!isPress) {
                        return;
                    }

                    currentPoints = {
                        page: cornerstoneMath.point.pageToPoint(e.originalEvent.touches[0]),
                        image: cornerstone.pageToPixel(element, e.originalEvent.touches[0].pageX, e.originalEvent.touches[0].pageY),
                        client: {
                            x: e.originalEvent.touches[0].clientX,
                            y: e.originalEvent.touches[0].clientY
                        }
                    };
                    currentPoints.canvas = cornerstone.pixelToCanvas(element, startPoints.image);

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

                    //console.log(eventType);
                }, pressDelay);
                break;

            case 'touchend':
                isPress = false;
                clearTimeout(pressTimeout);

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
                    event: e,
                    viewport: cornerstone.getViewport(element),
                    image: cornerstone.getEnabledElement(element).image,
                    element: element,
                    startPoints: startPoints,
                    currentPoints: startPoints,
                    type: eventType,
                    isTouchEvent: true
                };

                event = $.Event(eventType, eventData);
                $(element).trigger(event, eventData);
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

                var pageDistanceMoved = Math.sqrt(deltaPoints.page.x * deltaPoints.page.x + deltaPoints.page.y * deltaPoints.page.y);
                //console.log("pageDistanceMoved: " + pageDistanceMoved);
                if (pageDistanceMoved > pressMaxDistance) {
                    //console.log('Press event aborted due to movement');
                    isPress = false;
                    clearTimeout(pressTimeout);
                }
              
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
                isPress = false;
                clearTimeout(pressTimeout);

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

        //console.log(eventType);
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
        
        // we want to detect both the same time
        pinch.recognizeWith(pan);
        pinch.recognizeWith(rotate);

        // add to the Manager
        mc.add([ pan, rotate, pinch ]);
        mc.on('tap doubletap panstart panmove panend pinchstart pinchmove rotatemove', onTouch);

        $(element).data('hammer', mc);
        $(element).on('touchstart touchend', onTouch);
        cornerstoneTools.preventGhostClick(element);
    }

    function disable(element) {
        $(element).off('touchstart touchend', onTouch);
        var mc = $(element).data('hammer');
        if (mc) {
            mc.off('tap doubletap panstart panmove panend pinchmove rotatemove', onTouch);
        }
    }

    // module exports
    cornerstoneTools.touchInput = {
        enable: enable,
        disable: disable
    };

})($, cornerstone, cornerstoneMath, cornerstoneTools);
