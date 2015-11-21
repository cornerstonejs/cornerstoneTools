(function($, cornerstone, cornerstoneMath, cornerstoneTools) {

    'use strict';

    function getHandleNearImagePoint(element, handles, coords, distanceThreshold) {
        var nearbyHandle;
        
        if (!handles) {
            return;
        }

        Object.keys(handles).forEach(function(name) {
            var handle = handles[name];
            if (handle.hasOwnProperty('pointNearHandle')) {
                if (handle.pointNearHandle(element, handle, coords)) {
                    nearbyHandle = handle;
                    return;
                }
            } else {
                var handleCanvas = cornerstone.pixelToCanvas(element, handle);
                var distance = cornerstoneMath.point.distance(handleCanvas, coords);
                if (distance <= distanceThreshold) {
                    nearbyHandle = handle;
                    return;
                }
            }
        });
        
        return nearbyHandle;
    }

    // module exports
    cornerstoneTools.getHandleNearImagePoint = getHandleNearImagePoint;

})($, cornerstone, cornerstoneMath, cornerstoneTools);
