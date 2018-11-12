/**
 * This function manages the {@link https://www.w3.org/TR/2dcontext/#the-canvas-state|save/restore}
 * pattern for working in a new context state stack. The parameter `fn` is passed the `context` and can
 * execute any API calls in a clean stack.
 * @public
 * @method draw
 * @memberof CornerstoneTools.Drawing
 *
 * @param {CanvasRenderingContext2D} context
 * @param {ContextFn} fn - A function which performs drawing operations within the given context.
 * @returns {undefined}
 */
export default function (context, fn) {
  context.save();
  fn(context);
  context.restore();
}
