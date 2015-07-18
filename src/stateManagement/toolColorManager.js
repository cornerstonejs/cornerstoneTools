(function (cornerstoneTools) {

    "use strict";

    function toolColorManager(){
        var defaultColor = "white",
            activeColor = "greenyellow",
            fillColor = "transparent";

        function setFillColor(color){
            fillColor = color;
        }
        function getFillColor(){
            return fillColor;
        }
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
            setFillColor: setFillColor,
            getFillColor: getFillColor,
            setToolColor: setToolColor,
            getToolColor: getToolColor,
            setActiveColor: setActiveToolColor,
            getActiveColor: getActiveToolColor
        };

        return toolColors;
    }

    // module/private exports
    cornerstoneTools.toolColors = toolColorManager();

})(cornerstoneTools);