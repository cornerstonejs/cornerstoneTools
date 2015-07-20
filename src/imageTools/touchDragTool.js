(function($, cornerstone, cornerstoneTools) {

    "use strict";

    function touchDragTool(touchDragCallback) {
        var toolInterface = {
            activate: function(element) {
                $(element).off('CornerstoneToolsTouchDrag', touchDragCallback);
                $(element).on("CornerstoneToolsTouchDrag", touchDragCallback);
            }, disable: function(element) {$(element).off('CornerstoneToolsTouchDrag', touchDragCallback);}, enable: function(element) {$(element).off('CornerstoneToolsTouchDrag', touchDragCallback);}, deactivate: function(element) {$(element).off('CornerstoneToolsTouchDrag', touchDragCallback);}
        };
        return toolInterface;
    }

    // module exports
    cornerstoneTools.touchDragTool = touchDragTool;

})($, cornerstone, cornerstoneTools);
