(function($, cornerstone, cornerstoneTools) {

    'use strict';

    function touchDragTool(touchDragCallback, fireOnTouchStart) {
        var events = 'CornerstoneToolsTouchDrag';
        if (fireOnTouchStart === true) {
            events += ' CornerstoneToolsTouchStart';
        }

        var toolInterface = {
            activate: function(element) {
                $(element).off(events, touchDragCallback);
                $(element).on(events, touchDragCallback);
            }, disable: function(element) {
                $(element).off(events, touchDragCallback);
            }, enable: function(element) {
                $(element).off(events, touchDragCallback);
            }, deactivate: function(element) {
                $(element).off(events, touchDragCallback);
            }
        };
        return toolInterface;
    }

    // module exports
    cornerstoneTools.touchDragTool = touchDragTool;

})($, cornerstone, cornerstoneTools);
