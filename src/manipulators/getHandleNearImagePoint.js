(function($, cornerstone, cornerstoneMath, cornerstoneTools) {

    "use strict";

    function getHandleNearImagePoint(element, data, coords) {
        var nearbyHandle;

        Object.keys(data.handles).forEach(function(name) {
            var handle = data.handles[name];
            var handleCanvas = cornerstone.pixelToCanvas(element, handle);
            var distanceSquared = cornerstoneMath.point.distanceSquared(handleCanvas, coords);
            if (distanceSquared < 25) {
                nearbyHandle = handle;
                return;
            }
        });
        
        return nearbyHandle;
    }

    // module exports
    cornerstoneTools.getHandleNearImagePoint = getHandleNearImagePoint;

})($, cornerstone, cornerstoneMath, cornerstoneTools);
