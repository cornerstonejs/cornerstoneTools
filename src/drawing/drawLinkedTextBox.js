import external from '../externalModules.js';
import drawTextBox from './drawTextBox.js';
import drawLink from './drawLink.js';

/**
 * Draw a link between an annotation to a textBox.
 * @export @public @method
 * @name drawLinkedTextBox
 *
 * @param {object} context      The canvas context.
 * @param {HTMLElement} element The element on which to draw the link.
 * @param {object} textBox      The textBox to link.
 * @param {object} text         The text to display in the textbox.
 * @param {object[]} handles    The handles of the annotation.
 * @param {object[]} textBoxAnchorPoints  An array of possible anchor points
 *                                        on the textBox.
 * @param {string} color         The link color.
 * @param {number} lineWidth     The line width of the link.
 * @param {number} xOffset       The x offset of the textbox.
 * @param {boolean} yCenter      Vertically centers the text if true.
 */
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
