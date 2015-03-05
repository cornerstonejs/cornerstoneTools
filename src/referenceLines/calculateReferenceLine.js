var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }
    if(cornerstoneTools.referenceLines === undefined) {
        cornerstoneTools.referenceLines = {};
    }

    // calculates a reference line between two planes by projecting the top left hand corner and bottom right hand corner
    // of the reference image onto the target image.  Ideally we would calculate the intersection between the planes but
    // that requires a bit more math and this works fine for most cases
    function calculateReferenceLine(targetImagePlane, referenceImagePlane)
    {
        var tlhcPatient = referenceImagePlane.imagePositionPatient;
        var tlhcImage = cornerstoneTools.projectPatientPointToImagePlane(tlhcPatient, targetImagePlane);

        var brhcPatient = cornerstoneTools.imagePointToPatientPoint({x:referenceImagePlane.columns, y:referenceImagePlane.rows}, referenceImagePlane);
        var brhcImage = cornerstoneTools.projectPatientPointToImagePlane(brhcPatient, targetImagePlane);

        var referenceLineSegment = {
            start : {x :tlhcImage.x, y:tlhcImage.y},
            end : {x :brhcImage.x, y:brhcImage.y}
        };
        return referenceLineSegment;
    }

    // module/private exports
    cornerstoneTools.referenceLines.calculateReferenceLine = calculateReferenceLine;

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));