import external from './../externalModules.js';
import path from './path.js';

/**
 * Draw a line between `start` and `end`.
 *
 * @public
 * @method drawLine
 * @memberof Drawing
 *
 * @param {CanvasRenderingContext2D} context
 * @param {HTMLElement} element - The DOM Element to draw on
 * @param {Object} start - `{ x, y } in either pixel or canvas coordinates.
 * @param {Object} end - `{ x, y }` in either pixel or canvas coordinates.
 * @param {Object} options - See {@link path}
 * @param {String} [coordSystem='pixel'] - Can be "pixel" (default) or "canvas". The coordinate
 *     system of the points passed in to the function. If "pixel" then cornerstone.pixelToCanvas
 *     is used to transform the points from pixel to canvas coordinates.
 * @returns {undefined}
 */
export default function drawLine(
  context,
  element,
  start,
  end,
  options,
  coordSystem = 'pixel'
) {
  path(context, options, context => {
    if (coordSystem === 'pixel') {
      start = external.cornerstone.pixelToCanvas(element, start);
      end = external.cornerstone.pixelToCanvas(element, end);
    }

    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
  });
}
