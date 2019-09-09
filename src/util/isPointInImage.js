/**
 * Checks if the point is within the image boundaries.
 * @param  {Object} pixel The pixel.
 * @param  {number} rows The number of rows.
 * @param  {number} cols The number of columns.
 * @returns {boolean}
 */
export default function isPointInImage({ x, y }, rows, cols) {
  return x < cols && x >= 0 && y < rows && y >= 0;
}
