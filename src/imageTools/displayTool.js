(function($, cornerstone, cornerstoneTools) {

    'use strict';

    function displayTool(onImageRendered) {
        var configuration = {};

        var toolInterface = {
            disable: function(element) {$(element).off('CornerstoneImageRendered', onImageRendered);},
            enable: function(element) {
                $(element).off('CornerstoneImageRendered', onImageRendered);
                $(element).on('CornerstoneImageRendered', onImageRendered);
                cornerstone.updateImage(element);
            },
            getConfiguration: function() { return configuration; },
            setConfiguration: function(config) {configuration = config;}
        };

        return toolInterface;
    }

    // module exports
    cornerstoneTools.displayTool = displayTool;

})($, cornerstone, cornerstoneTools);
