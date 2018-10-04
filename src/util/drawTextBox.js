import textStyle from '../stateManagement/textStyle.js';
import { draw, fillTextLines, fillBox } from './drawing.js';

/**
 * Compute the width of the box required to display the given `text` with a given `padding`.
 *
 * @param {CanvasRenderingContext2D} context
 * @param {String} text - The text to find the width of.
 * @param {Number} padding - The padding to apply on either end of the text.
 */
export function textBoxWidth (context, text, padding) {
  const font = textStyle.getFont();
  const origFont = context.font;

  if (font && font !== origFont) {
    context.font = font;
  }
  const width = context.measureText(text).width;

  if (font && font !== origFont) {
    context.font = origFont;
  }

  return width + 2 * padding;
}

export default function (context, textLines, x, y, color, options) {
  if (Object.prototype.toString.call(textLines) !== '[object Array]') {
    textLines = [textLines];
  }

  const padding = 5;
  const fontSize = textStyle.getFontSize();
  const backgroundColor = textStyle.getBackgroundColor();

  // Find the longest text width in the array of text data
  let maxWidth = 0;

  textLines.forEach(function (text) {
    // Get the text width in the current font
    const width = textBoxWidth(context, text, padding);

    // Find the maximum with for all the text rows;
    maxWidth = Math.max(maxWidth, width);
  });

  // Calculate the bounding box for this text box
  const boundingBox = {
    width: maxWidth,
    height: padding + textLines.length * (fontSize + padding)
  };

  draw(context, (context) => {
    context.strokeStyle = color;

    // Draw the background box with padding
    if (options && options.centering && options.centering.x === true) {
      x -= boundingBox.width / 2;
    }

    if (options && options.centering && options.centering.y === true) {
      y -= boundingBox.height / 2;
    }

    boundingBox.left = x;
    boundingBox.top = y;

    const fillStyle = (options && options.debug === true) ? '#FF0000' : backgroundColor;

    fillBox(context, boundingBox, fillStyle);

    // Draw each of the text lines on top of the background box
    fillTextLines(context, boundingBox, textLines, color, padding);
  });

  // Return the bounding box so it can be used for pointNearHandle
  return boundingBox;
}
