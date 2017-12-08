import { external } from '../externalModules.js';
import { getBrowserInfo } from '../util/getMaxSimultaneousRequests.js';
import isMouseButtonEnabled from '../util/isMouseButtonEnabled.js';

let configuration = {
  magnifySize: 300,
  magnificationLevel: 5
};

let browserName;
let currentPoints;
let zoomCanvas;
let zoomElement;

/** Remove the magnifying glass when the mouse event ends */
function mouseUpCallback (e, eventData) {
  external.$(eventData.element).off('CornerstoneToolsMouseDrag', dragCallback);
  external.$(eventData.element).off('CornerstoneToolsMouseUp', mouseUpCallback);
  external.$(eventData.element).off('CornerstoneToolsMouseClick', mouseUpCallback);
  hideTool(eventData);
}

function hideTool (eventData) {
  external.$(eventData.element).find('.magnifyTool').hide();
  // Re-enable the mouse cursor
  document.body.style.cursor = 'default';
  removeZoomElement();
}

/** Draw the magnifying glass on mouseDown, and begin tracking mouse movements */
function mouseDownCallback (e, eventData) {

  const element = eventData.element;

  if (e.isTouchEvent || isMouseButtonEnabled(eventData.which, e.data.mouseButtonMask)) {
    external.$(element).on('CornerstoneToolsMouseDrag', eventData, dragCallback);
    external.$(element).on('CornerstoneToolsTouchDrag', eventData, dragCallback);
    external.$(element).on('CornerstoneToolsMouseUp', eventData, mouseUpCallback);
    external.$(element).on('CornerstoneToolsTouchEnd', eventData, mouseUpCallback);
    external.$(element).on('CornerstoneToolsMouseClick', eventData, mouseUpCallback);

    external.$(element).on('CornerstoneNewImage', eventData, newImageCallback);

    // Ignore until next event
    drawZoomedElement(eventData);
    // On next frame
    window.requestAnimationFrame(() => drawMagnificationTool(eventData));

    return false; // False = causes jquery to preventDefault() and stopPropagation() this event
  }
}

function newImageCallback (e, eventData) {
  eventData.currentPoints = currentPoints;
  drawMagnificationTool(eventData);
}

function dragEndCallback (e, eventData) {
  const element = eventData.element;

  external.$(eventData.element).off('CornerstoneToolsDragEnd', dragEndCallback);
  external.$(eventData.element).off('CornerstoneToolsTouchEnd', dragEndCallback);
  external.$(element).off('CornerstoneNewImage', newImageCallback);
  hideTool(eventData);
}

/** Drag callback is triggered by both the touch and mouse magnify tools */
function dragCallback (e, eventData) {

  drawMagnificationTool(eventData);
  if (eventData.isTouchEvent === true) {
    external.$(eventData.element).on('CornerstoneToolsDragEnd', dragEndCallback);
    external.$(eventData.element).on('CornerstoneToolsTouchEnd', dragEndCallback);
  }

  return false; // False = causes jquery to preventDefault() and stopPropagation() this event
}

function drawMagnificationTool (eventData) {
  const magnifyCanvas = external.$(eventData.element).find('.magnifyTool').get(0);

  if (!magnifyCanvas) {
    createMagnificationCanvas(eventData.element);
  }

  if (zoomCanvas === undefined) {

    return;
  }

  const config = magnify.getConfiguration();

  const magnifySize = config.magnifySize;
  const magnificationLevel = config.magnificationLevel;

  // The 'not' magnifyTool class here is necessary because cornerstone places
  // No classes of it's own on the canvas we want to select
  const canvas = external.$(eventData.element).find('canvas').not('.magnifyTool').get(0);
  const context = canvas.getContext('2d');

  context.setTransform(1, 0, 0, 1, 0, 0);

  const zoomCtx = magnifyCanvas.getContext('2d');

  zoomCtx.setTransform(1, 0, 0, 1, 0, 0);

  const getSize = magnifySize;

  // Calculate the on-canvas location of the mouse pointer / touch
  const canvasLocation = external.cornerstone.pixelToCanvas(eventData.element, eventData.currentPoints.image);


  canvasLocation.x = Math.max(canvasLocation.x, 0);
  canvasLocation.x = Math.min(canvasLocation.x, canvas.width);

  canvasLocation.y = Math.max(canvasLocation.y, 0);
  canvasLocation.y = Math.min(canvasLocation.y, canvas.height);

  // Clear the rectangle
  zoomCtx.clearRect(0, 0, magnifySize, magnifySize);
  zoomCtx.fillStyle = 'transparent';

  // Fill it with the pixels that the mouse is clicking on
  zoomCtx.fillRect(0, 0, magnifySize, magnifySize);

  const copyFrom = {
    x: canvasLocation.x * magnificationLevel - 0.5 * getSize,
    y: canvasLocation.y * magnificationLevel - 0.5 * getSize
  };

  if (browserName === 'Safari') {
    // Safari breaks when trying to copy pixels with negative indices
    // This prevents proper Magnify usage
    copyFrom.x = Math.max(copyFrom.x, 0);
    copyFrom.y = Math.max(copyFrom.y, 0);
  }

  copyFrom.x = Math.min(copyFrom.x, zoomCanvas.width);
  copyFrom.y = Math.min(copyFrom.y, zoomCanvas.height);

  zoomCtx.drawImage(zoomCanvas, copyFrom.x, copyFrom.y, getSize, getSize, 0, 0, getSize, getSize);

  // Place the magnification tool at the same location as the pointer
  magnifyCanvas.style.top = `${canvasLocation.y - 0.5 * magnifySize}px`;
  magnifyCanvas.style.left = `${canvasLocation.x - 0.5 * magnifySize}px`;

  if (eventData.isTouchEvent) {
    magnifyCanvas.style.top = `${canvasLocation.y - 0.5 * magnifySize - 120}px`;
  }


  magnifyCanvas.style.display = 'block';

  // Hide the mouse cursor, so the user can see better
  document.body.style.cursor = 'none';
}


/** Creates the magnifying glass canvas */
function createMagnificationCanvas (element) {
  // If the magnifying glass canvas doesn't already exist
  if (external.$(element).find('.magnifyTool').length === 0) {
    // Create a canvas and append it as a child to the element
    const magnifyCanvas = document.createElement('canvas');

    // The magnifyTool class is used to find the canvas later on
    magnifyCanvas.classList.add('magnifyTool');

    const config = magnify.getConfiguration();

    magnifyCanvas.width = config.magnifySize;
    magnifyCanvas.height = config.magnifySize;

    // Make sure position is absolute so the canvas can follow the mouse / touch
    magnifyCanvas.style.position = 'absolute';
    magnifyCanvas.style.display = 'none';
    element.appendChild(magnifyCanvas);
  }
}

/** Find the magnifying glass canvas and remove it */
function removeMagnificationCanvas (element) {
  external.$(element).find('.magnifyTool').remove();
}

function drawZoomedElement (eventData) {
  removeZoomElement();
  let enabledElement = eventData.enabledElement;

  if (enabledElement === undefined) {
    enabledElement = external.cornerstone.getEnabledElement(eventData.element);
  }
  const config = magnify.getConfiguration();

  const magnificationLevel = config.magnificationLevel;
  const origCanvas = enabledElement.canvas;
  const image = enabledElement.image;

  zoomElement = document.createElement('div');

  zoomElement.width = origCanvas.width * magnificationLevel;
  zoomElement.height = origCanvas.height * magnificationLevel;
  external.cornerstone.enable(zoomElement);

  const zoomEnabledElement = external.cornerstone.getEnabledElement(zoomElement);
  const viewport = external.cornerstone.getViewport(enabledElement.element);

  zoomCanvas = zoomEnabledElement.canvas;
  zoomCanvas.width = origCanvas.width * magnificationLevel;
  zoomCanvas.height = origCanvas.height * magnificationLevel;

  zoomEnabledElement.viewport = Object.assign({}, viewport);

  viewport.scale *= magnificationLevel;
  external.cornerstone.displayImage(zoomElement, image);
  external.cornerstone.setViewport(zoomElement, viewport);
}

function removeZoomElement () {
  if (zoomElement !== undefined) {
    external.cornerstone.disable(zoomElement);
    zoomElement = undefined;
    zoomCanvas = undefined;
  }
}

// --- Mouse tool activate / disable --- //
function disable (element) {
  external.$(element).off('CornerstoneToolsMouseDown', mouseDownCallback);
  removeMagnificationCanvas(element);
}

function enable (element) {
  const config = magnify.getConfiguration(config);

  if (!browserName) {
    const infoString = getBrowserInfo();
    const info = infoString.split(' ');

    browserName = info[0];
  }

  createMagnificationCanvas(element);
}

function activate (element, mouseButtonMask) {
  const eventData = {
    mouseButtonMask
  };

  external.$(element).off('CornerstoneToolsMouseDown', mouseDownCallback);

  external.$(element).on('CornerstoneToolsMouseDown', eventData, mouseDownCallback);
  createMagnificationCanvas(element);
}

// --- Touch tool activate / disable --- //
function getConfiguration () {
  return configuration;
}

function setConfiguration (config) {
  configuration = config;
}

// Module exports
const magnify = {
  enable,
  activate,
  deactivate: disable,
  disable,
  getConfiguration,
  setConfiguration
};

function enableTouch (element) {
  external.$(element).off('CornerstoneToolsTouchStart', mouseDownCallback);
  external.$(element).on('CornerstoneToolsTouchStart', mouseDownCallback);
}

// Disables the reference line tool for the given element
function disableTouch (element) {
  external.$(element).off('CornerstoneToolsTouchStart', mouseDownCallback);
}

const magnifyTouchDrag = {
  activate: enableTouch,
  deactivate: disableTouch,
  enable: enableTouch,
  disable: disableTouch
};

export {
  magnify,
  magnifyTouchDrag
};
