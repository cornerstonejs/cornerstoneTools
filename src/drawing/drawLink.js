import external from '../externalModules.js';
import drawLine from './drawLine.js';

/**
 * Draw a link between an annotation to a box.
 * @public
 * @method drawLink
 * @memberof Drawing
 *
 * @param  {Object[]} linkAnchorPoints An array of possible anchor points.
 * @param  {Object} refPoint         A reference point to select the anchor point.
 * @param  {Object} boundingBox    The bounding box to link.
 * @param  {Object} context          The canvas context.
 * @param  {string} color            The link color.
 * @param  {number} lineWidth        The line width of the link.
 * @returns {undefined}
 */
export default function(
  linkAnchorPoints,
  refPoint,
  boundingBox,
  context,
  color,
  lineWidth
) {
  // Draw a link from "the closest anchor point to refPoint" to "the nearest midpoint on the bounding box".

  // Find the closest anchor point to RefPoint
  const start =
    linkAnchorPoints.length > 0
      ? external.cornerstoneMath.point.findClosestPoint(
          linkAnchorPoints,
          refPoint
        )
      : refPoint;

  // Calculate the midpoints of the bounding box
  const boundingBoxPoints = [
    {
      x: boundingBox.left + boundingBox.width / 2,
      y: boundingBox.top,
    },
    {
      x: boundingBox.left,
      y: boundingBox.top + boundingBox.height / 2,
    },
    {
      x: boundingBox.left + boundingBox.width / 2,
      y: boundingBox.top + boundingBox.height,
    },
    {
      x: boundingBox.left + boundingBox.width,
      y: boundingBox.top + boundingBox.height / 2,
    },
  ];

  // Calculate the link endpoint by identifying which midpoint of the bounding box
  // Is closest to the start point.
  const end = external.cornerstoneMath.point.findClosestPoint(
    boundingBoxPoints,
    start
  );

  // Finally we draw the dashed linking line
  const options = {
    color,
    lineWidth,
    lineDash: [2, 3],
  };

  drawLine(context, undefined, start, end, options, 'canvas');
}
