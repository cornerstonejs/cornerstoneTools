import external from '../externalModules.js';
import { getToolState } from '../stateManagement/toolState.js';
import brushTool from './brushTool.js';
import getCircle from './getCircle.js';
import { drawBrushPixels, drawBrushOnCanvas } from './drawBrush.js';

// This module is for creating segmentation overlays
const TOOL_STATE_TOOL_TYPE = 'brush';
const toolType = 'adaptiveBrush';
const configuration = {
  draw: 1,
  radius: 3,
  tolerance: 5,
  minRadius: 1,
  hoverColor: 'green',
  dragColor: 'yellow'
};

let lastImageCoords;
let thrMax;
let thrMin;
let currentRadius;
let dragging;

function getGreyValues (pointerArray, pixelData, imageColumns) {
  const configuration = adaptiveBrush.getConfiguration();
  const tolerance = configuration.tolerance;
  let minValue = Number.MAX_VALUE;
  let maxValue = -Number.MAX_VALUE;

  pointerArray.forEach((point) => {
    const pixelIndex = point[1] * imageColumns + point[0];
    const greyValue = pixelData[pixelIndex];

    minValue = Math.min(greyValue, minValue);
    maxValue = Math.max(greyValue, maxValue);
  });

  thrMin = minValue - tolerance;
  thrMax = maxValue + tolerance;
}

// Draws the pointer with overlap calculation - Used on mouse clicked
function paintAdaptiveBrush (imagePixelData, brushPixelData, rows, columns) {
  const configuration = adaptiveBrush.getConfiguration();
  const brushPixelValue = configuration.draw;
  const mouseX = Math.round(lastImageCoords.x);
  const mouseY = Math.round(lastImageCoords.y);
  let numPixelsOutsideThresholdWindow = null;
  let pointerArray = [];
  let radius = configuration.radius;

  /*
   * Find pixels within the brush area. If within the brush area there are pixels outside the threshold min / max,
   * decrease the brush radius until there are no sub/supra threshold pixels left (or until you reach the minimum radius).
   */
  while (numPixelsOutsideThresholdWindow !== 0 && radius > configuration.minRadius) {
    numPixelsOutsideThresholdWindow = 0;
    pointerArray = getCircle(radius, rows, columns, mouseX, mouseY);

    // Loop through each of the relative pixel coordinates for the brush
    for (let j = 0; j < pointerArray.length; j++) {
      // Calculate the x / y image coordinates using the brush and the current mouse position
      const xCoord = pointerArray[j][0];
      const yCoord = pointerArray[j][1];

      // Otherwise, retrieve the image pixel value in this location
      const pixelIndex = yCoord * columns + xCoord;
      const pixelValue = imagePixelData[pixelIndex];

      /*
        If the image pixel value is outside of the thresholds,
        increase the numPixelsOutsideThresholdWindow counter
      */
      if (pixelValue > thrMax || pixelValue < thrMin) {
        numPixelsOutsideThresholdWindow++;
        break;
      }
    }

    radius--;
  }

  if (numPixelsOutsideThresholdWindow === 0) {
    drawBrushPixels(pointerArray, brushPixelData, brushPixelValue, columns);
  }

  return radius;
}

function paint (eventData) {
  const configuration = adaptiveBrush.getConfiguration();
  const element = eventData.element;
  const layer = external.cornerstone.getLayer(element, configuration.brushLayerId);
  const baseLayer = external.cornerstone.getLayers(element)[0];
  const { rows, columns } = layer.image;
  const toolData = getToolState(element, TOOL_STATE_TOOL_TYPE);
  const brushData = toolData.data[0];

  currentRadius = paintAdaptiveBrush(baseLayer.image.getPixelData(), brushData.pixelData, rows, columns);
  layer.invalid = true;

  external.cornerstone.updateImage(element);
}

function erase (eventData) {
  const configuration = adaptiveBrush.getConfiguration();
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
  const configuration = adaptiveBrush.getConfiguration();

  dragging = false;
  currentRadius = configuration.radius;
  external.cornerstone.updateImage(eventData.element);
}

function onMouseDown (e) {
  const eventData = e.detail;

  const element = eventData.element;
  const configuration = adaptiveBrush.getConfiguration();
  const layer = external.cornerstone.getLayer(element, configuration.brushLayerId);
  const baseLayer = external.cornerstone.getLayers(element)[0];
  const { x, y } = eventData.currentPoints.image;
  const { rows, columns } = layer.image;
  const pointerArray = getCircle(configuration.radius, rows, columns, x, y);

  if (configuration.draw === 0) {
    erase(eventData);
  } else {
    getGreyValues(pointerArray, baseLayer.image.getPixelData(), columns);
    paint(eventData);
  }

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

  if (configuration.draw === 0) {
    erase(eventData);
  } else {
    paint(eventData);
  }

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
  const configuration = adaptiveBrush.getConfiguration();
  const context = eventData.canvasContext;
  const color = dragging ? configuration.dragColor : configuration.hoverColor;
  const element = eventData.element;

  currentRadius = currentRadius || configuration.radius;

  context.setTransform(1, 0, 0, 1, 0, 0);

  const pointerArray = getCircle(currentRadius, rows, columns, x, y);

  drawBrushOnCanvas(pointerArray, context, color, element);
}

const adaptiveBrush = brushTool({
  onMouseMove,
  onMouseDown,
  onMouseUp,
  onDrag,
  toolType,
  onImageRendered
});

adaptiveBrush.setConfiguration(configuration);

export { adaptiveBrush };
