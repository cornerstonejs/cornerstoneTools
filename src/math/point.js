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

    function distance(from, to)
    {
        return Math.sqrt(distanceSquared(from, to));
    }

    function distanceSquared(from, to)
    {
        var delta = subtract(from, to);
        return delta.x * delta.x + delta.y * delta.y;
    }

    // module exports
    cornerstoneTools.point =
    {
        subtract : subtract,
        copy: copy,
        pageToPoint: pageToPoint,
        distance: distance,
        distanceSquared: distanceSquared
    };


    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));