/**
 * Resets the canvas {@link CanvasRenderingContext2D|context} transform to the
 * {@link https://www.w3.org/TR/2dcontext/#transformations|identity transform}.
 *
 * @public
 * @function resetCanvasContextTransform
 * @memberof Drawing
 *
 * @param {CanvasRenderingContext2D} context - context you wish to transform
 * @returns {void}
 */
export default function(context) {
  context.setTransform(1, 0, 0, 1, 0, 0);
}
