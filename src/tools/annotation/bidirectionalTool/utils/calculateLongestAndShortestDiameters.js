/**
 * Calculates longest and shortest diameters using measurement handles and pixelSpacing
 * @param  {Object} measurementData
 * @param {Object} pixelSpacing pixelSpacing
 *
 *@returns {Object} longestDiameter and shortestDiameter
 */
export default function calculateLongestAndShortestDiameters(
  measurementData,
  pixelSpacing
) {
  const { rowPixelSpacing, colPixelSpacing } = pixelSpacing;
  const {
    start,
    end,
    perpendicularStart,
    perpendicularEnd,
  } = measurementData.handles;

  // Calculate the long axis length
  const dx = (start.x - end.x) * (colPixelSpacing || 1);
  const dy = (start.y - end.y) * (rowPixelSpacing || 1);
  let length = Math.sqrt(dx * dx + dy * dy);

  // Calculate the short axis length
  const wx =
    (perpendicularStart.x - perpendicularEnd.x) * (colPixelSpacing || 1);
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

  return {
    longestDiameter: length.toFixed(1),
    shortestDiameter: width.toFixed(1),
  };
}
