(function($, cornerstone, cornerstoneTools) {

    'use strict';

    var scrollTimeout;
    var scrollTimeoutDelay = 1;

    function mouseWheel(e) {
        clearTimeout(scrollTimeout);

        scrollTimeout = setTimeout(function() {
            // !!!HACK/NOTE/WARNING!!!
            // for some reason I am getting mousewheel and DOMMouseScroll events on my
            // mac os x mavericks system when middle mouse button dragging.
            // I couldn't find any info about this so this might break other systems
            // webkit hack
            if (e.originalEvent.type === 'mousewheel' && e.originalEvent.wheelDeltaY === 0) {
                return;
            }
            // firefox hack
            if (e.originalEvent.type === 'DOMMouseScroll' && e.originalEvent.axis === 1) {
                return;
            }

            var element = e.currentTarget;

            var x;
            var y;

            if (e.pageX !== undefined && e.pageY !== undefined) {
                x = e.pageX;
                y = e.pageY;
            } else if (e.originalEvent &&
                       e.originalEvent.pageX !== undefined &&
                       e.originalEvent.pageY !== undefined) {
                x = e.originalEvent.pageX;
                y = e.originalEvent.pageY;
            } else {
                // IE9 & IE10
                x = e.x;
                y = e.y;
            }

            var startingCoords = cornerstone.pageToPixel(element, x, y);

            e = window.event || e; // old IE support
            var wheelDelta = e.wheelDelta || -e.detail || -e.originalEvent.detail || -e.originalEvent.deltaY;
            var direction = Math.max(-1, Math.min(1, (wheelDelta)));

            var mouseWheelData = {
                element: element,
                viewport: cornerstone.getViewport(element),
                image: cornerstone.getEnabledElement(element).image,
                direction: direction,
                pageX: x,
                pageY: y,
                imageX: startingCoords.x,
                imageY: startingCoords.y
            };

            $(element).trigger('CornerstoneToolsMouseWheel', mouseWheelData);
        }, scrollTimeoutDelay);
    }

    var mouseWheelEvents = 'mousewheel DOMMouseScroll';

    function enable(element) {
        // Prevent handlers from being attached multiple times
        disable(element);
        
        $(element).on(mouseWheelEvents, mouseWheel);
    }

    function disable(element) {
        $(element).unbind(mouseWheelEvents, mouseWheel);
    }

    // module exports
    cornerstoneTools.mouseWheelInput = {
        enable: enable,
        disable: disable
    };

})($, cornerstone, cornerstoneTools);
