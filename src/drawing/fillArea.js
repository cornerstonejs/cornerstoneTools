/**
 * Draw a filled rectangle defined by `boundingBox` using the style defined by `fillStyle`.
 * @public
 * @method fillArea
 * @memberof Drawing
 *
 * @param {CanvasRenderingContext2D} context - Target context
 * @param {Object} boundingBox - `{ left, top, width, height }` in canvas coordinates.
 * @param {FillStyle} fillStyle - The fillStyle to apply to the region.
 * @returns {undefined}
 */
export default function(context, fillStyle) {
  context.fillStyle = fillStyle;
  context.fill();
}
