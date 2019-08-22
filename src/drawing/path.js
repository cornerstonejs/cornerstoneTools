import toolStyle from './../stateManagement/toolStyle.js';

/**
 * This function manages the beginPath/stroke pattern for working with
 * {@link https://www.w3.org/TR/2dcontext/#drawing-paths-to-the-canvas|path objects}.
 *
 * @public
 * @function path
 * @memberof Drawing
 *
 * @param {CanvasRenderingContext2D} context - Context to add path to
 * @param {Object} [options={}] - Drawing Options
 * @param {StrokeStyle} [options.color] - The stroke style of the path.
 * @param {Number} [options.lineWidth] - The width of lines in the path. If null, no line width is set.
 *     If undefined then toolStyle.getToolWidth() is set.
 * @param {FillStyle} [options.fillStyle] - The style to fill the path with. If undefined then no filling is done.
 * @param {Number[]} [options.lineDash] - The {@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setLineDash|dash pattern}
 *     to use on the lines.
 * @param {ContextFn} fn - A drawing function to execute with the provided stroke pattern.
 * @returns {undefined}
 */
export default function(context, options = {}, fn) {
  const { color, lineWidth, fillStyle, lineDash } = options;

  context.beginPath();
  context.strokeStyle = color || context.strokeStyle;

  context.lineWidth =
    lineWidth ||
    (lineWidth === undefined && toolStyle.getToolWidth()) ||
    context.lineWidth;
  if (lineDash) {
    context.setLineDash(lineDash);
  }

  fn(context);

  if (fillStyle) {
    context.fillStyle = fillStyle;
    context.fill();
  }

  if (lineWidth !== null) {
    context.stroke();
  }

  if (lineDash) {
    context.setLineDash([]);
  }
}
