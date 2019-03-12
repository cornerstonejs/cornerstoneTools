/**
 * Calculates longest and shortest diameters using measurement handles and pixelSpacing
 * @param  {Object} eventData
 * @param  {Object} measurementData
 * @returns {void}
 */
export default function calculateLongestAndShortestDiameters(
  eventData,
  measurementData
) {
  const { rowPixelSpacing, columnPixelSpacing } = eventData.image;
  const {
    start,
    end,
    perpendicularStart,
    perpendicularEnd,
  } = measurementData.handles;

  // Calculate the long axis length
  const dx = (start.x - end.x) * (columnPixelSpacing || 1);
  const dy = (start.y - end.y) * (rowPixelSpacing || 1);
  let length = Math.sqrt(dx * dx + dy * dy);

  // Calculate the short axis length
  const wx =
    (perpendicularStart.x - perpendicularEnd.x) * (columnPixelSpacing || 1);
  const wy =
    (perpendicularStart.y - perpendicularEnd.y) * (rowPixelSpacing || 1);
  let width = Math.sqrt(wx * wx + wy * wy);

  if (!width) {
    width = 0;
  }

  // Length is always longer than width
  if (width > length) {
    const tempW = width;
    const tempL = length;

    length = tempW;
    width = tempL;
  }

  // Set measurement text to show lesion table
  measurementData.longestDiameter = length.toFixed(1);
  measurementData.shortestDiameter = width.toFixed(1);
}
