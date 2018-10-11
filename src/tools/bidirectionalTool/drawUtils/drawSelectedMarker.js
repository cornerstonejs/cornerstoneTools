import toolStyle from '../../../stateManagement/toolStyle.js';
import external from '../../../externalModules.js';
import getSelectedHandleKey from './../utils/getSelectedHandleKey.js';
import repositionBidirectionalArmHandle from './../utils/repositionBidirectionalArmHandle.js';

// Draw a line marker over the selected arm
export default function (eventData, handles, color) {
  const { canvasContext, element } = eventData;

  const handleKey = getSelectedHandleKey(handles);

  if (!handleKey) {
    return;
  }
  const handle = handles[handleKey];

  // Used a big distance (1km) to fill the entire line
  const mmStep = -1000000;

  // Get the line's start and end points
  const fakeImage = {
    columnPixelSpacing: eventData.viewport.scale,
    rowPixelSpacing: eventData.viewport.scale
  };
  const pointA = repositionBidirectionalArmHandle(fakeImage, handles, handleKey, mmStep, 0);
  const pointB = Object.assign({}, ...['x', 'y'].map((key) => ({ [key]: handle[key] })));

  // Stop here if pointA is not present
  if (!pointA) {
    return;
  }

  // Get the canvas coordinates for the line    var perpendicularStartCanvas = cornerstone.pixelToCanvas(element, data.handles.perpendicularStart);
  const canvasPointA = external.cornerstone.pixelToCanvas(element, pointA);
  const canvasPointB = external.cornerstone.pixelToCanvas(element, pointB);

  // Draw the line marker
  canvasContext.beginPath();
  canvasContext.strokeStyle = color;
  canvasContext.lineWidth = toolStyle.getToolWidth();
  canvasContext.moveTo(canvasPointA.x, canvasPointA.y);
  canvasContext.lineTo(canvasPointB.x, canvasPointB.y);
  canvasContext.stroke();
}
