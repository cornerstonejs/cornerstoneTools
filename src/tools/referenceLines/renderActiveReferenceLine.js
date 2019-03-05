import external from './../../externalModules.js';
import calculateReferenceLine from './calculateReferenceLine.js';
import toolColors from './../../stateManagement/toolColors.js';
import convertToVector3 from './../../util/convertToVector3.js';
import { draw, drawLine } from './../../drawing/index.js';

/**
 * Renders the active reference line.
 *
 * @export @public @method
 * @name renderActiveReferenceLine
 * @param  {Object} context        The canvas context.
 * @param  {Object} eventData      The data associated with the event.
 * @param  {HTMLElement} targetElement    The element on which to render the reference line.
 * @param  {HTMLElement} referenceElement The element referenced by the line.
 * @returns {void}
 */
export default function(context, eventData, targetElement, referenceElement) {
  const cornerstone = external.cornerstone;
  const targetImage = cornerstone.getEnabledElement(targetElement).image;
  const referenceImage = cornerstone.getEnabledElement(referenceElement).image;

  // Make sure the images are actually loaded for the target and reference
  if (!targetImage || !referenceImage) {
    return;
  }

  const targetImagePlane = cornerstone.metaData.get(
    'imagePlaneModule',
    targetImage.imageId
  );
  const referenceImagePlane = cornerstone.metaData.get(
    'imagePlaneModule',
    referenceImage.imageId
  );

  // Make sure the target and reference actually have image plane metadata
  if (
    !targetImagePlane ||
    !referenceImagePlane ||
    !targetImagePlane.rowCosines ||
    !targetImagePlane.columnCosines ||
    !targetImagePlane.imagePositionPatient ||
    !referenceImagePlane.rowCosines ||
    !referenceImagePlane.columnCosines ||
    !referenceImagePlane.imagePositionPatient
  ) {
    return;
  }

  // The image planes must be in the same frame of reference
  if (
    targetImagePlane.frameOfReferenceUID !==
    referenceImagePlane.frameOfReferenceUID
  ) {
    return;
  }

  targetImagePlane.rowCosines = convertToVector3(targetImagePlane.rowCosines);
  targetImagePlane.columnCosines = convertToVector3(
    targetImagePlane.columnCosines
  );
  targetImagePlane.imagePositionPatient = convertToVector3(
    targetImagePlane.imagePositionPatient
  );
  referenceImagePlane.rowCosines = convertToVector3(
    referenceImagePlane.rowCosines
  );
  referenceImagePlane.columnCosines = convertToVector3(
    referenceImagePlane.columnCosines
  );
  referenceImagePlane.imagePositionPatient = convertToVector3(
    referenceImagePlane.imagePositionPatient
  );

  // The image plane normals must be > 30 degrees apart
  const targetNormal = targetImagePlane.rowCosines
    .clone()
    .cross(targetImagePlane.columnCosines);
  const referenceNormal = referenceImagePlane.rowCosines
    .clone()
    .cross(referenceImagePlane.columnCosines);
  let angleInRadians = targetNormal.angleTo(referenceNormal);

  angleInRadians = Math.abs(angleInRadians);
  if (angleInRadians < 0.5) {
    // 0.5 radians = ~30 degrees
    return;
  }

  const referenceLine = calculateReferenceLine(
    targetImagePlane,
    referenceImagePlane
  );

  if (!referenceLine) {
    return;
  }

  const color = toolColors.getActiveColor();

  // Draw the referenceLines
  context.setTransform(1, 0, 0, 1, 0, 0);

  draw(context, context => {
    drawLine(
      context,
      eventData.element,
      referenceLine.start,
      referenceLine.end,
      { color }
    );
  });
}
