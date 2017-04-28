import calculateReferenceLine from './calculateReferenceLine.js';
import toolColors from '../stateManagement/toolColors.js';
import toolStyle from '../stateManagement/toolStyle.js';

// renders the active reference line
export default function (context, eventData, targetElement, referenceElement) {
    var targetImage = cornerstone.getEnabledElement(targetElement).image;
    var referenceImage = cornerstone.getEnabledElement(referenceElement).image;

    // make sure the images are actually loaded for the target and reference
    if (!targetImage || !referenceImage) {
        return;
    }

    var targetImagePlane = cornerstone.metaData.get('imagePlane', targetImage.imageId);
    var referenceImagePlane = cornerstone.metaData.get('imagePlane', referenceImage.imageId);

    // Make sure the target and reference actually have image plane metadata
    if (!targetImagePlane ||
        !referenceImagePlane ||
        !targetImagePlane.rowCosines ||
        !targetImagePlane.columnCosines ||
        !targetImagePlane.imagePositionPatient ||
        !referenceImagePlane.rowCosines ||
        !referenceImagePlane.columnCosines ||
        !referenceImagePlane.imagePositionPatient) {
        return;
    }

    // the image planes must be in the same frame of reference
    if (targetImagePlane.frameOfReferenceUID !== referenceImagePlane.frameOfReferenceUID) {
        return;
    }

    // the image plane normals must be > 30 degrees apart
    var targetNormal = targetImagePlane.rowCosines.clone().cross(targetImagePlane.columnCosines);
    var referenceNormal = referenceImagePlane.rowCosines.clone().cross(referenceImagePlane.columnCosines);
    var angleInRadians = targetNormal.angleTo(referenceNormal);

    angleInRadians = Math.abs(angleInRadians);
    if (angleInRadians < 0.5) { // 0.5 radians = ~30 degrees
        return;
    }

    var referenceLine = calculateReferenceLine(targetImagePlane, referenceImagePlane);
    if (!referenceLine) {
        return;
    }

    var refLineStartCanvas = cornerstone.pixelToCanvas(eventData.element, referenceLine.start);
    var refLineEndCanvas = cornerstone.pixelToCanvas(eventData.element, referenceLine.end);

    var color = toolColors.getActiveColor();
    var lineWidth = toolStyle.getToolWidth();

    // draw the referenceLines
    context.setTransform(1, 0, 0, 1, 0, 0);

    context.save();
    context.beginPath();
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    context.moveTo(refLineStartCanvas.x, refLineStartCanvas.y);
    context.lineTo(refLineEndCanvas.x, refLineEndCanvas.y);
    context.stroke();
    context.restore();
}
