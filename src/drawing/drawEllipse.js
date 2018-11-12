import external from './../externalModules.js';
import path from './path.js';

/**
 * Draw an ellipse within the bounding box defined by `corner1` and `corner2`.
 * @public
 * @method drawEllipse
 * @memberof CornerstoneTools.Drawing
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
  // http://stackoverflow.com/questions/2172798/how-to-draw-an-oval-in-html5-canvas
  if (coordSystem === 'pixel') {
    corner1 = external.cornerstone.pixelToCanvas(element, corner1);
    corner2 = external.cornerstone.pixelToCanvas(element, corner2);
  }
  const x = Math.min(corner1.x, corner2.x);
  const y = Math.min(corner1.y, corner2.y);
  const w = Math.abs(corner1.x - corner2.x);
  const h = Math.abs(corner1.y - corner2.y);

  const kappa = 0.5522848,
    ox = (w / 2) * kappa, // Control point offset horizontal
    oy = (h / 2) * kappa, // Control point offset vertical
    xe = x + w, // X-end
    ye = y + h, // Y-end
    xm = x + w / 2, // X-middle
    ym = y + h / 2; // Y-middle

  path(context, options, context => {
    context.moveTo(x, ym);
    context.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
    context.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
    context.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
    context.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
    context.closePath();
  });
}
