(function($, cornerstone, cornerstoneTools) {

    'use strict';

    function multiTouchDragTool(touchDragCallback, options) {
        var configuration = {};
        var events = 'CornerstoneToolsMultiTouchDrag';
        if (options && options.fireOnTouchStart === true) {
            events += ' CornerstoneToolsMultiTouchStart';
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
            },
            disable: function(element) {
                $(element).off(events, touchDragCallback);
                if (options && options.disableCallback) {
                    options.disableCallback(element);
                }
            },
            enable: function(element) {
                $(element).off(events, touchDragCallback);
                if (options && options.enableCallback) {
                    options.enableCallback(element);
                }
            },
            deactivate: function(element) {
                $(element).off(events, touchDragCallback);
                if (options && options.deactivateCallback) {
                    options.deactivateCallback(element);
                }
            },
            getConfiguration: function() {
                return configuration;
            },
            setConfiguration: function(config) {
                configuration = config;
            }
        };
        return toolInterface;
    }

    // module exports
    cornerstoneTools.multiTouchDragTool = multiTouchDragTool;

})($, cornerstone, cornerstoneTools);
