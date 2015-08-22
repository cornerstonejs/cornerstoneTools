(function(cornerstoneTools) {

    'use strict';

    // calculates a reference line between two planes by projecting the top left hand corner and bottom right hand corner
    // of the reference image onto the target image.  Ideally we would calculate the intersection between the planes but
    // that requires a bit more math and this works fine for most cases
    function calculateReferenceLine(targetImagePlane, referenceImagePlane) {
        var points = cornerstoneTools.planePlaneIntersection(targetImagePlane, referenceImagePlane);
        if (!points) {
            return;
        }

        return {
            start: cornerstoneTools.projectPatientPointToImagePlane(points.start, targetImagePlane),
            end: cornerstoneTools.projectPatientPointToImagePlane(points.end, targetImagePlane)
        };
    }

    // module/private exports
    cornerstoneTools.referenceLines.calculateReferenceLine = calculateReferenceLine;

})(cornerstoneTools);
