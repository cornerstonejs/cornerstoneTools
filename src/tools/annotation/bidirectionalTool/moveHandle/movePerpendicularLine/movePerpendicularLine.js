import external from './../../../../../externalModules.js';
import getLineVector from '../../utils/getLineVector.js';
import getBaseData from '../getBaseData.js';
import lineHasLength from './lineHasLength.js';
import getHelperLine from './getHelperLine.js';
import updatePerpendicularLine from './updatePerpendicularLine.js';

/**
 *
 * @param {*} proposedPoint
 * @param {*} toolData
 * @param {*} eventData
 * @param {*} fixedPoint
 */
export default function movePerpendicularLine(
  proposedPoint,
  toolData,
  eventData,
  fixedPoint
) {
  const { lineSegment } = external.cornerstoneMath;
  const baseData = getBaseData(toolData, eventData, fixedPoint);
  const {
    columnPixelSpacing,
    rowPixelSpacing,
    start,
    longLine,
    intersection,
  } = baseData;

  // Stop here if the long line has no length
  if (!lineHasLength(columnPixelSpacing, rowPixelSpacing, longLine)) {
    return false;
  }

  // Inclination of the perpendicular line
  const vector = getLineVector(
    columnPixelSpacing,
    rowPixelSpacing,
    start,
    intersection
  );

  // Get a helper line to calculate the intersection
  const helperLine = getHelperLine(baseData, proposedPoint, vector);

  // Find the new intersection in the long line
  const newIntersection = lineSegment.intersectLine(longLine, helperLine);

  // Stop the flow here if there's no intersection point between lines
  if (!newIntersection) {
    return false;
  }

  // Change the position of the perpendicular line handles
  updatePerpendicularLine(baseData, newIntersection, helperLine, vector);

  return true;
}
