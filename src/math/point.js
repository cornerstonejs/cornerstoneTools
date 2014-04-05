var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function pageToPoint(e)
    {
        return {
            x : e.pageX,
            y : e.pageY
        };
    }

    function subtract(lhs, rhs)
    {
        return {
            x : lhs.x - rhs.x,
            y : lhs.y - rhs.y
        };
    }

    function copy(point)
    {
        return {
            x : point.x,
            y : point.y
        };
    }


    // module exports
    cornerstoneTools.point =
    {
        subtract : subtract,
        copy: copy,
        pageToPoint: pageToPoint
    };


    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));