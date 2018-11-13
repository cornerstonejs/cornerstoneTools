import external from './../externalModules.js';
import path from './path.js';

/**
 * Draw a circle with given `center` and `radius`.
 * @public
 * @method drawCircle
 * @memberof Drawing
 *
 * @param {CanvasRenderingContext2D} context - Target context
 * @param {HTMLElement} element - The DOM Element to draw on
 * @param {Object} center - `{ x, y }` in either pixel or canvas coordinates.
 * @param {number} radius - The circle's radius in canvas units.
 * @param {Object} options - See {@link path}
 * @param {String} [coordSystem='pixel'] - Can be "pixel" (default) or "canvas". The coordinate
 *     system of the points passed in to the function. If "pixel" then cornerstone.pixelToCanvas
 *     is used to transform the points from pixel to canvas coordinates.
 * @returns {undefined}
 */
export default function(
  context,
  element,
  center,
  radius,
  options,
  coordSystem = 'pixel'
) {
  if (coordSystem === 'pixel') {
    center = external.cornerstone.pixelToCanvas(element, center);
  }

  path(context, options, context => {
    context.arc(center.x, center.y, radius, 0, 2 * Math.PI);
  });
}
