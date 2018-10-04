import external from '../externalModules.js';
import drawTextBox from './drawTextBox.js';
import drawLink from './drawLink.js';

export default function (context, element, textBox, text,
  handles, textBoxAnchorPoints, color, lineWidth, xOffset, yCenter) {
  const cornerstone = external.cornerstone;

  // Convert the textbox Image coordinates into Canvas coordinates
  const textCoords = cornerstone.pixelToCanvas(element, textBox);

  if (xOffset) {
    textCoords.x += xOffset;
  }

  const options = {
    centering: {
      x: false,
      y: yCenter
    }
  };

  // Draw the text box
  textBox.boundingBox = drawTextBox(context, text, textCoords.x, textCoords.y, color, options);
  if (textBox.hasMoved) {
    // Identify the possible anchor points for the tool -> text line
    const linkAnchorPoints = textBoxAnchorPoints(handles).map((h) => cornerstone.pixelToCanvas(element, h));

    // Draw dashed link line between tool and text
    drawLink(linkAnchorPoints, textCoords, textBox.boundingBox, context, color, lineWidth);
  }
}
