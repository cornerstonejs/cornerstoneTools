import external from './../externalModules.js';
import path from './path.js';

/**
 * Draw a line between `start` and `end`.
 *
 * @public
 * @method drawHeight
 * @memberof Drawing
 *
 * @param {CanvasRenderingContext2D} context
 * @param {HTMLElement} element - The DOM Element to draw on
 * @param {Object} start - `{ x, y } in either pixel or canvas coordinates.
 * @param {Object} end - `{ x, y }` in either pixel or canvas coordinates.
 * @param {Object} options - See {@link path}
 * @param {String} [coordSystem='pixel'] - Can be "pixel" (default) or "canvas". The coordinate
 * @param {Number} initialRotation - Ellipse initial rotation
 *     system of the points passed in to the function. If "pixel" then cornerstone.pixelToCanvas
 *     is used to transform the points from pixel to canvas coordinates.
 * @returns {undefined}
 */
export default function(
  context,
  element,
  start,
  end,
  options,
  coordSystem = 'pixel'
) {
  if (coordSystem === 'pixel') {
    const cornerstone = external.cornerstone;

    start = cornerstone.pixelToCanvas(element, start);
    end = cornerstone.pixelToCanvas(element, end);
  }

  //  Calc midle in start and end:
  const midX = end.x + (start.x - end.x) / 2;
  //  Let midY = end.y + (end.y - start.y) / 2;

  //  Render:
  path(context, options, context => {
    context.moveTo(start.x, start.y);
    context.lineTo(midX, start.y);
    context.lineTo(midX, end.y);
    context.lineTo(end.x, end.y);
  });
}
