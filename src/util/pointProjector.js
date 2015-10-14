(function($, cornerstone, cornerstoneTools) {

    'use strict';

    // projects a patient point to an image point
    function projectPatientPointToImagePlane(patientPoint, imagePlane) {
        var point = patientPoint.clone().sub(imagePlane.imagePositionPatient);
        var x = imagePlane.rowCosines.dot(point) / imagePlane.columnPixelSpacing;
        var y = imagePlane.columnCosines.dot(point) / imagePlane.rowPixelSpacing;
        return {
            x: x,
            y: y
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
            x: 0,
            y: 0
        }, imagePlane);
        var topRight = imagePointToPatientPoint({
            x: imagePlane.columns,
            y: 0
        }, imagePlane);
        var bottomLeft = imagePointToPatientPoint({
            x: 0,
            y: imagePlane.rows
        }, imagePlane);
        var bottomRight = imagePointToPatientPoint({
            x: imagePlane.columns,
            y: imagePlane.rows
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

    function lineRectangleIntersection(line, rect) {
        var intersections = [];
        Object.keys(rect).forEach(function(side) {
            var segment = rect[side];
            var intersection = line.intersectLine(segment);
            if (intersection) {
                intersections.push(intersection);
            }
        });
        return intersections;
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

        // Calculate the longest possible length in the reference image plane (the length of the diagonal)
        var bottomRight = imagePointToPatientPoint({
            x: referenceImagePlane.columns,
            y: referenceImagePlane.rows
        }, referenceImagePlane);
        var distance = referenceImagePlane.imagePositionPatient.distanceTo(bottomRight);

        // Use this distance to bound the ray intersecting the two planes
        var line = new cornerstoneMath.Line3();
        line.start = origin;
        line.end = origin.clone().add(direction.multiplyScalar(distance));

        // Find the intersections between this line and the reference image plane's four sides
        var rect = getRectangleFromImagePlane(referenceImagePlane);
        var intersections = lineRectangleIntersection(line, rect);

        // Return the intersections between this line and the reference image plane's sides
        // in order to draw the reference line from the target image.
        if (intersections.length !== 2) {
            return;
        }

        var points = {
            start: intersections[0],
            end: intersections[1]
        };
        return points;

    }

    // module/private exports
    cornerstoneTools.projectPatientPointToImagePlane = projectPatientPointToImagePlane;
    cornerstoneTools.imagePointToPatientPoint = imagePointToPatientPoint;
    cornerstoneTools.planePlaneIntersection = planePlaneIntersection;

})($, cornerstone, cornerstoneTools);
