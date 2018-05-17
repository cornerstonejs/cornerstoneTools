import external from '../externalModules.js';
import drawTextBox from './drawTextBox.js';
import { drawLine } from './drawing.js';

function drawLink (context, element, linkAnchorPoints, refPoint, boundingBox, color) {
  // Draw a link from "the closest anchor point to refPoint" to "the nearest midpoint on the bounding box".

  // Find the closest anchor point to RefPoint
  const start = (linkAnchorPoints.length > 0)
    ? external.cornerstoneMath.point.findClosestPoint(linkAnchorPoints, refPoint)
    : refPoint;

  // Calculate the midpoints of the bounding box
  const boundingBoxPoints = [{
    x: boundingBox.left + boundingBox.width / 2,
    y: boundingBox.top
  }, {
    x: boundingBox.left,
    y: boundingBox.top + boundingBox.height / 2
  }, {
    x: boundingBox.left + boundingBox.width / 2,
    y: boundingBox.top + boundingBox.height
  }, {
    x: boundingBox.left + boundingBox.width,
    y: boundingBox.top + boundingBox.height / 2
  }
  ];

  // Calculate the link endpoint by identifying which midpoint of the bounding box
  // Is closest to the start point.
  const end = external.cornerstoneMath.point.findClosestPoint(boundingBoxPoints, start);

  // Finally we draw the dashed linking line
  const options = {
    color,
    lineDash: [2, 3]
  };

  drawLine(context, element, start, end, options);
}


export default function (context, element, enabledElement, textBox, text,
  handles, textBoxAnchorPoints, textBoxCoords, color, xOffset, yCenter) {
  const cornerstone = external.cornerstone;

  if (!textBox.hasMoved) {
    const coords = textBoxCoords(context, element, enabledElement, handles, text);

    textBox.x = coords.x;
    textBox.y = coords.y;
  }

  // Convert the textbox Image coordinates into Canvas coordinates
  const textCoords = cornerstone.pixelToCanvas(element, textBox);

  xOffset = xOffset || 0;

  textCoords.x += xOffset;

  const options = {
    centering: {
      x: false,
      y: yCenter
    }
  };

  // Draw the text box
  textBox.boundingBox = drawTextBox(context, text, textBox, xOffset || 0, 0, color, options);
  if (textBox.hasMoved) {
    // Identify the possible anchor points for the tool -> text line
    const linkAnchorPoints = textBoxAnchorPoints(handles).map((h) => cornerstone.pixelToCanvas(element, h));

    // Draw dashed link line between tool and text
    drawLink(context, element, linkAnchorPoints, textCoords, textBox.boundingBox, color);
  }
}
