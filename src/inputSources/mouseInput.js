var cornerstoneTools = (function ($, cornerstone, cornerstoneMath, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    // keep track of currently pressed mouse buttons
    var buttonsDown = [];

    function activateMouseDown(mouseEventDetail)
    {
        $(mouseEventDetail.element).trigger("CornerstoneToolsMouseDownActivate", mouseEventDetail);
    }


    function mouseDown(e) {

        if (buttonsDown.length > 0){
            // clear any mouse down actions ongoing at time of second button press
            $(document).trigger('mouseup');
        }

        buttonsDown.push(1 << (e.which - 1));

        var element = e.currentTarget;

        var startPoints = {
            page: cornerstoneMath.point.pageToPoint(e),
            image: cornerstone.pageToPixel(element, e.pageX, e.pageY)
        };
        var lastPoints = cornerstoneTools.copyPoints(startPoints);

        var whichMouseButton = buttonsDown.length > 1 ? buttonsDown : e.which;

        var mouseEventDetail = {
                event: e,
                which: whichMouseButton,
                viewport: cornerstone.getViewport(element),
                image: cornerstone.getEnabledElement(element).image,
                element: element,
                startPoints: startPoints,
                lastPoints: lastPoints,
                currentPoints: startPoints,
                deltaPoints: {x: 0, y:0},
                buttonsDown: buttonsDown
            };

        var event = jQuery.Event( "CornerstoneToolsMouseDown", mouseEventDetail);
        $(mouseEventDetail.element).trigger(event, mouseEventDetail);
        if(event.isImmediatePropagationStopped() === false)
        //if(element.dispatchEvent(event) === true)
        {
            // no tools responded to this event, give the active tool a chance
            if(activateMouseDown(mouseEventDetail) === true)
            {
                return cornerstoneTools.pauseEvent(e);
            }
        }

        function onMouseMove(e) {
            // calculate our current points in page and image coordinates
            var currentPoints = {
                page: cornerstoneMath.point.pageToPoint(e),
                image: cornerstone.pageToPixel(element, e.pageX, e.pageY)
            };

            // Calculate delta values in page and image coordinates
            var deltaPoints = {
                page: cornerstoneMath.point.subtract(currentPoints.page, lastPoints.page),
                image: cornerstoneMath.point.subtract(currentPoints.image, lastPoints.image)
            };

            var eventData = {
                which: whichMouseButton,
                viewport: cornerstone.getViewport(element),
                image: cornerstone.getEnabledElement(element).image,
                element: element,
                startPoints: startPoints,
                lastPoints: lastPoints,
                currentPoints: currentPoints,
                deltaPoints: deltaPoints
             };

            //element.dispatchEvent(event);

            $(mouseEventDetail.element).trigger("CornerstoneToolsMouseDrag", eventData);


            // update the last points
            lastPoints = cornerstoneTools.copyPoints(currentPoints);

            // prevent left click selection of DOM elements
            return cornerstoneTools.pauseEvent(e);
        }

        // hook mouseup so we can unbind our event listeners
        // when they stop dragging
        function onMouseUp(e) {

            // if this is a real mouseup event and not the one triggered when
            // a second button is pressed, remove from pressed button list
            if (e.which){
                var button = (1 << (e.which - 1));
                buttonsDown.splice(buttonsDown.indexOf(button),1);
            }

            // calculate our current points in page and image coordinates
            var currentPoints = {
                page: cornerstoneMath.point.pageToPoint(e),
                image: cornerstone.pageToPixel(element, e.pageX, e.pageY)
            };

            // Calculate delta values in page and image coordinates
            var deltaPoints = {
                page: cornerstoneMath.point.subtract(currentPoints.page, lastPoints.page),
                image: cornerstoneMath.point.subtract(currentPoints.image, lastPoints.image)
            };

            var eventData = {
                event: e,
                which: whichMouseButton,
                viewport: cornerstone.getViewport(element),
                image: cornerstone.getEnabledElement(element).image,
                element: element,
                startPoints: startPoints,
                lastPoints: lastPoints,
                currentPoints: currentPoints,
                deltaPoints: deltaPoints,
                buttonsDown: buttonsDown
            };

            // var event = jQuery.Event("CornerstoneToolsMouseUp", eventData);
            $(mouseEventDetail.element).trigger("CornerstoneToolsMouseUp", eventData);

            $(document).off('mousemove');
            
            if (buttonsDown.length < 1){
                $(document).off('mouseup', onMouseUp);
            }
        }

        $(document).on("mousemove", onMouseMove);
        $(document).on("mouseup", onMouseUp);


        return cornerstoneTools.pauseEvent(e);
    }

    function mouseMove(e) {
        // var eventData = e.data;
        var element = e.currentTarget;

        var startPoints = {
            page: cornerstoneMath.point.pageToPoint(e),
            image: cornerstone.pageToPixel(element, e.pageX, e.pageY)
        };
        var lastPoints = cornerstoneTools.copyPoints(startPoints);

        var whichMouseButton = e.which;


        // calculate our current points in page and image coordinates
        var currentPoints = {
            page: cornerstoneMath.point.pageToPoint(e),
            image: cornerstone.pageToPixel(element, e.pageX, e.pageY)
        };

        // Calculate delta values in page and image coordinates
        var deltaPoints = {
            page: cornerstoneMath.point.subtract(currentPoints.page, lastPoints.page),
            image: cornerstoneMath.point.subtract(currentPoints.image, lastPoints.image)
        };

        var mouseMoveEventData = {
            which: whichMouseButton,
            viewport: cornerstone.getViewport(element),
            image: cornerstone.getEnabledElement(element).image,
            element: element,
            startPoints: startPoints,
            lastPoints: lastPoints,
            currentPoints: currentPoints,
            deltaPoints: deltaPoints
        };
        //element.dispatchEvent(event);
        $(element).trigger("CornerstoneToolsMouseMove", mouseMoveEventData);

        // update the last points
        lastPoints = cornerstoneTools.copyPoints(currentPoints);

        // prevent left click selection of DOM elements
        //return cornerstoneTools.pauseEvent(e);
    }

    function enable(element)
    {
        $(element).on("mousedown", mouseDown);
        $(element).on("mousemove", mouseMove);
    }

    function disable(element) {
        $(element).off("mousedown", mouseDown);
        $(element).off("mousemove", mouseMove);
    }

    // module exports
    cornerstoneTools.mouseInput = {
        enable : enable,
        disable : disable
    };

    return cornerstoneTools;
}($, cornerstone, cornerstoneMath, cornerstoneTools));
