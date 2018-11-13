import external from './../externalModules.js';
import path from './path.js';

/**
 * Fill the region outside a rectangle defined by `corner1` and `corner2`.
 * @public
 * @method fillOutsideRect
 * @memberof Drawing
 *
 * @param {CanvasRenderingContext2D} context - Target context
 * @param {HTMLElement} element - The DOM Element to draw on
 * @param {Object} corner1 - `{ x, y }` in either pixel or canvas coordinates.
 * @param {Object} corner2 - `{ x, y }` in either pixel or canvas coordinates.
 * @param {Object} options - See {@link path}
 * @param {String} [coordSystem='pixel'] - Can be "pixel" (default) or "canvas". The coordinate
 *     system of the points passed in to the function. If "pixel" then cornerstone.pixelToCanvas
 *     is used to transform the points from pixel to canvas coordinates.
 * @returns {undefined}
 */
export default function(
  context,
  element,
  corner1,
  corner2,
  options,
  coordSystem = 'pixel'
) {
  if (coordSystem === 'pixel') {
    const cornerstone = external.cornerstone;

    corner1 = cornerstone.pixelToCanvas(element, corner1);
    corner2 = cornerstone.pixelToCanvas(element, corner2);
  }

  const left = Math.min(corner1.x, corner2.x);
  const top = Math.min(corner1.y, corner2.y);
  const width = Math.abs(corner1.x - corner2.x);
  const height = Math.abs(corner1.y - corner2.y);

  path(context, options, context => {
    context.rect(0, 0, context.canvas.clientWidth, context.canvas.clientHeight);
    context.rect(left + width, top, -width, height);
  });
}
