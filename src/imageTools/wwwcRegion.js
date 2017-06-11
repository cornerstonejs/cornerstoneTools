import * as cornerstone from 'cornerstone-core';
import toolStyle from '../stateManagement/toolStyle.js';
import toolColors from '../stateManagement/toolColors.js';
import { getToolState, addToolState } from '../stateManagement/toolState.js';
import getLuminance from '../util/getLuminance.js';
import isMouseButtonEnabled from '../util/isMouseButtonEnabled.js';

const toolType = 'wwwcRegion';

let configuration = {
  minWindowWidth: 10
};

let currentMouseButtonMask;

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
function newImageCallback (e, eventData) {
  const toolData = getToolState(eventData.element, toolType);

  if (toolData && toolData.data) {
    toolData.data = [];
  }

  $(eventData.element).off('CornerstoneToolsMouseMove', dragCallback);
  $(eventData.element).off('CornerstoneToolsMouseDrag', dragCallback);

  $(eventData.element).off('CornerstoneToolsMouseUp', dragEndCallback);
  $(eventData.element).off('CornerstoneToolsMouseClick', dragEndCallback);

  const mouseData = {
    mouseButtonMask: currentMouseButtonMask
  };

  $(eventData.element).on('CornerstoneToolsMouseDown', mouseData, mouseDownCallback);
}

/* Applies the windowing procedure when the mouse drag ends */
function dragEndCallback (e, eventData) {
  $(eventData.element).off('CornerstoneToolsMouseMove', dragCallback);
  $(eventData.element).off('CornerstoneToolsMouseDrag', dragCallback);

  $(eventData.element).off('CornerstoneToolsMouseUp', dragEndCallback);
  $(eventData.element).off('CornerstoneToolsMouseClick', dragEndCallback);

  const mouseData = {
    mouseButtonMask: currentMouseButtonMask
  };

  $(eventData.element).on('CornerstoneToolsMouseDown', mouseData, mouseDownCallback);

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

function whichMovement (e, eventData) {
  const element = eventData.element;

  $(element).off('CornerstoneToolsMouseMove');
  $(element).off('CornerstoneToolsMouseDrag');

  $(element).on('CornerstoneToolsMouseMove', dragCallback);
  $(element).on('CornerstoneToolsMouseDrag', dragCallback);

  $(element).on('CornerstoneToolsMouseClick', dragEndCallback);
  if (e.type === 'CornerstoneToolsMouseDrag') {
    $(element).on('CornerstoneToolsMouseUp', dragEndCallback);
  }
}

/** Records the start point and attaches the drag event handler */
function mouseDownCallback (e, eventData) {
  if (isMouseButtonEnabled(eventData.which, e.data.mouseButtonMask)) {
    $(eventData.element).on('CornerstoneToolsMouseDrag', eventData, whichMovement);
    $(eventData.element).on('CornerstoneToolsMouseMove', eventData, whichMovement);

    $(eventData.element).off('CornerstoneToolsMouseDown', mouseDownCallback);
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
function dragCallback (e, eventData) {
    // If we have no toolData for this element, return immediately as there is nothing to do
  const toolData = getToolState(eventData.element, toolType);

  if (!toolData || !toolData.data || !toolData.data.length) {
    return;
  }

    // Update the endpoint as the mouse/touch is dragged
  const endPoint = {
    x: eventData.currentPoints.image.x,
    y: eventData.currentPoints.image.y
  };

  toolData.data[0].endPoint = endPoint;
  cornerstone.updateImage(eventData.element);
}

function onImageRendered (e, eventData) {
  const toolData = getToolState(eventData.element, toolType);

  if (!toolData || !toolData.data || !toolData.data.length) {
    return;
  }

  const startPoint = toolData.data[0].startPoint;
  const endPoint = toolData.data[0].endPoint;

  if (!startPoint || !endPoint) {
    return;
  }

    // Get the current element's canvas
  const canvas = $(eventData.element).find('canvas').get(0);
  const context = canvas.getContext('2d');

  context.setTransform(1, 0, 0, 1, 0, 0);

    // Set to the active tool color
  const color = toolColors.getActiveColor();

    // Calculate the rectangle parameters
  const startPointCanvas = cornerstone.pixelToCanvas(eventData.element, startPoint);
  const endPointCanvas = cornerstone.pixelToCanvas(eventData.element, endPoint);

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
  $(element).off('CornerstoneToolsMouseDown', mouseDownCallback);

  $(element).off('CornerstoneToolsMouseUp', dragEndCallback);
  $(element).off('CornerstoneToolsMouseClick', dragEndCallback);

  $(element).off('CornerstoneToolsMouseDrag', dragCallback);
  $(element).off('CornerstoneToolsMouseMove', dragCallback);

  $(element).off('CornerstoneImageRendered', onImageRendered);
  $(element).off('CornerstoneNewImage', newImageCallback);

  cornerstone.updateImage(element);
}

function activate (element, mouseButtonMask) {
  const eventData = {
    mouseButtonMask
  };

  currentMouseButtonMask = mouseButtonMask;

  const toolData = getToolState(element, toolType);

  if (!toolData) {
    const data = [];

    addToolState(element, toolType, data);
  }

  $(element).off('CornerstoneToolsMouseDown', mouseDownCallback);

  $(element).off('CornerstoneToolsMouseUp', dragEndCallback);
  $(element).off('CornerstoneToolsMouseClick', dragEndCallback);

  $(element).off('CornerstoneToolsMouseDrag', dragCallback);
  $(element).off('CornerstoneToolsMouseMove', dragCallback);

  $(element).off('CornerstoneImageRendered', onImageRendered);
  $(element).off('CornerstoneNewImage', newImageCallback);

  $(element).on('CornerstoneToolsMouseDown', eventData, mouseDownCallback);
  $(element).on('CornerstoneImageRendered', onImageRendered);

    // If the displayed image changes after the user has started clicking, we should
    // Cancel the handlers and prepare for another click
  $(element).on('CornerstoneNewImage', newImageCallback);

  cornerstone.updateImage(element);
}

// --- Touch tool enable / disable --- //
function disableTouchDrag (element) {
  $(element).off('CornerstoneToolsTouchDrag', dragCallback);
  $(element).off('CornerstoneToolsTouchStart', recordStartPoint);
  $(element).off('CornerstoneToolsDragEnd', applyWWWCRegion);
  $(element).off('CornerstoneImageRendered', onImageRendered);
}

function activateTouchDrag (element) {
  const toolData = getToolState(element, toolType);

  if (!toolData) {
    const data = [];

    addToolState(element, toolType, data);
  }

  $(element).off('CornerstoneToolsTouchDrag', dragCallback);
  $(element).off('CornerstoneToolsTouchStart', recordStartPoint);
  $(element).off('CornerstoneToolsDragEnd', applyWWWCRegion);
  $(element).off('CornerstoneImageRendered', onImageRendered);

  $(element).on('CornerstoneToolsTouchDrag', dragCallback);
  $(element).on('CornerstoneToolsTouchStart', recordStartPoint);
  $(element).on('CornerstoneToolsDragEnd', applyWWWCRegion);
  $(element).on('CornerstoneImageRendered', onImageRendered);
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
