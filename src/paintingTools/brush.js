import * as cornerstone from 'cornerstone-core';
import mouseButtonTool from '../imageTools/mouseButtonTool.js';
import isMouseButtonEnabled from '../util/isMouseButtonEnabled.js';

// This module is for creating segmentation overlays
const configuration = {
  draw: 1,
  radius: 10,
  hoverColor: 'green',
  dragColor: 'yellow',
  overlayColor: 'red'
};

let brushImagePositions = [];
let lastCanvasCoords;
const dynamicImageCanvas = document.createElement('canvas');

function defaultStrategy (eventData) {
  const configuration = brush.getConfiguration();
  const enabledElement = cornerstone.getEnabledElement(eventData.element);
  const context = enabledElement.canvas.getContext('2d');

  context.setTransform(1, 0, 0, 1, 0, 0);

  const coords = eventData.currentPoints.canvas;
  const radius = configuration.radius * enabledElement.viewport.scale;

  drawCircle(context, coords, radius, configuration.dragColor);

  brushImagePositions.push({
    x: Math.round(eventData.currentPoints.image.x),
    y: Math.round(eventData.currentPoints.image.y)
  });

  lastCanvasCoords = eventData.currentPoints.canvas;
}

function drawCircle (context, coords, radius, color) {
  context.save();
  context.beginPath();
  context.arc(coords.x, coords.y, radius, 0, 2 * Math.PI, true);
  context.strokeStyle = color;
  context.fillStyle = color;
  context.stroke();
  context.fill();
  context.restore();
}

function clearCircle (context, coords, radius) {
  context.save();
  context.beginPath();
  context.arc(coords.x, coords.y, radius, 0, 2 * Math.PI, true);
  context.clip();
  context.clearRect(coords.x - radius - 1, coords.y - radius - 1,
                    radius * 2 + 2, radius * 2 + 2);
  context.restore();
}

function mouseMoveCallback (e, eventData) {
  lastCanvasCoords = eventData.currentPoints.canvas;
  cornerstone.updateImage(eventData.element);
}

function mouseUpCallback (e, eventData) {
  lastCanvasCoords = eventData.currentPoints.canvas;
  cornerstone.updateImage(eventData.element, true);

  $(eventData.element).off('CornerstoneToolsMouseDrag', mouseMoveCallback);
  $(eventData.element).off('CornerstoneToolsMouseDrag', dragCallback);
  $(eventData.element).off('CornerstoneToolsMouseUp', mouseUpCallback);
  $(eventData.element).off('CornerstoneToolsMouseClick', mouseUpCallback);
}

function dragCallback (e, eventData) {
  brush.strategy(eventData);

  return false;
}

function mouseDownActivateCallback (e, eventData) {
  if (isMouseButtonEnabled(eventData.which, e.data.mouseButtonMask)) {
    $(eventData.element).on('CornerstoneToolsMouseDrag', dragCallback);
    $(eventData.element).on('CornerstoneToolsMouseUp', mouseUpCallback);
    $(eventData.element).on('CornerstoneToolsMouseClick', mouseUpCallback);
    brush.strategy(eventData);

    return false;
  }

  $(eventData.element).on('CornerstoneToolsMouseDrag', mouseMoveCallback);
  $(eventData.element).on('CornerstoneToolsMouseUp', mouseUpCallback);
}

function onImageRendered (e, eventData) {
  const configuration = brush.getConfiguration();
  const enabledElement = cornerstone.getEnabledElement(eventData.element);
  const context = enabledElement.canvas.getContext('2d');

  context.setTransform(1, 0, 0, 1, 0, 0);

  if (!lastCanvasCoords) {
    return;
  }

  const radius = configuration.radius * enabledElement.viewport.scale;

  drawCircle(context, lastCanvasCoords, radius, configuration.hoverColor);
}

function getPixelData () {
  const configuration = brush.getConfiguration();

  const context = dynamicImageCanvas.getContext('2d');

  if (configuration.draw === 1) {
    // Draw
    brushImagePositions.forEach(function (coords) {
      drawCircle(context, coords, configuration.radius, configuration.overlayColor);
    });
  } else {
    // Erase
    brushImagePositions.forEach(function (coords) {
      clearCircle(context, coords, configuration.radius);
    });
  }

  brushImagePositions = [];

  const width = this.width;
  const height = this.height;
  const imageData = context.getImageData(0, 0, width, height);


  return imageData.data;
}

let brushLayerId;

function activate (element, mouseButtonMask) {
  $(element).off('CornerstoneImageRendered', onImageRendered);
  $(element).on('CornerstoneImageRendered', onImageRendered);

  const eventData = {
    mouseButtonMask
  };

  $(element).off('CornerstoneToolsMouseDownActivate', mouseDownActivateCallback);
  $(element).on('CornerstoneToolsMouseDownActivate', eventData, mouseDownActivateCallback);

  $(element).off('CornerstoneToolsMouseMove', mouseMoveCallback);
  $(element).on('CornerstoneToolsMouseMove', mouseMoveCallback);

  const enabledElement = cornerstone.getEnabledElement(element);

  dynamicImageCanvas.width = enabledElement.canvas.width;
  dynamicImageCanvas.height = enabledElement.canvas.height;

  const context = dynamicImageCanvas.getContext('2d');

  context.fillStyle = 'rgba(0,0,0,0)';
  context.fillRect(0, 0, dynamicImageCanvas.width, dynamicImageCanvas.height);

  const dynamicImage = {
    minPixelValue: 0,
    maxPixelValue: 255,
    slope: 1.0,
    intercept: 0,
    windowCenter: 127,
    windowWidth: 256,
    getPixelData,
    rgba: true,
    rows: enabledElement.image.height,
    columns: enabledElement.image.width,
    height: enabledElement.image.height,
    width: enabledElement.image.width,
    color: true,
    invert: false,
    columnPixelSpacing: 1.0,
    rowPixelSpacing: 1.0,
    sizeInBytes: enabledElement.image.width * enabledElement.image.height * 4
  };

  let layer;

  if (brushLayerId) {
    layer = cornerstone.getLayer(element, brushLayerId);
  }

  if (!layer) {
    brushLayerId = cornerstone.addLayer(element, dynamicImage);
  }

  cornerstone.updateImage(element);
}

const brush = mouseButtonTool({
  mouseMoveCallback,
  mouseDownActivateCallback,
  onImageRendered
});

brush.activate = activate;

brush.setConfiguration(configuration);
brush.strategies = {
  default: defaultStrategy
};
brush.strategy = defaultStrategy;

export { brush };
