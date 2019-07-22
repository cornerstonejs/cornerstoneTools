import external from './../externalModules.js';
import path from './path.js';
import { rotatePoint } from '../util/pointProjector.js';

/**
 * Draw an ellipse within the bounding box defined by `corner1` and `corner2`.
 * @public
 * @method drawEllipse
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
 * @param {Number} initialRotation - Ellipse initial rotation
 * @returns {undefined}
 */
export default function(
  context,
  element,
  corner1,
  corner2,
  options,
  coordSystem = 'pixel',
  initialRotation = 0.0
) {
  if (coordSystem === 'pixel') {
    corner1 = external.cornerstone.pixelToCanvas(element, corner1);
    corner2 = external.cornerstone.pixelToCanvas(element, corner2);
  }

  const viewport = external.cornerstone.getViewport(element);

  // Calculate the center of the image
  const { clientWidth: width, clientHeight: height } = element;
  const { scale, translation } = viewport;
  const rotation = viewport.rotation - initialRotation;

  const centerPoint = {
    x: width / 2 + translation.x * scale,
    y: height / 2 + translation.y * scale,
  };

  if (Math.abs(rotation) > 0.05) {
    corner1 = rotatePoint(corner1, centerPoint, -rotation);
    corner2 = rotatePoint(corner2, centerPoint, -rotation);
  }
  const w = Math.abs(corner1.x - corner2.x);
  const h = Math.abs(corner1.y - corner2.y);
  const xMin = Math.min(corner1.x, corner2.x);
  const yMin = Math.min(corner1.y, corner2.y);

  let center = {
    x: xMin + w / 2,
    y: yMin + h / 2,
  };

  if (Math.abs(rotation) > 0.05) {
    center = rotatePoint(center, centerPoint, rotation);
  }
  const angle = (rotation * Math.PI) / 180;

  path(context, options, context => {
    context.ellipse(center.x, center.y, w / 2, h / 2, angle, 0, 2 * Math.PI);
    context.closePath();
  });
}
