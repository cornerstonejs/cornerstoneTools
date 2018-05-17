import external from '../externalModules.js';
import textStyle from '../stateManagement/textStyle.js';
import { draw, fillBox, fillTextLines } from '../util/drawing.js';

const DEFAULT_PADDING = 5;

export function textBoxWidth (context, textLines, padding = DEFAULT_PADDING) {
  // Find the longest text width in the array of text data
  if (!Array.isArray(textLines)) {
    textLines = [textLines];
  }
  const origFont = context.font;

  context.font = textStyle.getFont();
  const ret = Math.max(0, ...textLines.map((t) => context.measureText(t).width));

  context.font = origFont;

  return ret + (2 * padding);
}

export function textBoxHeight (context, textLines, padding = DEFAULT_PADDING) {
  if (!Array.isArray(textLines)) {
    textLines = [textLines];
  }

  return padding + textLines.length * (textStyle.getFontSize() + padding);
}

export default function (context, element, textLines, coords, xOffset, yOffset, color, options, padding = DEFAULT_PADDING) {
  const cornerstone = external.cornerstone;

  if (Object.prototype.toString.call(textLines) !== '[object Array]') {
    textLines = [textLines];
  }

  if (!(options && options.pixelCoords === false)) {
    coords = cornerstone.pixelToCanvas(element, coords);
  }

  // Calculate the bounding box for this text box
  const boundingBox = {
    left: coords.x + xOffset,
    top: coords.y + yOffset,
    width: textBoxWidth(context, textLines),
    height: textBoxHeight(context, textLines)
  };

  if (options && options.centering && options.centering.x === true) {
    boundingBox.x -= boundingBox.width / 2;
  }

  if (options && options.centering && options.centering.y === true) {
    boundingBox.y -= boundingBox.height / 2;
  }

  draw(context, (context) => {
    fillBox(context, boundingBox, options && options.debug === true ? '#FF0000' : textStyle.getBackgroundColor());
    fillTextLines(context, boundingBox, textLines, color, padding);
  });

  return boundingBox;
}
