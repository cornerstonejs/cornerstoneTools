(function($, cornerstone, cornerstoneTools) {

    'use strict';

    function touchDragTool(touchDragCallback, options) {
        var events = 'CornerstoneToolsTouchDrag';
        if (options && options.fireOnTouchStart === true) {
            events += ' CornerstoneToolsTouchStart';
        }

        var toolInterface = {
            activate: function(element) {
                $(element).off(events, touchDragCallback);

                if (options && options.eventData) {
                    $(element).on(events, options.eventData, touchDragCallback);
                } else {
                    $(element).on(events, touchDragCallback);
                }

                if (options && options.activateCallback) {
                    options.activateCallback(element);
                }
            }, disable: function(element) {
                $(element).off(events, touchDragCallback);
                if (options && options.disableCallback) {
                    options.disableCallback(element);
                }
            }, enable: function(element) {
                $(element).off(events, touchDragCallback);
                if (options && options.enableCallback) {
                    options.enableCallback(element);
                }
            }, deactivate: function(element) {
                $(element).off(events, touchDragCallback);
                if (options && options.deactivateCallback) {
                    options.deactivateCallback(element);
                }
            }
        };
        return toolInterface;
    }

    // module exports
    cornerstoneTools.touchDragTool = touchDragTool;

})($, cornerstone, cornerstoneTools);
