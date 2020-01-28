/**
 * AddLine - Adds a line to a specifc index of a freehand tool points array.
 *
 * @param  {Object[]} points      The array of points.
 * @param  {Number} insertIndex The index to insert the line.
 * @returns {Null}             description
 */
export default function(points, insertIndex) {
  // Add the line from the inserted handle to the handle after
  if (insertIndex === points.length - 1) {
    points[insertIndex].lines.push(points[0]);
  } else {
    points[insertIndex].lines.push(points[insertIndex + 1]);
  }
}
