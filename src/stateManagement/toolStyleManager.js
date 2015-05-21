var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function toolStyleManager(){
        var defaultWidth = 1,
            highlightWidth = 2;

        function setToolWidth(width){
            defaultWidth = width;
        }
        function getToolWidth(){
            return defaultWidth;
        }
        function setActiveToolWidth(width){
            activeWidth = width;
        }
        function getActiveToolWidth(){
            return activeWidth;
        }
      
        var toolStyle = {
            setToolWidth: setToolWidth,
            getToolWidth: getToolWidth,
            setActiveWidth: setActiveToolWidth,
            getActiveWidth: getActiveToolWidth
        };

        return toolStyle;
    }

    // module/private exports
    cornerstoneTools.toolStyle = toolStyleManager();

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));
