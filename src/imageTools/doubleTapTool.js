(function($, cornerstone, cornerstoneTools) {

    'use strict';

    function doubleTapTool(doubleTapCallback) {
        var toolInterface = {
            activate: function(element) {
                $(element).off('CornerstoneToolsDoubleTap', doubleTapCallback);
                var eventData = {};
                $(element).on('CornerstoneToolsDoubleTap', eventData, doubleTapCallback);
            },
            disable: function(element) {$(element).off('CornerstoneToolsDoubleTap', doubleTapCallback);},
            enable: function(element) {$(element).off('CornerstoneToolsDoubleTap', doubleTapCallback);},
            deactivate: function(element) {$(element).off('CornerstoneToolsDoubleTap', doubleTapCallback);}
        };
        return toolInterface;
    }

    // module exports
    cornerstoneTools.doubleTapTool = doubleTapTool;

})($, cornerstone, cornerstoneTools);
