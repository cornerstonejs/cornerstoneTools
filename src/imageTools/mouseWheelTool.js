var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function onMouseWheel(e) {
        var element = e.currentTarget;
        var startingCoords = cornerstone.pageToImage(element, e.pageX, e.pageY);

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

        return mouseWheelData;
    }

    var mouseEevents = "mousewheel DOMMouseScroll";

    function mouseWheelTool(mouseWheelCallback)
    {
        var toolInterface = {
            activate: function(element) {
                $(element).off(mouseEevents, mouseWheelCallback);
                $(element).on(mouseEevents, mouseWheelCallback);
            },
            disable : function(element) {$(element).off(mouseEevents, mouseWheelCallback);},
            enable : function(element) {$(element).off(mouseEevents, mouseWheelCallback);},
            deactivate : function(element) {$(element).off(mouseEevents, mouseWheelCallback);}
        };
        return toolInterface;
    }

    // module exports
    cornerstoneTools.mouseWheelTool = mouseWheelTool;
    cornerstoneTools.onMouseWheel = onMouseWheel;

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));