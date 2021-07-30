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

  if (start.x === end.x && start.y === end.y) {
    startX = start.x;
    startY = start.y;
    endX = end.x;
    endY = end.y;
  } else {
    // Mid point of long-axis line
    const mid = {
      x: (start.x + end.x) / 2,
      y: (start.y + end.y) / 2,
    };

    // Inclination of the perpendicular line
    const vector = getLineVector(
      columnPixelSpacing,
      rowPixelSpacing,
      start,
      end
    );

    const perpendicularLineLength = vector.length / 2;
    const rowMultiplier = perpendicularLineLength / (2 * rowPixelSpacing);
    const columnMultiplier = perpendicularLineLength / (2 * columnPixelSpacing);

    startX = mid.x + columnMultiplier * vector.y;
    startY = mid.y - rowMultiplier * vector.x;
    endX = mid.x - columnMultiplier * vector.y;
    endY = mid.y + rowMultiplier * vector.x;
  }

  measurementData.handles.perpendicularStart.x = startX;
  measurementData.handles.perpendicularStart.y = startY;
  measurementData.handles.perpendicularEnd.x = endX;
  measurementData.handles.perpendicularEnd.y = endY;

  return true;
}
