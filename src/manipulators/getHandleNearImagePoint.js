var cornerstoneTools = (function (cornerstone, cornerstoneMath, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function getHandleNearImagePoint(element, data, coords) {
        for (var handle in data.handles) {
            var handleCanvas = cornerstone.pixelToCanvas(element, data.handles[handle]);
            var distanceSquared = cornerstoneMath.point.distanceSquared(handleCanvas, coords);
            if (distanceSquared < 25) {
                return data.handles[handle];
            }
        }
    }

    // module exports
    cornerstoneTools.getHandleNearImagePoint = getHandleNearImagePoint;

    return cornerstoneTools;
}(cornerstone, cornerstoneMath, cornerstoneTools));