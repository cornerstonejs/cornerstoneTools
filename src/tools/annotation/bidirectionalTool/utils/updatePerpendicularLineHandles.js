import getLineVector from './getLineVector';

/**
 * Update the perpendicular line handles when the measurement is being created.
 * This method will make the perpendicular line intersect in the middle of the
 * long line and assume half the size of the long line.
 *
 * @param {*} eventData Data object associated with the event
 * @param {*} measurementData Data from current bidirectional tool measurement
 *
 * @returns {boolean} False in case the handle is not locked or true when moved
 */
export default function updatePerpendicularLineHandles(
  eventData,
  measurementData
) {
  if (!measurementData.handles.perpendicularStart.locked) {
    return false;
  }

  let startX, startY, endX, endY;

  const { start, end } = measurementData.handles;
  const { columnPixelSpacing = 1, rowPixelSpacing = 1 } = eventData.image;
  const { scaledmageFactor = 1 } = eventData.image.imageFrame;

  if (start.x === end.x && start.y === end.y) {
    startX = start.originalX;
    startY = start.originalY;
    endX = end.originalX;
    endY = end.originalY;
  } else {
    // Mid point of long-axis line
    const mid = {
      x: (start.originalX + end.originalX) / 2,
      y: (start.originalY + end.originalY) / 2,
    };

    // Inclination of the perpendicular line
    const vector = getLineVector(
      columnPixelSpacing * scaledmageFactor,
      rowPixelSpacing * scaledmageFactor,
      start,
      end
    );

    const perpendicularLineLength = vector.length / 2;
    const rowMultiplier =
      perpendicularLineLength / (2 * rowPixelSpacing * scaledmageFactor);
    const columnMultiplier =
      perpendicularLineLength / (2 * columnPixelSpacing * scaledmageFactor);

    startX = mid.x + columnMultiplier * vector.y;
    startY = mid.y - rowMultiplier * vector.x;
    endX = mid.x - columnMultiplier * vector.y;
    endY = mid.y + rowMultiplier * vector.x;
  }

  measurementData.handles.perpendicularStart.originalX = startX;
  measurementData.handles.perpendicularStart.originalY = startY;
  measurementData.handles.perpendicularEnd.originalX = endX;
  measurementData.handles.perpendicularEnd.originalY = endY;

  return true;
}
