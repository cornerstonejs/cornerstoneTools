import EVENTS from '../events.js';
import external from '../externalModules.js';
import toolStyle from '../stateManagement/toolStyle.js';
import toolColors from '../stateManagement/toolColors.js';
import { getToolState, addToolState } from '../stateManagement/toolState.js';
import getLuminance from '../util/getLuminance.js';
import isMouseButtonEnabled from '../util/isMouseButtonEnabled.js';
import { setToolOptions, getToolOptions } from '../toolOptions.js';

const toolType = 'wwwcRegion';

let configuration = {
  minWindowWidth: 10
};

/** Calculates the minimum, maximum, and mean value in the given pixel array */
function calculateMinMaxMean (storedPixelLuminanceData, globalMin, globalMax) {
  const numPixels = storedPixelLuminanceData.length;

  if (numPixels < 2) {
    return {
      min: globalMin,
      max: globalMax,
      mean: (globalMin + globalMax) / 2
    };
  }

  let min = globalMax;
  let max = globalMin;
  let sum = 0;

  for (let index = 0; index < numPixels; index++) {
    const spv = storedPixelLuminanceData[index];

    min = Math.min(min, spv);
    max = Math.max(max, spv);
    sum += spv;
  }

  return {
    min,
    max,
    mean: sum / numPixels
  };
}

/* Erases the toolData and rebinds the handlers when the image changes */
function newImageCallback (e) {
  const eventData = e.detail;
  const element = eventData.element;
  const toolData = getToolState(element, toolType);

  if (toolData && toolData.data) {
    toolData.data = [];
  }

  element.removeEventListener(EVENTS.MOUSE_MOVE, dragCallback);
  element.removeEventListener(EVENTS.MOUSE_DRAG, dragCallback);

  element.removeEventListener(EVENTS.MOUSE_UP, dragEndCallback);
  element.removeEventListener(EVENTS.MOUSE_CLICK, dragEndCallback);

  element.addEventListener(EVENTS.MOUSE_DOWN, mouseDownCallback);
}

/* Applies the windowing procedure when the mouse drag ends */
function dragEndCallback (e) {
  const eventData = e.detail;
  const element = eventData.element;

  element.removeEventListener(EVENTS.MOUSE_MOVE, dragCallback);
  element.removeEventListener(EVENTS.MOUSE_DRAG, dragCallback);

  element.removeEventListener(EVENTS.MOUSE_UP, dragEndCallback);
  element.removeEventListener(EVENTS.MOUSE_CLICK, dragEndCallback);

  element.addEventListener(EVENTS.MOUSE_DOWN, mouseDownCallback);

  const toolData = getToolState(eventData.element, toolType);

  if (!toolData || !toolData.data || !toolData.data.length) {
    return;
  }

  // Update the endpoint as the mouse/touch is dragged
  toolData.data[0].endPoint = {
    x: eventData.currentPoints.image.x,
    y: eventData.currentPoints.image.y
  };

  applyWWWCRegion(eventData);
}

/** Calculates the minimum and maximum value in the given pixel array */
function applyWWWCRegion (eventData) {
  const cornerstone = external.cornerstone;
  const toolData = getToolState(eventData.element, toolType);

  if (!toolData || !toolData.data || !toolData.data.length) {
    return;
  }

  const startPoint = toolData.data[0].startPoint;
  const endPoint = toolData.data[0].endPoint;

  // Get the rectangular region defined by the handles
  let width = Math.abs(startPoint.x - endPoint.x);
  let height = Math.abs(startPoint.y - endPoint.y);

  let left = Math.min(startPoint.x, endPoint.x);
  let top = Math.min(startPoint.y, endPoint.y);

  // Bound the rectangle so we don't get undefined pixels
  left = Math.max(left, 0);
  left = Math.min(left, eventData.image.width);
  top = Math.max(top, 0);
  top = Math.min(top, eventData.image.height);
  width = Math.floor(Math.min(width, Math.abs(eventData.image.width - left)));
  height = Math.floor(Math.min(height, Math.abs(eventData.image.height - top)));

  // Get the pixel data in the rectangular region
  const pixelLuminanceData = getLuminance(eventData.element, left, top, width, height);

  // Calculate the minimum and maximum pixel values
  const minMaxMean = calculateMinMaxMean(pixelLuminanceData, eventData.image.minPixelValue, eventData.image.maxPixelValue);

  // Adjust the viewport window width and center based on the calculated values
  const config = wwwcRegion.getConfiguration();
  const viewport = cornerstone.getViewport(eventData.element);

  if (config.minWindowWidth === undefined) {
    config.minWindowWidth = 10;
  }

  viewport.voi.windowWidth = Math.max(Math.abs(minMaxMean.max - minMaxMean.min), config.minWindowWidth);
  viewport.voi.windowCenter = minMaxMean.mean;
  cornerstone.setViewport(eventData.element, viewport);

  // Clear the toolData
  toolData.data = [];

  cornerstone.updateImage(eventData.element);
}

function whichMovement (e) {
  const eventData = e.detail;
  const element = eventData.element;

  element.removeEventListener(EVENTS.MOUSE_MOVE, whichMovement);
  element.removeEventListener(EVENTS.MOUSE_DRAG, whichMovement);

  element.addEventListener(EVENTS.MOUSE_MOVE, dragCallback);
  element.addEventListener(EVENTS.MOUSE_DRAG, dragCallback);

  element.addEventListener(EVENTS.MOUSE_CLICK, dragEndCallback);
  if (e.type === EVENTS.MOUSE_DRAG) {
    element.addEventListener(EVENTS.MOUSE_UP, dragEndCallback);
  }
}

/** Records the start point and attaches the drag event handler */
function mouseDownCallback (e) {
  const eventData = e.detail;
  const element = eventData.element;
  const options = getToolOptions(toolType, element);

  if (isMouseButtonEnabled(eventData.which, options.mouseButtonMask)) {
    element.addEventListener(EVENTS.MOUSE_DRAG, whichMovement);
    element.addEventListener(EVENTS.MOUSE_MOVE, whichMovement);

    element.removeEventListener(EVENTS.MOUSE_DOWN, mouseDownCallback);
    recordStartPoint(eventData);

    return false;
  }
}

/** Records the start point of the click or touch */
function recordStartPoint (eventData) {
  const toolData = getToolState(eventData.element, toolType);

  if (toolData && toolData.data) {
    toolData.data = [];
  }

  const measurementData = {
    startPoint: {
      x: eventData.currentPoints.image.x,
      y: eventData.currentPoints.image.y
    }
  };

  addToolState(eventData.element, toolType, measurementData);
}

/** Draws the rectangular region while the touch or mouse event drag occurs */
function dragCallback (e) {
  const eventData = e.detail;
  const element = eventData.element;

  // If we have no toolData for this element, return immediately as there is nothing to do
  const toolData = getToolState(element, toolType);

  if (!toolData || !toolData.data || !toolData.data.length) {
    return;
  }

  // Update the endpoint as the mouse/touch is dragged
  toolData.data[0].endPoint = {
    x: eventData.currentPoints.image.x,
    y: eventData.currentPoints.image.y
  };

  external.cornerstone.updateImage(element);
}

function onImageRendered (e) {
  const eventData = e.detail;
  const element = eventData.element;
  const context = eventData.canvasContext;
  const cornerstone = external.cornerstone;
  const toolData = getToolState(eventData.element, toolType);

  if (!toolData || !toolData.data || !toolData.data.length) {
    return;
  }

  const startPoint = toolData.data[0].startPoint;
  const endPoint = toolData.data[0].endPoint;

  if (!startPoint || !endPoint) {
    return;
  }

  context.setTransform(1, 0, 0, 1, 0, 0);

  // Set to the active tool color
  const color = toolColors.getActiveColor();

  // Calculate the rectangle parameters
  const startPointCanvas = cornerstone.pixelToCanvas(element, startPoint);
  const endPointCanvas = cornerstone.pixelToCanvas(element, endPoint);

  const left = Math.min(startPointCanvas.x, endPointCanvas.x);
  const top = Math.min(startPointCanvas.y, endPointCanvas.y);
  const width = Math.abs(startPointCanvas.x - endPointCanvas.x);
  const height = Math.abs(startPointCanvas.y - endPointCanvas.y);

  const lineWidth = toolStyle.getToolWidth();
  const config = wwwcRegion.getConfiguration();

  // Draw the rectangle
  context.save();

  if (config && config.shadow) {
    context.shadowColor = config.shadowColor || '#000000';
    context.shadowOffsetX = config.shadowOffsetX || 1;
    context.shadowOffsetY = config.shadowOffsetY || 1;
  }

  context.beginPath();
  context.strokeStyle = color;
  context.lineWidth = lineWidth;
  context.rect(left, top, width, height);
  context.stroke();

  context.restore();
}

// --- Mouse tool enable / disable --- ///
function disable (element) {
  element.removeEventListener(EVENTS.MOUSE_DOWN, mouseDownCallback);

  element.removeEventListener(EVENTS.MOUSE_UP, dragEndCallback);
  element.removeEventListener(EVENTS.MOUSE_CLICK, dragEndCallback);

  element.removeEventListener(EVENTS.MOUSE_DRAG, dragCallback);
  element.removeEventListener(EVENTS.MOUSE_MOVE, dragCallback);

  element.removeEventListener(EVENTS.IMAGE_RENDERED, onImageRendered);
  element.removeEventListener(EVENTS.NEW_IMAGE, newImageCallback);

  external.cornerstone.updateImage(element);
}

function activate (element, mouseButtonMask) {
  setToolOptions(toolType, element, { mouseButtonMask });

  const toolData = getToolState(element, toolType);

  if (!toolData) {
    const data = [];

    addToolState(element, toolType, data);
  }

  element.removeEventListener(EVENTS.MOUSE_DOWN, mouseDownCallback);

  element.removeEventListener(EVENTS.MOUSE_UP, dragEndCallback);
  element.removeEventListener(EVENTS.MOUSE_CLICK, dragEndCallback);

  element.removeEventListener(EVENTS.MOUSE_DRAG, dragCallback);
  element.removeEventListener(EVENTS.MOUSE_MOVE, dragCallback);

  element.removeEventListener(EVENTS.IMAGE_RENDERED, onImageRendered);
  element.removeEventListener(EVENTS.NEW_IMAGE, newImageCallback);

  element.addEventListener(EVENTS.MOUSE_DOWN, mouseDownCallback);
  element.addEventListener(EVENTS.IMAGE_RENDERED, onImageRendered);

  // If the displayed image changes after the user has started clicking, we should
  // Cancel the handlers and prepare for another click
  element.addEventListener(EVENTS.NEW_IMAGE, newImageCallback);

  external.cornerstone.updateImage(element);
}

// --- Touch tool enable / disable --- //
function disableTouchDrag (element) {
  element.removeEventListener(EVENTS.TOUCH_DRAG, dragCallback);
  element.removeEventListener(EVENTS.TOUCH_START, recordStartPoint);
  element.removeEventListener(EVENTS.TOUCH_DRAG_END, applyWWWCRegion);
  element.removeEventListener(EVENTS.IMAGE_RENDERED, onImageRendered);
}

function activateTouchDrag (element) {
  const toolData = getToolState(element, toolType);

  if (!toolData) {
    const data = [];

    addToolState(element, toolType, data);
  }

  element.removeEventListener(EVENTS.TOUCH_DRAG, dragCallback);
  element.removeEventListener(EVENTS.TOUCH_START, recordStartPoint);
  element.removeEventListener(EVENTS.TOUCH_DRAG_END, applyWWWCRegion);
  element.removeEventListener(EVENTS.IMAGE_RENDERED, onImageRendered);

  element.addEventListener(EVENTS.TOUCH_DRAG, dragCallback);
  element.addEventListener(EVENTS.TOUCH_START, recordStartPoint);
  element.addEventListener(EVENTS.TOUCH_DRAG_END, applyWWWCRegion);
  element.addEventListener(EVENTS.IMAGE_RENDERED, onImageRendered);
}

function getConfiguration () {
  return configuration;
}

function setConfiguration (config) {
  configuration = config;
}

// Module exports
const wwwcRegion = {
  activate,
  deactivate: disable,
  disable,
  setConfiguration,
  getConfiguration
};

const wwwcRegionTouch = {
  activate: activateTouchDrag,
  deactivate: disableTouchDrag,
  disable: disableTouchDrag
};

export {
  wwwcRegion,
  wwwcRegionTouch
};
