import external from '../externalModules.js';

/**
 * Sets the canvas context transformation matrix so it is scaled to show text
 * more cleanly even if the image is scaled up.  See
 * https://github.com/cornerstonejs/cornerstoneTools/wiki/DrawingText
 * for more information
 * @export @public @function
 * @name setContextToDisplayFontSize
 *
 * @param {HTMLElement} enabledElement The cornerstone enabled element.
 * @param {CanvasRenderingContext2D} context The canvas context.
 * @param {number} fontSize The font size.
 * @returns {Object} {fontSize: number, lineHeight: number, fontScale: number}
 */
export default function(enabledElement, context, fontSize) {
  const fontScale = 0.1;

  external.cornerstone.setToPixelCoordinateSystem(
    enabledElement,
    context,
    fontScale
  );
  // Return the font size to use
  const scaledFontSize = fontSize / enabledElement.viewport.scale / fontScale;
  // TODO: actually calculate this?
  const lineHeight = fontSize / enabledElement.viewport.scale / fontScale;

  return {
    fontSize: scaledFontSize,
    lineHeight,
    fontScale,
  };
}
