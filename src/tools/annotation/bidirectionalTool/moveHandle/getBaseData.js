import external from '../../../../externalModules.js';
import getDistanceWithPixelSpacing from '../utils/getDistanceWithPixelSpacing.js';

function createLine(startPoint, endPoint) {
  return {
    start: startPoint,
    end: endPoint,
  };
}

/**
 * Extract and group the base data to be used on bidirectional tool lines
 * moving.
 *
 * @param {*} measurementData Data from current bidirectional tool measurement
 * @param {*} eventData Data object associated with the event
 * @param {*} fixedPoint Point that is not being moved in line
 *
 * @returns {*} Grouped that needed for lines moving
 */
export default function getBaseData(measurementData, eventData, fixedPoint) {
  const { lineSegment } = external.cornerstoneMath;
  const {
    start,
    end,
    perpendicularStart,
    perpendicularEnd,
  } = measurementData.handles;
  const { columnPixelSpacing = 1, rowPixelSpacing = 1 } = eventData.image;

  const longLine = createLine(start, end);
  const perpendicularLine = createLine(perpendicularStart, perpendicularEnd);
  const intersection = lineSegment.intersectLine(longLine, perpendicularLine);

  const distanceToFixed = getDistanceWithPixelSpacing(
    columnPixelSpacing,
    rowPixelSpacing,
    fixedPoint,
    intersection
  );

  return {
    columnPixelSpacing, // Width that a pixel represents in mm
    rowPixelSpacing, // Height that a pixel represents in mm
    start, // Start point of the long line
    end, // End point of the long line
    perpendicularStart, // Start point of the perpendicular line
    perpendicularEnd, // End point of the perpendicular line
    longLine, // Long line object containing the start and end points
    intersection, // Intersection point between long and perpendicular lines
    distanceToFixed, // Distance from intersection to the fixed point
    fixedPoint, // Opposite point from the handle that is being moved
  };
}
