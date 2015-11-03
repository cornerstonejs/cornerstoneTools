(function($, cornerstone, cornerstoneMath, cornerstoneTools) {

    'use strict';

    function copyPoints(points) {
        var page = cornerstoneMath.point.copy(points.page);
        var image = cornerstoneMath.point.copy(points.image);
        var client = cornerstoneMath.point.copy(points.client);
        var canvas = cornerstoneMath.point.copy(points.canvas);
        return {
            page: page,
            image: image,
            client: client,
            canvas: canvas
        };
    }

    // module exports
    cornerstoneTools.copyPoints = copyPoints;

})($, cornerstone, cornerstoneMath, cornerstoneTools);
