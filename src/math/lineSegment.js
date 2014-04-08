var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    // based on  http://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
    function sqr(x)
    {
        return x * x;
    }

    function dist2(v, w) {
        return sqr(v.x - w.x) + sqr(v.y - w.y);
    }

    function distanceToPointSquared(lineSegment, point)
    {
        var l2 = dist2(lineSegment.start, lineSegment.end);
        if(l2 === 0) {
            return dist2(point, lineSegment.start);
        }
        var t = ((point.x - lineSegment.start.x) * (lineSegment.end.x - lineSegment.start.x) +
                 (point.y - lineSegment.start.y) * (lineSegment.end.y - lineSegment.start.y)) / l2;
        if(t < 0) {
            return dist2(point, lineSegment.start);
        }
        if(t > 1) {
            return dist2(point, lineSegment.end);
        }

        var pt = {
            x : lineSegment.start.x + t * (lineSegment.end.x - lineSegment.start.x),
            y : lineSegment.start.y + t * (lineSegment.end.y - lineSegment.start.y)
        };
        return dist2(point, pt);
    }

    function distanceToPoint(lineSegment, point)
    {
        return Math.sqrt(distanceToPointSquared(lineSegment, point));
    }

    // module exports
    cornerstoneTools.lineSegment =
    {
        distanceToPoint : distanceToPoint
    };


    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));