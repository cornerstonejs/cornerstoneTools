import EVENTS from '../events.js';
import external from '../externalModules.js';
import { getBrowserInfo } from '../util/getMaxSimultaneousRequests.js';
import isMouseButtonEnabled from '../util/isMouseButtonEnabled.js';
import { setToolOptions, getToolOptions } from '../toolOptions.js';
import { clipToBox } from '../util/clip.js';
import { getNewContext, fillBox } from '../util/drawing.js';

const toolType = 'magnify';

let configuration = {
  magnifySize: 300,
  magnificationLevel: 5
};

let browserName;
let currentPoints;
let zoomCanvas;
let zoomElement;

/** Remove the magnifying glass when the mouse event ends */
function mouseUpCallback (e) {
  const eventData = e.detail;
  const element = eventData.element;

  element.removeEventListener(EVENTS.MOUSE_DRAG, dragCallback);
  element.removeEventListener(EVENTS.MOUSE_UP, mouseUpCallback);
  element.removeEventListener(EVENTS.MOUSE_CLICK, mouseUpCallback);
  hideTool(eventData);
}

function hideTool (eventData) {
  const element = eventData.element;

  element.querySelector('.magnifyTool').style.display = 'none';
  // Re-enable the mouse cursor
  document.body.style.cursor = 'default';
  removeZoomElement();
}

/** Draw the magnifying glass on mouseDown, and begin tracking mouse movements */
function mouseDownCallback (e) {
  const eventData = e.detail;
  const element = eventData.element;
  const options = getToolOptions(toolType, element);

  if (e.isTouchEvent || isMouseButtonEnabled(eventData.which, options.mouseButtonMask)) {
    element.addEventListener(EVENTS.MOUSE_DRAG, dragCallback);
    element.addEventListener(EVENTS.TOUCH_DRAG, dragCallback);
    element.addEventListener(EVENTS.MOUSE_UP, mouseUpCallback);
    element.addEventListener(EVENTS.TOUCH_END, mouseUpCallback);
    element.addEventListener(EVENTS.MOUSE_CLICK, mouseUpCallback);

    element.addEventListener(EVENTS.NEW_IMAGE, newImageCallback);

    // Ignore until next event
    drawZoomedElement(eventData);
    // On next frame
    window.requestAnimationFrame(() => drawMagnificationTool(eventData));

    e.preventDefault();
    e.stopPropagation();
  }
}

function newImageCallback (e) {
  const eventData = e.detail;

  eventData.currentPoints = currentPoints;
  drawMagnificationTool(eventData);
}

function dragEndCallback (e) {
  const eventData = e.detail;
  const element = eventData.element;

  element.removeEventListener(EVENTS.TOUCH_DRAG_END, dragEndCallback);
  element.removeEventListener(EVENTS.TOUCH_END, dragEndCallback);
  element.removeEventListener(EVENTS.NEW_IMAGE, newImageCallback);
  hideTool(eventData);
}

/** Drag callback is triggered by both the touch and mouse magnify tools */
function dragCallback (e) {
  const eventData = e.detail;
  const element = eventData.element;

  drawMagnificationTool(eventData);
  if (eventData.isTouchEvent === true) {
    element.addEventListener(EVENTS.TOUCH_DRAG_END, dragEndCallback);
    element.addEventListener(EVENTS.TOUCH_END, dragEndCallback);
  }

  e.preventDefault();
  e.stopPropagation();
}

function drawMagnificationTool (eventData) {
  const element = eventData.element;
  const magnifyCanvas = element.querySelector('.magnifyTool');

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
  const canvas = element.querySelector('canvas:not(.magnifyTool)');
  const context = getNewContext(magnifyCanvas);

  const getSize = magnifySize;

  // Calculate the on-canvas location of the mouse pointer / touch
  const canvasLocation = external.cornerstone.pixelToCanvas(eventData.element, eventData.currentPoints.image);

  clipToBox(canvasLocation, canvas);

  // Clear the rectangle
  context.clearRect(0, 0, magnifySize, magnifySize);

  // Fill it with the pixels that the mouse is clicking on
  const boundingBox = {
    left: 0,
    top: 0,
    width: magnifySize,
    height: magnifySize
  };

  fillBox(context, boundingBox, 'transparent');

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

  context.drawImage(zoomCanvas, copyFrom.x, copyFrom.y, getSize, getSize, 0, 0, getSize, getSize);

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
  if (element.querySelector('.magnifyTool') === null) {
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
  const magnifyCanvas = element.querySelector('.magnifyTool');

  if (magnifyCanvas) {
    element.removeChild(magnifyCanvas);
  }
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
  element.removeEventListener(EVENTS.MOUSE_DOWN, mouseDownCallback);
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
  setToolOptions(toolType, element, { mouseButtonMask });

  element.removeEventListener(EVENTS.MOUSE_DOWN, mouseDownCallback);

  element.addEventListener(EVENTS.MOUSE_DOWN, mouseDownCallback);
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
  element.removeEventListener(EVENTS.TOUCH_START, mouseDownCallback);
  element.addEventListener(EVENTS.TOUCH_START, mouseDownCallback);
}

// Disables the reference line tool for the given element
function disableTouch (element) {
  element.removeEventListener(EVENTS.TOUCH_START, mouseDownCallback);
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
