import * as cornerstone from 'cornerstone-core';

 /**
 * Sets the canvas context transformation matrix so it is scaled to show text
 * more cleanly even if the image is scaled up.  See
 * https://github.com/chafey/cornerstoneTools/wiki/DrawingText
 * for more information
 *
 * @param enabledElement
 * @param context
 * @param fontSize
 * @returns {{fontSize: number, lineHeight: number, fontScale: number}}
 */
export default function (enabledElement, context, fontSize) {
  const fontScale = 0.1;

  cornerstone.setToPixelCoordinateSystem(enabledElement, context, fontScale);
    // Return the font size to use
  const scaledFontSize = fontSize / enabledElement.viewport.scale / fontScale;
    // TODO: actually calculate this?
  const lineHeight = fontSize / enabledElement.viewport.scale / fontScale;


  return {
    fontSize: scaledFontSize,
    lineHeight,
    fontScale
  };
}
