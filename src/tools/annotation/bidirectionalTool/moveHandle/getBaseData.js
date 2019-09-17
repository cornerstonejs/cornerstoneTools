import external from '../../../../externalModules.js';
import getDistance from '../utils/getDistanceWithPixelSpacing.js';

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

  const distanceToFixed = getDistance(
    columnPixelSpacing,
    rowPixelSpacing,
    fixedPoint,
    intersection
  );

  return {
    columnPixelSpacing,
    rowPixelSpacing,
    start,
    end,
    perpendicularStart,
    perpendicularEnd,
    longLine,
    intersection,
    distanceToFixed,
    fixedPoint,
  };
}
