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

    function mouseButtonTool(mouseDownCallback)
    {
        var toolInterface = {
            activate: function(element, mouseButtonMask) {
                $(element).off('CornerstoneToolsMouseDown', mouseDownCallback);
                var eventData = {
                    mouseButtonMask: mouseButtonMask
                };
                $(element).on("CornerstoneToolsMouseDown", eventData, mouseDownCallback);
            },
            disable : function(element) {$(element).off('CornerstoneToolsMouseDown', mouseDownCallback);},
            enable : function(element) {$(element).off('CornerstoneToolsMouseDown', mouseDownCallback);},
            deactivate : function(element) {$(element).off('CornerstoneToolsMouseDown', mouseDownCallback);},
        };
        return toolInterface;
    }

    // module exports
    cornerstoneTools.mouseButtonTool = mouseButtonTool;
    cornerstoneTools.isMouseButtonEnabled = isMouseButtonEnabled;
    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));