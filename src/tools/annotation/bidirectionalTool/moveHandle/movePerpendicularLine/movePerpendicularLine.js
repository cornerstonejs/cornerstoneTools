import external from './../../../../../externalModules.js';
import getLineVector from '../../utils/getLineVector.js';
import getBaseData from '../getBaseData.js';
import lineHasLength from './lineHasLength.js';
import getHelperLine from './getHelperLine.js';
import updatePerpendicularLine from './updatePerpendicularLine.js';

/**
 * Move the perpendicular line updating the opposite handle position.
 *
 * @param {*} proposedPoint Point that was moved in bidirectional tool
 * @param {*} measurementData Data from current bidirectional tool measurement
 * @param {*} eventData Data object associated with the event
 * @param {*} fixedPoint Point that is not being moved in long line
 *
 * @returns {boolean} True if perpendicular handles were updated, false if not
 */
export default function movePerpendicularLine(
  proposedPoint,
  measurementData,
  eventData,
  fixedPoint
) {
  const { lineSegment } = external.cornerstoneMath;
  const baseData = getBaseData(measurementData, eventData, fixedPoint);
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

  // Calculate and the new position of the perpendicular handles
  const newLine = updatePerpendicularLine(
    baseData,
    newIntersection,
    helperLine,
    vector
  );

  // Change the position of the perpendicular line handles
  measurementData.handles.perpendicularStart.x = newLine.start.x;
  measurementData.handles.perpendicularStart.y = newLine.start.y;
  measurementData.handles.perpendicularEnd.x = newLine.end.x;
  measurementData.handles.perpendicularEnd.y = newLine.end.y;

  return true;
}
