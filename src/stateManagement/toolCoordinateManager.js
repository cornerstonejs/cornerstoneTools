(function(cornerstoneTools) {

    'use strict';

    function toolCoordinateManager(){
        var cooordsData = '';

        function setActiveToolCoords(eventData){
            cooordsData = eventData.currentPoints.canvas;
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

})(cornerstoneTools);
