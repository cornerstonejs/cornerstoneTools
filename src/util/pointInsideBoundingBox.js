(function(cornerstoneMath, cornerstoneTools) {
    
    'use strict';
    
    function pointInsideBoundingBox(handle, coords) {
        if (!handle.boundingBox) {
            return;
        }

        return cornerstoneMath.point.insideRect(coords, handle.boundingBox);
    }

    // module exports
    cornerstoneTools.pointInsideBoundingBox = pointInsideBoundingBox;

})(cornerstoneMath, cornerstoneTools);
