var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function rectToLineSegments(rect)
    {
        var top = {
            start : {
                x :rect.left,
                y :rect.top
            },
            end : {
                x :rect.left + rect.width,
                y :rect.top

            }
        };
        var right = {
            start : {
                x :rect.left + rect.width,
                y :rect.top
            },
            end : {
                x :rect.left + rect.width,
                y :rect.top + rect.height

            }
        };
        var bottom = {
            start : {
                x :rect.left + rect.width,
                y :rect.top + rect.height
            },
            end : {
                x :rect.left,
                y :rect.top + rect.height

            }
        };
        var left = {
            start : {
                x :rect.left,
                y :rect.top + rect.height
            },
            end : {
                x :rect.left,
                y :rect.top

            }
        };
        var lineSegments = [top, right, bottom, left];
        return lineSegments;
    }

    function pointNearLineSegment(point, lineSegment, maxDistance)
    {
        if(maxDistance === undefined) {
            maxDistance = 5;
        }
        var distance = cornerstoneTools.lineSegment.distanceToPoint(lineSegment, point);

        return (distance < maxDistance);
    }
    function distanceToPoint(rect, point)
    {
        var minDistance = 655535;
        var lineSegments = rectToLineSegments(rect);
        lineSegments.forEach(function(lineSegment) {
            var distance = cornerstoneTools.lineSegment.distanceToPoint(lineSegment, point);
            if(distance < minDistance) {
                minDistance = distance;
            }
        });
        return minDistance;
    }

    // module exports
    cornerstoneTools.rect =
    {
        distanceToPoint : distanceToPoint
    };


    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));