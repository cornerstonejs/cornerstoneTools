import textStyle from '../stateManagement/textStyle.js';
import { draw } from './drawing.js';

export default function (context, textLines, x, y, color, options) {
  if (Object.prototype.toString.call(textLines) !== '[object Array]') {
    textLines = [textLines];
  }

  const padding = 5;
  const font = textStyle.getFont();
  const fontSize = textStyle.getFontSize();
  const backgroundColor = textStyle.getBackgroundColor();

  // Find the longest text width in the array of text data
  let maxWidth = 0;

  textLines.forEach(function (text) {
    // Get the text width in the current font
    const width = context.measureText(text).width;

    // Find the maximum with for all the text rows;
    maxWidth = Math.max(maxWidth, width);
  });

  // Calculate the bounding box for this text box
  const boundingBox = {
    width: maxWidth + (padding * 2),
    height: padding + textLines.length * (fontSize + padding)
  };

  draw(context, (context) => {
    context.font = font;
    context.textBaseline = 'top';
    context.strokeStyle = color;

    // Draw the background box with padding
    context.fillStyle = backgroundColor;

    if (options && options.centering && options.centering.x === true) {
      x -= boundingBox.width / 2;
    }

    if (options && options.centering && options.centering.y === true) {
      y -= boundingBox.height / 2;
    }

    boundingBox.left = x;
    boundingBox.top = y;

    if (options && options.debug === true) {
      context.fillStyle = '#FF0000';
    }

    context.fillRect(boundingBox.left, boundingBox.top, boundingBox.width, boundingBox.height);

    // Draw each of the text lines on top of the background box
    textLines.forEach(function (text, index) {
      context.fillStyle = color;

      /* Var ypos;
          if (index === 0) {
              ypos = y + index * (fontSize + padding);
          } else {
              ypos = y + index * (fontSize + padding * 2);
          }*/

      context.fillText(text, x + padding, y + padding + index * (fontSize + padding));
    });
  });

  // Return the bounding box so it can be used for pointNearHandle
  return boundingBox;
}
