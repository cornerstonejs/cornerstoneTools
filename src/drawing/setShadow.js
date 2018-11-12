/**
 * Set the {@link https://www.w3.org/TR/2dcontext/#shadows|shadow} properties of the context.
 * Each property is set on the context object if defined, otherwise a default value is set.
 * @public
 * @method setShadow
 * @memberof CornerstoneTools.Drawing
 *
 * @param {CanvasRenderingContext2D} context
 * @param {Object} options
 * @param {Boolean} options.shadow - Whether to set any shadow options
 * @param {String} options.shadowColor - Default value: #000000
 * @param {Number} options.shadowOffsetX - Default value: 1
 * @param {Number} options.shadowOffsetY - Default value: 1
 * @returns {undefined}
 */
export default function (context, options) {
  if (options.shadow) {
    context.shadowColor = options.shadowColor || '#000000';
    context.shadowOffsetX = options.shadowOffsetX || 1;
    context.shadowOffsetY = options.shadowOffsetY || 1;
  }
}
