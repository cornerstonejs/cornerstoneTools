var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }
    if(cornerstoneTools.referenceLines === undefined) {
        cornerstoneTools.referenceLines = {};
    }

    // projects a patient point to an image point
    function projectPatientPointToImagePlane(patientPoint, imagePlane)
    {
        var point = patientPoint.clone().sub(imagePlane.imagePositionPatient);
        var x = imagePlane.rowCosines.dot(point) / imagePlane.columnPixelSpacing;
        var y = imagePlane.columnCosines.dot(point) / imagePlane.rowPixelSpacing;
        var imagePoint = {x: x, y: y};
        return imagePoint;
    }

    // projects an image point to a patient point
    function imagePointToPatientPoint(imagePoint, imagePlane)
    {
        var x = imagePlane.rowCosines.clone().multiplyScalar(imagePoint.x);
        x.multiplyScalar(imagePlane.columnPixelSpacing);
        var y = imagePlane.columnCosines.clone().multiplyScalar(imagePoint.y);
        y.multiplyScalar(imagePlane.rowPixelSpacing);
        var patientPoint = x.add(y);
        patientPoint.add(imagePlane.imagePositionPatient);
        return patientPoint;
    }

    // module/private exports
    cornerstoneTools.projectPatientPointToImagePlane = projectPatientPointToImagePlane;
    cornerstoneTools.imagePointToPatientPoint = imagePointToPatientPoint;

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));