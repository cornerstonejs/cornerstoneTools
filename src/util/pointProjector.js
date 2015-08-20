(function($, cornerstone, cornerstoneTools) {

    'use strict';

    // projects a patient point to an image point
    function projectPatientPointToImagePlane(patientPoint, imagePlane) {
        var point = patientPoint.clone().sub(imagePlane.imagePositionPatient);
        var x = imagePlane.rowCosines.dot(point) / imagePlane.columnPixelSpacing;
        var y = imagePlane.columnCosines.dot(point) / imagePlane.rowPixelSpacing;
        return {
            x: x, y: y
        };
    }

    // projects an image point to a patient point
    function imagePointToPatientPoint(imagePoint, imagePlane) {
        var x = imagePlane.rowCosines.clone().multiplyScalar(imagePoint.x);
        x.multiplyScalar(imagePlane.columnPixelSpacing);
        var y = imagePlane.columnCosines.clone().multiplyScalar(imagePoint.y);
        y.multiplyScalar(imagePlane.rowPixelSpacing);
        var patientPoint = x.add(y);
        patientPoint.add(imagePlane.imagePositionPatient);
        return patientPoint;
    }

    function getRectangleFromImagePlane(imagePlane) {
        // Get the points
        var topLeft = imagePointToPatientPoint({
            x: 0, y: 0
        }, imagePlane);
        var topRight = imagePointToPatientPoint({
            x: imagePlane.columns, y: 0
        }, imagePlane);
        var bottomLeft = imagePointToPatientPoint({
            x: 0, y: imagePlane.rows
        }, imagePlane);
        var bottomRight = imagePointToPatientPoint({
            x: imagePlane.columns, y: imagePlane.rows
        }, imagePlane);

        // Get each side as a vector
        var rect = {
            top: new cornerstoneMath.Line3(topLeft, topRight),
            left: new cornerstoneMath.Line3(topLeft, bottomLeft),
            right: new cornerstoneMath.Line3(topRight, bottomRight),
            bottom: new cornerstoneMath.Line3(bottomLeft, bottomRight),
        };
        return rect;
    }

    function rayRectangleIntersection(origin, direction, rect) {
        var coplanarThreshold = 0.7;
        var intersections = [];
        var intersection;

        Object.keys(rect).forEach(function(side) {
            // https://rootllama.wordpress.com/2014/06/20/ray-line-segment-intersection-test-in-2d/
            // https://www.codefull.org/2015/06/intersection-of-a-ray-and-a-line-segment-in-3d/
            // http://mathworld.wolfram.com/Line-LineIntersection.html
            var segment = rect[side];
            var da = direction.clone().multiplyScalar(-1000);
            var db = segment.end.clone().sub(segment.start);
            var dc = segment.start.clone().sub(origin);

            var daCrossDb = da.clone().cross(db);
            var dcCrossDb = dc.clone().cross(db);

            if (Math.abs(dc.dot(daCrossDb)) >= coplanarThreshold) {
                // Lines are not coplanar, stop here
                return;
            }

            var s = dcCrossDb.dot(daCrossDb) / daCrossDb.lengthSq();

            // Make sure we have an intersection
            if (s > 1.0 || isNaN(s)) {
                return;
            }

            intersection = origin.clone().add(da.clone().multiplyScalar(s));
            var distanceTest = intersection.clone().sub(segment.start).lengthSq() + intersection.clone().sub(segment.end).lengthSq();
            if (distanceTest <= segment.distanceSq()) {
                intersections.push(intersection);
            }
        });
        var points = {
            start: intersections[0],
            end: intersections[1]
        };
        return points;
    }

    function planePlaneIntersection(targetImagePlane, referenceImagePlane) {
        // Gets the line of intersection between two planes in patient space

        // First, get the normals of each image plane
        var targetNormal = targetImagePlane.rowCosines.clone().cross(targetImagePlane.columnCosines);
        var targetPlane = new cornerstoneMath.Plane();
        targetPlane.setFromNormalAndCoplanarPoint(targetNormal, targetImagePlane.imagePositionPatient);

        var referenceNormal = referenceImagePlane.rowCosines.clone().cross(referenceImagePlane.columnCosines);
        var referencePlane = new cornerstoneMath.Plane();
        referencePlane.setFromNormalAndCoplanarPoint(referenceNormal, referenceImagePlane.imagePositionPatient);

        var originDirection = referencePlane.clone().intersectPlane(targetPlane);
        var origin = originDirection.origin;
        var direction = originDirection.direction;

        var rect = getRectangleFromImagePlane(referenceImagePlane);
        var points = rayRectangleIntersection(origin, direction, rect);
        return points;

    }

    // module/private exports
    cornerstoneTools.projectPatientPointToImagePlane = projectPatientPointToImagePlane;
    cornerstoneTools.imagePointToPatientPoint = imagePointToPatientPoint;
    cornerstoneTools.planePlaneIntersection = planePlaneIntersection;

})($, cornerstone, cornerstoneTools);
