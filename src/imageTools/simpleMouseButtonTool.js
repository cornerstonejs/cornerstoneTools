(function($, cornerstone, cornerstoneTools) {

    'use strict';

    function simpleMouseButtonTool(mouseDownCallback) {
        var configuration = {};

        var toolInterface = {
            activate: function(element, mouseButtonMask, options) {
                $(element).off('CornerstoneToolsMouseDownActivate', mouseDownCallback);
                var eventData = {
                    mouseButtonMask: mouseButtonMask,
                    options: options
                };
                $(element).on('CornerstoneToolsMouseDownActivate', eventData, mouseDownCallback);
            },
            disable: function(element) {$(element).off('CornerstoneToolsMouseDownActivate', mouseDownCallback);},
            enable: function(element) {$(element).off('CornerstoneToolsMouseDownActivate', mouseDownCallback);},
            deactivate: function(element) {$(element).off('CornerstoneToolsMouseDownActivate', mouseDownCallback);},
            getConfiguration: function() { return configuration;},
            setConfiguration: function(config) {configuration = config;}
        };
        return toolInterface;
    }

    // module exports
    cornerstoneTools.simpleMouseButtonTool = simpleMouseButtonTool;

})($, cornerstone, cornerstoneTools);
