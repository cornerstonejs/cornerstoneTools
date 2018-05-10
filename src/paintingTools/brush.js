import external from '../externalModules.js';
import { getToolState } from '../stateManagement/toolState.js';
import brushTool from './brushTool.js';
import getCircle from './getCircle.js';
import { drawBrushPixels, drawBrushOnCanvas } from './drawBrush.js';

// This module is for creating segmentation overlays
const TOOL_STATE_TOOL_TYPE = 'brush';
const toolType = 'brush';
const configuration = {
  draw: 1,
  radius: 3,
  hoverColor: 'green',
  dragColor: 'yellow'
};

let lastImageCoords;
let dragging = false;

function paint (eventData) {
  const configuration = brush.getConfiguration();
  const element = eventData.element;
  const { rows, columns } = eventData.image;
  const { x, y } = eventData.currentPoints.image;
  const toolData = getToolState(element, TOOL_STATE_TOOL_TYPE);
  const pixelData = toolData.data[0].pixelData;
  const brushPixelValue = configuration.draw;
  const radius = configuration.radius;

  if (x < 0 || x > columns ||
    y < 0 || y > rows) {
    return;
  }

  const pointerArray = getCircle(radius, rows, columns, x, y);

  drawBrushPixels(pointerArray, pixelData, brushPixelValue, columns);

  external.cornerstone.updateImage(eventData.element);
}

function onMouseUp (e) {
  const eventData = e.detail;

  lastImageCoords = eventData.currentPoints.image;
  dragging = false;
}

function onMouseDown (e) {
  const eventData = e.detail;

  paint(eventData);
  dragging = true;
  lastImageCoords = eventData.currentPoints.image;
}

function onMouseMove (e) {
  const eventData = e.detail;

  lastImageCoords = eventData.currentPoints.image;
  external.cornerstone.updateImage(eventData.element);
}

function onDrag (e) {
  const eventData = e.detail;

  paint(eventData);
  dragging = true;
  lastImageCoords = eventData.currentPoints.image;
}

function onImageRendered (e) {
  const eventData = e.detail;

  if (!lastImageCoords) {
    return;
  }

  const { rows, columns } = eventData.image;
  const { x, y } = lastImageCoords;

  if (x < 0 || x > columns ||
    y < 0 || y > rows) {
    return;
  }

  // Draw the hover overlay on top of the pixel data
  const configuration = brush.getConfiguration();
  const radius = configuration.radius;
  const context = eventData.canvasContext;
  const color = dragging ? configuration.dragColor : configuration.hoverColor;
  const element = eventData.element;

  context.setTransform(1, 0, 0, 1, 0, 0);

  const { cornerstone } = external;
  const mouseCoordsCanvas = cornerstone.pixelToCanvas(eventData.element, lastImageCoords);
  const radiusCanvas = cornerstone.pixelToCanvas(eventData.element, { x: radius, y: radius });
  context.ellipse(mouseCoordsCanvas.x, mouseCoordsCanvas.y, radiusCanvas.x, radiusCanvas.y);
}

const brush = brushTool({
  onMouseMove,
  onMouseDown,
  onMouseUp,
  onDrag,
  toolType,
  onImageRendered
});

brush.setConfiguration(configuration);

export { brush };
