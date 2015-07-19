(function($, cornerstone, cornerstoneMath, cornerstoneTools) {

    "use strict";

    function getHandleNearImagePoint(element, data, coords) {
        Object.keys(data.handles).forEach(function(handle) {
            var handleCanvas = cornerstone.pixelToCanvas(element, data.handles[handle]);
            var distanceSquared = cornerstoneMath.point.distanceSquared(handleCanvas, coords);
            if (distanceSquared < 25) {
                return data.handles[handle];
            }
        });
    }

    // module exports
    cornerstoneTools.getHandleNearImagePoint = getHandleNearImagePoint;

})($, cornerstone, cornerstoneMath, cornerstoneTools);
