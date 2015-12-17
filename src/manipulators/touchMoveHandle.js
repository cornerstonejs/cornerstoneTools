(function($, cornerstone, cornerstoneTools) {

    'use strict';

    /*
     * define the runAnimation boolean as an object
     * so that it can be modified by reference
     */
    var runAnimation = {
        value: false
    };

    var touchEndEvents = [ 'CornerstoneToolsTouchEnd',
        'CornerstoneToolsDragEnd',
        'CornerstoneToolsTouchPinch',
        'CornerstoneToolsTouchPress',
        'CornerstoneToolsTap'
    ].join(' ');

    function animate(lastTime, handle, runAnimation, enabledElement, targetLocation) {
        // See http://www.html5canvastutorials.com/advanced/html5-canvas-start-and-stop-an-animation/
        if (!runAnimation.value) {
            return;
        }

        // update
        var time = (new Date()).getTime();
        //var timeDiff = time - lastTime;

        // pixels / second
        var distanceRemaining = Math.abs(handle.y - targetLocation.y);
        var linearDistEachFrame = distanceRemaining / 10;

        console.log('distanceRemaining: ' + distanceRemaining);
        if (distanceRemaining < 1) {
            handle.y = targetLocation.y;
            runAnimation.value = false;
            return;
        }

        if (handle.y > targetLocation.y) {
            handle.y -= linearDistEachFrame;
        } else if (handle.y < targetLocation.y) {
            handle.y += linearDistEachFrame;
        }

        // Update the image
        cornerstone.updateImage(enabledElement.element);

        // Request a new frame
        cornerstoneTools.requestAnimFrame(function() {
            animate(time, handle, runAnimation, enabledElement, targetLocation);
        });
    }

    function touchMoveHandle(touchEventData, toolType, data, handle, doneMovingCallback) {
        //console.log('touchMoveHandle');
        runAnimation.value = true;

        var element = touchEventData.element;
        var enabledElement = cornerstone.getEnabledElement(element);

        var time = (new Date()).getTime();

        // Average pixel width of index finger is 45-57 pixels
        // https://www.smashingmagazine.com/2012/02/finger-friendly-design-ideal-mobile-touchscreen-target-sizes/
        var fingerDistance = -57;

        var aboveFinger = {
            x: touchEventData.currentPoints.page.x,
            y: touchEventData.currentPoints.page.y + fingerDistance
        };

        var targetLocation = cornerstone.pageToPixel(element, aboveFinger.x, aboveFinger.y);

        function touchDragCallback(e, eventData) {
            console.log('touchMoveHandle touchDragCallback: ' + e.type);
            runAnimation.value = false;

            if (handle.hasMoved === false) {
                handle.hasMoved = true;
            }

            handle.active = true;

            var currentPoints = eventData.currentPoints;
            var aboveFinger = {
                x: currentPoints.page.x,
                y: currentPoints.page.y + fingerDistance
            };
            
            targetLocation = cornerstone.pageToPixel(element, aboveFinger.x, aboveFinger.y);
            handle.x = targetLocation.x;
            handle.y = targetLocation.y;

            cornerstone.updateImage(element);

            var eventType = 'CornerstoneToolsMeasurementModified';
            var modifiedEventData = {
                toolType: toolType,
                element: element,
                measurementData: data
            };
            $(element).trigger(eventType, modifiedEventData);
        }

        $(element).on('CornerstoneToolsTouchDrag', touchDragCallback);

        function touchEndCallback(e, eventData) {
            console.log('touchMoveHandle touchEndCallback: ' + e.type);
            runAnimation.value = false;

            handle.active = false;
            $(element).off('CornerstoneToolsTouchDrag', touchDragCallback);
            $(element).off(touchEndEvents, touchEndCallback);

            cornerstone.updateImage(element);

            if (e.type === 'CornerstoneToolsTouchPress') {
                eventData.handlePressed = data;

                handle.x = touchEventData.currentPoints.image.x;
                handle.y = touchEventData.currentPoints.image.y;
            }

            if (typeof doneMovingCallback === 'function') {
                doneMovingCallback(e, eventData);
            }
        }

        $(element).on(touchEndEvents, touchEndCallback);
    
        animate(time, handle, runAnimation, enabledElement, targetLocation);
    }

    // module/private exports
    cornerstoneTools.touchMoveHandle = touchMoveHandle;

})($, cornerstone, cornerstoneTools);
