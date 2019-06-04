import external from './../externalModules.js';
import path from './path.js';
import { rotatePoint } from '../util/pointProjector.js';

/**
 * Draw an ellipse within the bounding box defined by `corner1` and `corner2`.
 * @public
 * @method drawRotatedEllipse
 * @memberof Drawing
 *
 * @param {CanvasRenderingContext2D} context - Target context
 * @param {HTMLElement} element - The DOM Element to draw on
 * @param {Object} corner1 - `{ x, y }` in either pixel or canvas coordinates.
 * @param {Object} corner2 - `{ x, y }` in either pixel or canvas coordinates.
 * @param {Object} corner3 - `{ x, y }` in either pixel or canvas coordinates.
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
  corner3,
  options,
  coordSystem = 'pixel',
  initialRotation = 0.0
) {
  const { isFirst } = corner3;

  if (coordSystem === 'pixel') {
    corner1 = external.cornerstone.pixelToCanvas(element, corner1);
    corner2 = external.cornerstone.pixelToCanvas(element, corner2);
    corner3 = external.cornerstone.pixelToCanvas(element, corner3);
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
    corner3 = external.cornerstone.pixelToCanvas(element, corner3);
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
  const square = x => x * x;
  const longestDistance = Math.sqrt(square(w) + square(h));
  const shortestDistance = isFirst
    ? 0
    : Math.sqrt(square(corner3.x - center.x) + square(corner3.y - center.y));

  const angle =
    (rotation * Math.PI) / 180 +
    Math.atan2(corner2.y - corner1.y, corner2.x - corner1.x);

  path(context, options, context => {
    context.ellipse(
      center.x,
      center.y,
      longestDistance / 2,
      shortestDistance,
      angle,
      0,
      Math.PI * 2
    );
  });
}
