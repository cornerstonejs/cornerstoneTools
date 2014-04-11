var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function mouseWheel(e)
    {
        // !!!HACK/NOTE/WARNING!!!
        // for some reason I am getting mousewheel and DOMMouseScroll events on my
        // mac os x mavericks system when middle mouse button dragging.
        // I couldn't find any info about this so this might break other systems
        // webkit hack
        if(e.originalEvent.type === "mousewheel" && e.originalEvent.wheelDeltaY === 0) {
            return;
        }
        // firefox hack
        if(e.originalEvent.type === "DOMMouseScroll" && e.originalEvent.axis ===1) {
            return;
        }

        var element = e.currentTarget;
        var startingCoords = cornerstone.pageToPixel(element, e.pageX, e.pageY);

        e = window.event || e; // old IE support
        var wheelDelta = e.wheelDelta || -e.detail || -e.originalEvent.detail;
        var direction = Math.max(-1, Math.min(1, (wheelDelta)));

        var mouseWheelData = {
            element: element,
            viewport: cornerstone.getViewport(element),
            image: cornerstone.getEnabledElement(element).image,
            direction : direction,
            pageX : e.pageX,
            pageY: e.pageY,
            imageX : startingCoords.x,
            imageY : startingCoords.y
        };

        var event = new CustomEvent(
            "CornerstoneToolsMouseWheel",
            {
                detail: {
                    event: e,
                    direction: direction,
                    viewport: cornerstone.getViewport(element),
                    image: cornerstone.getEnabledElement(element).image,
                    element: element
                },
                bubbles: false,
                cancelable: false
            }
        );
        element.dispatchEvent(event);
    }


    var mouseWheelEvents = "mousewheel DOMMouseScroll";

    function enable(element)
    {
        $(element).on(mouseWheelEvents, mouseWheel);
    }

    function disable(element) {
        $(element).unbind(mouseWheelEvents, mouseWheel);
    }

    // module exports
    cornerstoneTools.mouseWheelInput = {
        enable : enable,
        disable : disable
    };

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));