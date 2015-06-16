var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function keyboardTool(keyDownCallback)
    {
        var configuration = {};

        var toolInterface = {
            activate: function(element) {
                $(element).off('CornerstoneToolsKeyDown', keyDownCallback);
                $(element).on("CornerstoneToolsKeyDown", keyDownCallback);
            },
            disable : function(element) {$(element).off('CornerstoneToolsKeyDown', keyDownCallback);},
            enable : function(element) {$(element).off('CornerstoneToolsKeyDown', keyDownCallback);},
            deactivate : function(element) {$(element).off('CornerstoneToolsKeyDown', keyDownCallback);},
            getConfiguration : function() { return configuration; },
            setConfiguration : function(config) {configuration = config;}
        };
        return toolInterface;
    }

    // module exports
    cornerstoneTools.keyboardTool = keyboardTool;

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));