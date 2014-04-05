var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function isMouseButtonEnabled(which, mouseButtonMask)
    {
        /*jshint bitwise: false*/
        var mouseButton = (1 << (which - 1));
        return ((mouseButtonMask & mouseButton) !== 0);
    }

    function onMouseWheel(e, mouseWheelCallback) {

        var element = e.currentTarget;

        var startingCoords = cornerstone.pageToImage(element, e.pageX, e.pageY);

        e = window.event || e; // old IE support
        var wheelDelta = e.wheelDelta || -e.detail || -e.originalEvent.detail;
        var direction = Math.max(-1, Math.min(1, (wheelDelta)));

        var mouseWheelData = {
            direction : direction,
            pageX : e.pageX,
            pageY: e.pageY,
            imageX : startingCoords.x,
            imageY : startingCoords.y,
            viewport: cornerstone.getViewport(element),
            image: cornerstone.getEnabledElement(element).image
        };

        mouseWheelCallback(element, mouseWheelData);
    }

    function unbind(element)
    {
        $(element).unbind('mousedown', onMouseWheel);
    }

    function mouseWheelTool(onMouseWheel)
    {
        var toolInterface = {
            activate: function(element) {
                $(element).unbind('mousewheel DOMMouseScroll', onMouseWheel);
                $(element).on('mousewheel DOMMouseScroll', onMouseWheel);
            },
            disable : unbind,
            enable: unbind,
            deactivate: unbind
        };
        return toolInterface;
    }

    // module exports
    cornerstoneTools.mouseWheelTool = mouseWheelTool;
    cornerstoneTools.onMouseWheel = onMouseWheel;

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));