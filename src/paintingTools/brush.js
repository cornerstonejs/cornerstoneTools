import external from '../externalModules.js';
import { getToolState } from '../stateManagement/toolState.js';
import brushTool from './brushTool.js';
import getCircle from './getCircle.js';
import { drawBrushPixels, drawBrushOnCanvas } from './drawBrush.js';
import { getEndOfCircle, connectEndsOfBrush, isCircleInPolygon, fillColor } from './fill.js';

// This module is for creating segmentation overlays

const TOOL_STATE_TOOL_TYPE = 'brush';
const toolType = 'brush';
const configuration = {
  draw: 1,
  radius: 5,
  minRadius: 1,
  maxRadius: 20,
  hoverColor: 'rgba(230, 25, 75, 1.0)',
  dragColor: 'rgba(230, 25, 75, 0.8)',
  active: false
};

let lastImageCoords;
let dragging = false;

function paint (eventData) {
  const configuration = brush.getConfiguration();
  const element = eventData.element;
  const layer = external.cornerstone.getLayer(element, configuration.brushLayerId);
  const { rows, columns } = layer.image;
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

  layer.invalid = true;

  external.cornerstone.updateImage(element);
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

  if (configuration.active) {
    const pointerArray = getCircle(radius, rows, columns, x, y);

    drawBrushOnCanvas(pointerArray, context, color, element);
  }
}

// This method is for fill region of segmentation overlays
function fill (eventData) {
  const configuration = brush.getConfiguration();
  const radius = configuration.radius;
  const element = eventData.element;
  const layer = external.cornerstone.getLayer(element, configuration.brushLayerId);
  const { rows, columns } = layer.image;
  let { x, y } = eventData.currentPoints.image;
  const toolData = getToolState(element, TOOL_STATE_TOOL_TYPE);
  const pixelData = toolData.data[0].pixelData;
  const brushPixelValue = configuration.draw;

  if (x < 0 || x > columns ||
    y < 0 || y > rows) {
    return;
  }

  x = Math.round(x);
  y = Math.round(y);

  // This thisCircle = [(x, y - radius), (x + radius, y), (x, y + radius), (x - radius, y)]
  const thisCircle = getEndOfCircle(x, y, columns, rows, pixelData, brushPixelValue);

  if (Math.abs(thisCircle[0] - thisCircle[2]) > radius * 2 && Math.abs(thisCircle[1] - thisCircle[3]) > radius * 2) {
    // If the position you clicked is aleady in same color, this method is not necessary.
    return;
  }

  if (connectEndsOfBrush(x, y, columns, rows, thisCircle, pixelData, brushPixelValue)) {
    if (isCircleInPolygon(x, y, columns, rows, thisCircle, pixelData, brushPixelValue)) {
      fillColor(x, thisCircle[0] - 1, columns, rows, pixelData, brushPixelValue);
    }
  }

  layer.invalid = true;

  external.cornerstone.updateImage(element);
}

function onMouseDoubleClick (e) {
  const eventData = e.detail;

  fill(eventData);
}

const brush = brushTool({
  onMouseMove,
  onMouseDown,
  onMouseUp,
  onDrag,
  toolType,
  onImageRendered,
  onMouseDoubleClick
});

brush.setConfiguration(configuration);

export { brush };
