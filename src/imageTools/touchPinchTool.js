(function($, cornerstone, cornerstoneTools) {

    'use strict';

    /*jshint newcap: false */

    function touchPinchTool(touchPinchCallback) {
        var toolInterface = {
            activate: function(element) {
                $(element).off('CornerstoneToolsTouchPinch', touchPinchCallback);
                var eventData = {
                };
                $(element).on('CornerstoneToolsTouchPinch', eventData, touchPinchCallback);
            },
            disable: function(element) {$(element).off('CornerstoneToolsTouchPinch', touchPinchCallback);},
            enable: function(element) {$(element).off('CornerstoneToolsTouchPinch', touchPinchCallback);},
            deactivate: function(element) {$(element).off('CornerstoneToolsTouchPinch', touchPinchCallback);}
        };
        return toolInterface;
    }

    // module exports
    cornerstoneTools.touchPinchTool = touchPinchTool;

})($, cornerstone, cornerstoneTools);
