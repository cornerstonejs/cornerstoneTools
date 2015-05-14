var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function toolColorManager(){
        var defaultColor = "white",
            activeColor = "greenyellow";

        function setToolColor(color){
            defaultColor = color;
        }
        function getToolColor(){
            return defaultColor;
        }
        function setActiveToolColor(color){
            activeColor = color;
        }
        function getActiveToolColor(){
            return activeColor;
        }
      
        var toolColors = {
            setToolColor: setToolColor,
            getToolColor: getToolColor,
            setActiveColor: setActiveToolColor,
            getActiveColor: getActiveToolColor
        };

        return toolColors;
    }

    // module/private exports
    cornerstoneTools.toolColors = toolColorManager();

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));
