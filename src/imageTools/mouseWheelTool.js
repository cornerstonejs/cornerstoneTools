var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function mouseWheelTool(mouseWheelCallback)
    {
        var toolInterface = {
            activate: function(element) {
                $(element).off('CornerstoneToolsMouseWheel', mouseWheelCallback);
                var eventData = {
                };
                $(element).on("CornerstoneToolsMouseWheel", eventData, mouseWheelCallback);
            },
            disable : function(element) {$(element).off('CornerstoneToolsMouseWheel', mouseWheelCallback);},
            enable : function(element) {$(element).off('CornerstoneToolsMouseWheel', mouseWheelCallback);},
            deactivate : function(element) {$(element).off('CornerstoneToolsMouseWheel', mouseWheelCallback);}
        };
        return toolInterface;
    }

    // module exports
    cornerstoneTools.mouseWheelTool = mouseWheelTool;

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));