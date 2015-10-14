(function(cornerstoneTools) {

    'use strict';

    function touchSettingsManager() {
        var defaultDistanceFromTouch = {
            x: 0,
            y: -55
        };

        function setToolDistanceFromTouch(distance){
            defaultDistanceFromTouch = distance;
        }

        function getToolDistanceFromTouch(){
            return defaultDistanceFromTouch;
        }

        var touchSettings = {
            setToolDistanceFromTouch: setToolDistanceFromTouch,
            getToolDistanceFromTouch: getToolDistanceFromTouch,
        };

        return touchSettings;
    }

    // module/private exports
    cornerstoneTools.touchSettings = touchSettingsManager();

})(cornerstoneTools);
