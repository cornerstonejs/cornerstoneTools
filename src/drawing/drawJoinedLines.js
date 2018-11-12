/**
 * Draw a series of joined lines, starting at `start` and then going to each point in `points`.
 * @public
 * @method drawJoinedLines
 * @memberof CornerstoneTools.Drawing
 *
 * @param {CanvasRenderingContext2D} context
 * @param {HTMLElement} element - The DOM Element to draw on
 * @param {Object} start - `{ x, y }` in either pixel or canvas coordinates.
 * @param {Object[]} points - `[{ x, y }]` An array of points in either pixel or canvas coordinates.
 * @param {Object} options - See {@link path}
 * @param {String} [coordSystem='pixel'] - Can be "pixel" (default) or "canvas". The coordinate
 *     system of the points passed in to the function. If "pixel" then cornerstone.pixelToCanvas
 *     is used to transform the points from pixel to canvas coordinates.
 * @returns {undefined}
 */
export default function (
  context,
  element,
  start,
  points,
  options,
  coordSystem = 'pixel'
) {
  path(context, options, (context) => {
    if (coordSystem === 'pixel') {
      const cornerstone = external.cornerstone;

      start = cornerstone.pixelToCanvas(element, start);
      points = points.map((p) => cornerstone.pixelToCanvas(element, p));
    }
    context.moveTo(start.x, start.y);
    points.forEach(({ x, y }) => {
      context.lineTo(x, y);
    });
  });
}
