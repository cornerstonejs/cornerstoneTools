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

    function mouseButtonTool(mouseMoveCallback)
    {
        var toolInterface = {
            activate: function(element, mouseButtonMask) {
                $(element).off('CornerstoneToolsMouseDrag', mouseMoveCallback);
                var eventData = {
                    mouseButtonMask: mouseButtonMask
                };
                $(element).on("CornerstoneToolsMouseDrag", eventData, mouseMoveCallback);
            },
            disable : function(element) {$(element).off('CornerstoneToolsMouseDrag', mouseMoveCallback);},
            enable : function(element) {$(element).off('CornerstoneToolsMouseDrag', mouseMoveCallback);},
            deactivate : function(element) {$(element).off('CornerstoneToolsMouseDrag', mouseMoveCallback);},
        };
        return toolInterface;
    }

    // module exports
    cornerstoneTools.mouseButtonTool = mouseButtonTool;
    cornerstoneTools.isMouseButtonEnabled = isMouseButtonEnabled;
    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));