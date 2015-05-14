var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function toolCoordinateManager(){
        var cooordsData = "";

        function setActiveToolCoords(eventData){
            cooordsData = eventData.currentPoints.image;
        }
        function getActiveToolCoords(){
            return cooordsData;
        }
      
        var toolCoords = {
            setCoords: setActiveToolCoords,
            getCoords: getActiveToolCoords
        };

        return toolCoords;
    }

    // module/private exports
    cornerstoneTools.toolCoordinates = toolCoordinateManager();

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));