import external from './../externalModules.js';
import path from './path.js';

/**
 * Draw multiple lines.
 * @public
 * @method drawJoinedLines
 * @memberof Drawing
 *
 * @param {CanvasRenderingContext2D} context - Target context
 * @param {HTMLElement} element - The DOM Element to draw on
 * @param {Object[]} lines - `[{ start: {x, y}, end: { x, y }]` An array of `start`, `end` pairs.
 *     Each point is `{ x, y }` in either pixel or canvas coordinates.
 * @param {Object} options - See {@link path}
 * @param {String} [coordSystem='pixel'] - Can be "pixel" (default) or "canvas". The coordinate
 *     system of the points passed in to the function. If "pixel" then cornerstone.pixelToCanvas
 *     is used to transform the points from pixel to canvas coordinates.
 * @returns {undefined}
 */
export default function(
  context,
  element,
  lines,
  options,
  coordSystem = 'pixel'
) {
  path(context, options, context => {
    lines.forEach(line => {
      let start = line.start;
      let end = line.end;

      if (coordSystem === 'pixel') {
        const cornerstone = external.cornerstone;

        start = cornerstone.pixelToCanvas(element, start);
        end = cornerstone.pixelToCanvas(element, end);
      }

      context.moveTo(start.x, start.y);
      context.lineTo(end.x, end.y);
    });
  });
}
