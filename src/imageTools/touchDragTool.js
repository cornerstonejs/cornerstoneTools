var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    /*jshint newcap: false */

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }


    function touchDragTool(touchDragCallback)
    {
        var toolInterface = {
            activate: function(element, mouseButtonMask) {
                $(element).off('CornerstoneToolsTouchDrag', touchDragCallback);
                var eventData = {
                };
                $(element).on("CornerstoneToolsTouchDrag", eventData, touchDragCallback);
            },
            disable : function(element) {$(element).off('CornerstoneToolsTouchDrag', touchDragCallback);},
            enable : function(element) {$(element).off('CornerstoneToolsTouchDrag', touchDragCallback);},
            deactivate : function(element) {$(element).off('CornerstoneToolsTouchDrag', touchDragCallback);}
        };
        return toolInterface;
    }

    // module exports
    cornerstoneTools.touchDragTool = touchDragTool;

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));