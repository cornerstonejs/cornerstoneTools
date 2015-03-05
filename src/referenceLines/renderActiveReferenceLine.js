var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }
    if(cornerstoneTools.referenceLines === undefined) {
        cornerstoneTools.referenceLines = {};
    }

    // renders the active reference line
    function renderActiveReferenceLine(context, eventData, targetElement, referenceElement)
    {
        var targetImage = cornerstone.getEnabledElement(targetElement).image;
        var referenceImage = cornerstone.getEnabledElement(referenceElement).image;

        // make sure the images are actually loaded for the target and reference
        if(targetImage === undefined || referenceImage === undefined) {
            return;
        }

        var targetImagePlane = cornerstoneTools.metaData.get('imagePlane', targetImage.imageId);
        var referenceImagePlane = cornerstoneTools.metaData.get('imagePlane', referenceImage.imageId);

        // the image planes must be in the same frame of reference
        if(targetImagePlane.frameOfReferenceUID != referenceImagePlane.frameOfReferenceUID) {
            return;
        }

        // the image plane normals must be > 30 degrees apart
        var targetNormal = targetImagePlane.rowCosines.clone().cross(targetImagePlane.columnCosines);
        var referenceNormal = referenceImagePlane.rowCosines.clone().cross(referenceImagePlane.columnCosines);
        var angleInRadians = targetNormal.angleTo(referenceNormal);
        angleInRadians = Math.abs(angleInRadians);
        if(angleInRadians < 0.5) { // 0.5 radians = ~30 degrees
            return;
        }

        var referenceLine = cornerstoneTools.referenceLines.calculateReferenceLine(targetImagePlane, referenceImagePlane);

        var color=cornerstoneTools.activeToolcoordinate.getActiveColor();

        // draw the referenceLines
        context.beginPath();
        context.strokeStyle = color;
        context.lineWidth = 1 / eventData.viewport.scale;
        context.moveTo(referenceLine.start.x, referenceLine.start.y);
        context.lineTo(referenceLine.end.x, referenceLine.end.y);
        context.stroke();
    }

    // module/private exports
    cornerstoneTools.referenceLines.renderActiveReferenceLine = renderActiveReferenceLine;

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));