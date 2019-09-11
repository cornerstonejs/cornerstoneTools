import getLineVector from './getLineVector';

/**
 *
 * @param {*} eventData
 * @param {*} data
 */
export default function updatePerpendicularLineHandles(eventData, data) {
  if (!data.handles.perpendicularStart.locked) {
    return;
  }

  let startX, startY, endX, endY;

  const { start, end } = data.handles;
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

  data.handles.perpendicularStart.x = startX;
  data.handles.perpendicularStart.y = startY;
  data.handles.perpendicularEnd.x = endX;
  data.handles.perpendicularEnd.y = endY;
}
