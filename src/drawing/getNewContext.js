/**
 * Create a new {@link CanvasRenderingContext2D|context} object for the given {@link HTMLCanvasElement|canvas}
 * and set the transform to the {@link https://www.w3.org/TR/2dcontext/#transformations|identity transform}.
 *
 * @public
 * @function getNewContext
 * @memberof CornerstoneTools.Drawing
 *
 * @param {HTMLCanvasElement} canvas
 * @returns {CanvasRenderingContext2D} - The context of the canvas
 */
export default function (canvas) {
  const context = canvas.getContext('2d');

  context.setTransform(1, 0, 0, 1, 0, 0);

  return context;
}
