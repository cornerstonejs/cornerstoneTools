import getDistanceWithPixelSpacing from '../../utils/getDistanceWithPixelSpacing.js';
import getBaseData from '../getBaseData.js';
import updatePerpendicularLine from './updatePerpendicularLine.js';

/**
 *
 * @param {*} proposedPoint
 * @param {*} toolData
 * @param {*} eventData
 * @param {*} fixedPoint
 */
export default function moveLongLine(
  proposedPoint,
  toolData,
  eventData,
  fixedPoint
) {
  const baseData = getBaseData(toolData, eventData, fixedPoint);
  const { columnPixelSpacing, rowPixelSpacing, distanceToFixed } = baseData;

  // Calculate the length of the new line, considering the proposed point
  const newLineLength = getDistanceWithPixelSpacing(
    columnPixelSpacing,
    rowPixelSpacing,
    fixedPoint,
    proposedPoint
  );

  // Stop here if the handle tries to move before the intersection point
  if (newLineLength <= distanceToFixed) {
    return false;
  }

  // Calculate the new intersection point
  const k = distanceToFixed / newLineLength;
  const newIntersection = {
    x: fixedPoint.x + (proposedPoint.x - fixedPoint.x) * k,
    y: fixedPoint.y + (proposedPoint.y - fixedPoint.y) * k,
  };

  // Calculate and set the new position of the perpendicular handles
  updatePerpendicularLine(baseData, newIntersection);

  return true;
}
