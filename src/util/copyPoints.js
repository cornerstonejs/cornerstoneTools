var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function copyPoints(points)
    {
        var page = cornerstoneTools.point.copy(points.page);
        var image = cornerstoneTools.point.copy(points.image);
        return {
            page : page,
            image: image
        };
    }


    // module exports
    cornerstoneTools.copyPoints = copyPoints;


    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));