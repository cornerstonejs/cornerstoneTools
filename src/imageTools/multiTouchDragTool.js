(function($, cornerstone, cornerstoneTools) {

    'use strict';

    function multiTouchDragTool(touchDragCallback) {
        var configuration = {};
        var events = 'CornerstoneToolsMultiTouchDrag';
        
        var toolInterface = {
            activate: function(element) {
                $(element).off(events, touchDragCallback);
                $(element).on(events, touchDragCallback);
            },
            disable: function(element) {
                $(element).off(events, touchDragCallback);
            },
            enable: function(element) {
                $(element).off(events, touchDragCallback);
            },
            deactivate: function(element) {
                $(element).off(events, touchDragCallback);
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
