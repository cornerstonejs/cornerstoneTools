/**
 * PointInImage - Checks if the point is within the image boundaries.
 * @param  {Object} pixel The pixel.
 * @param  {number} rows The number of rows.
 * @param  {number} cols The number of columns.
 */
export default function(pixel, rows, cols) {
  return pixel.x < cols && pixel.x >= 0 && pixel.y < rows && pixel.y >= 0;
}
